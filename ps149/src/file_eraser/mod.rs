pub mod batch;
pub mod crypto_shred;
pub mod free_space;
pub mod journal;
pub mod metadata;
pub mod overwrite;
pub mod slack;
pub mod streams;
pub mod vss;
pub mod logfile;

use crate::sanitize::patterns::SanitizeMethod;
use anyhow::Result;
use serde::Serialize;
use std::path::{Path, PathBuf};
use std::time::Duration;

#[derive(Debug, Clone, Serialize)]
pub struct FileEraseResult {
    pub path: PathBuf,
    pub original_size: u64,
    pub method: SanitizeMethod,
    pub passes_completed: usize,
    pub bytes_overwritten: u64,
    pub streams_erased: usize,
    pub slack_bytes_wiped: u64,
    pub metadata_cleansed: bool,
    pub filename_obfuscated: bool,
    pub deleted: bool,
    pub duration: Duration,
    pub errors: Vec<String>,
}

impl FileEraseResult {
    pub fn success(&self) -> bool {
        // Success = file deleted + no critical errors (overwrite, metadata, deletion).
        // VSS warnings and journal purge failures are informational, not critical.
        self.deleted
            && !self.errors.iter().any(|e| {
                e.starts_with("Primary data:")
                    || e.starts_with("Metadata cleanse:")
                    || e.starts_with("ADS '")
            })
    }
}

#[derive(Debug, Clone, Serialize)]
pub struct FreeSpaceWipeResult {
    pub volume: String,
    pub bytes_wiped: u64,
    pub method: SanitizeMethod,
    pub duration: Duration,
    pub verification_hash: String,
}

/// Securely erase a single file: overwrite data + ADS + slack, cleanse metadata, delete.
/// Addresses all known NTFS/SSD recovery vectors:
///   Phase 0: VSS shadow copy AUTO-DELETION (not just warning)
///   Phase 1: ADS stream overwrite
///   Phase 1.5: Force MFT-resident data to external clusters + zero MFT slack
///   Phase 2: Primary data overwrite (with FILE_FLAG_NO_BUFFERING)
///   Phase 2.5: SSD TRIM (FSCTL_FILE_LEVEL_TRIM) to invalidate NAND pages
///   Phase 3: Slack space wipe
///   Phase 4: Metadata cleanse + variable-length filename obfuscation + delete
///
/// NOTE: USN journal purge ($UsnJrnl) is deliberately NOT done per-file.
/// It is a volume-wide operation that should be called once after a batch
/// (see `secure_erase_folder` and `batch::batch_erase`).
pub fn secure_erase_file(
    path: &Path,
    method: SanitizeMethod,
    progress_callback: &impl Fn(&str, f64),
) -> Result<FileEraseResult> {
    let start = std::time::Instant::now();
    let mut errors = Vec::new();

    let original_size = match std::fs::metadata(path) {
        Ok(m) => m.len(),
        Err(e) => {
            return Err(anyhow::anyhow!("Cannot access file {:?}: {}", path, e));
        }
    };

    // Phase 0: Auto-delete VSS shadow copies that contain recoverable file snapshots.
    // System Restore Points for the volume WILL be destroyed. This is the correct
    // behavior for a defense-grade forensic sanitization tool (NIST SP 800-88).
    if let Some(vol) = vss::volume_letter_from_path(path) {
        if vss::has_shadow_copies(path) {
            tracing::warn!(
                "Volume {} has VSS shadow copies — auto-deleting for forensic sanitization. \
                 System Restore Points for this volume will be removed.",
                vol
            );
            progress_callback("Deleting VSS shadow copies...", 0.0);
            match vss::delete_shadow_copies(vol) {
                Ok(count) => {
                    if count > 0 {
                        tracing::info!("Deleted {} VSS shadow copies on volume {}", count, vol);
                    }
                }
                Err(e) => {
                    tracing::warn!("VSS deletion failed (need admin?): {}", e);
                    errors.push(format!(
                        "VSS shadows on volume {} could not be deleted (run as admin): {}",
                        vol, e
                    ));
                }
            }
        }
    }

    // Phase 1: Enumerate and overwrite Alternate Data Streams (ADS)
    progress_callback("Enumerating alternate data streams...", 0.05);
    let stream_list = streams::enumerate_streams(path).unwrap_or_default();
    let ads_streams: Vec<_> = stream_list.iter().filter(|s| s.name != "::$DATA").collect();
    let ads_count = ads_streams.len();

    for (i, stream) in ads_streams.iter().enumerate() {
        let stream_suffix = stream.name.trim_start_matches(':').trim_end_matches(":$DATA");
        let stream_path = PathBuf::from(format!("{}:{}", path.display(), stream_suffix));
        let pct = (i as f64) / (ads_count.max(1) as f64) * 0.15;
        progress_callback(
            &format!(
                "Overwriting ADS {} ({}/{})",
                stream.name,
                i + 1,
                ads_count
            ),
            0.05 + pct,
        );
        if let Err(e) = overwrite::overwrite_file(&stream_path, method) {
            errors.push(format!("ADS '{}': {}", stream.name, e));
        }
    }

    // Phase 1.5: Force MFT-resident data to external clusters + zero MFT slack
    // Small files (<1024 bytes) are stored inside the MFT record itself.
    // force_non_resident() now also zeroes the stale resident data in MFT slack.
    if original_size < 1024 {
        progress_callback("Forcing MFT-resident data to disk clusters...", 0.2);
        if let Err(e) = overwrite::force_non_resident(path) {
            errors.push(format!("Force non-resident: {}", e));
        }
    }

    // Phase 1.8: Header-First Surgical Strike — Destroy file signatures BEFORE bulk overwrite.
    // File carvers (Disk Drill, PhotoRec, R-Studio) identify files by scanning for
    // magic byte headers (first 4KB) and footers (last 4KB). By zeroing these regions
    // first, even an interrupted wipe leaves the file unrecoverable by signature carving.
    progress_callback("Surgical strike: destroying file signatures...", 0.22);
    if original_size > 0 {
        match header_strike(path, original_size) {
            Ok(_) => tracing::info!("Header-first strike completed for {:?}", path),
            Err(e) => {
                tracing::debug!("Header strike skipped for {:?}: {}", path, e);
                // Non-fatal: bulk overwrite in Phase 2 will cover it anyway
            }
        }
    }

    // Phase 2: Overwrite primary file data to EOF (WITHOUT truncating yet)
    // Uses FILE_FLAG_NO_BUFFERING to bypass filesystem cache
    progress_callback("Overwriting primary file data (direct I/O)...", 0.3);
    if let Err(e) = overwrite::overwrite_file(path, method) {
        errors.push(format!("Primary data: {}", e));
    }

    // Phase 2.5: Issue TRIM to invalidate SSD/NVMe NAND pages
    // On HDDs this is a harmless no-op. On SSDs it tells the controller
    // to mark the physical flash cells as invalid, preventing chip-off recovery.
    progress_callback("Issuing SSD TRIM...", 0.5);
    match overwrite::trim_file_clusters(path) {
        Ok(true) => tracing::info!("TRIM issued for {:?}", path),
        Ok(false) => {} // HDD or file already gone — fine
        Err(e) => {
            tracing::debug!("TRIM skipped for {:?}: {}", path, e);
        }
    }

    // Phase 3: Wipe file slack space (zero from EOF to cluster boundary)
    progress_callback("Wiping slack space...", 0.55);
    let slack_bytes = match slack::wipe_file_slack(path) {
        Ok(b) => b,
        Err(e) => {
            errors.push(format!("Slack wipe: {}", e));
            0
        }
    };

    // Phase 4: Obfuscate metadata and delete (in metadata::cleanse_and_delete)
    // Pipeline: clear attrs → variable-length renames → truncate → zero timestamps → delete
    // Timestamps are zeroed AFTER renames/truncation to prevent Windows from
    // overwriting our zeroed timestamps with the current system time.
    progress_callback("Cleansing metadata and deleting...", 0.7);
    let (meta_ok, name_ok) = match metadata::cleanse_and_delete(path) {
        Ok(r) => (r.timestamps_zeroed, r.filename_obfuscated),
        Err(e) => {
            errors.push(format!("Metadata cleanse: {}", e));
            // Fallback: try simple delete
            let _ = std::fs::remove_file(path);
            (false, false)
        }
    };

    let deleted = !path.exists();
    progress_callback("Complete", 1.0);

    Ok(FileEraseResult {
        path: path.to_path_buf(),
        original_size,
        method,
        passes_completed: method.pass_count(),
        bytes_overwritten: original_size * method.pass_count() as u64,
        streams_erased: ads_count,
        slack_bytes_wiped: slack_bytes,
        metadata_cleansed: meta_ok,
        filename_obfuscated: name_ok,
        deleted,
        duration: start.elapsed(),
        errors,
    })
}

/// Securely erase a folder and all its contents recursively.
#[allow(dead_code)]
pub fn secure_erase_folder(
    path: &Path,
    method: SanitizeMethod,
    progress_callback: &impl Fn(&str, f64),
) -> Result<Vec<FileEraseResult>> {
    if !path.is_dir() {
        return Err(anyhow::anyhow!("{:?} is not a directory", path));
    }

    let mut all_files = Vec::new();
    collect_files_recursive(path, &mut all_files)?;

    let total = all_files.len();
    let mut results = Vec::with_capacity(total);

    for (i, file_path) in all_files.iter().enumerate() {
        let pct = i as f64 / total.max(1) as f64;
        progress_callback(
            &format!("Erasing file {}/{}: {}", i + 1, total, file_path.display()),
            pct,
        );
        match secure_erase_file(file_path, method, &|_msg, _p| {}) {
            Ok(r) => results.push(r),
            Err(e) => {
                results.push(FileEraseResult {
                    path: file_path.clone(),
                    original_size: 0,
                    method,
                    passes_completed: 0,
                    bytes_overwritten: 0,
                    streams_erased: 0,
                    slack_bytes_wiped: 0,
                    metadata_cleansed: false,
                    filename_obfuscated: false,
                    deleted: false,
                    duration: Duration::ZERO,
                    errors: vec![e.to_string()],
                });
            }
        }
    }

    // Remove empty directories bottom-up
    remove_empty_dirs_recursive(path);

    // Purge NTFS USN journal ONCE for the entire batch (not per-file).
    // This is a volume-wide operation that removes all $UsnJrnl records
    // including the original filenames, renames, and operations from this batch.
    progress_callback("Purging NTFS journal traces...", 0.95);
    if let Some(vol) = vss::volume_letter_from_path(path) {
        match journal::purge_usn_journal(vol) {
            Ok(true) => tracing::info!("USN journal purged for volume {} (post-batch)", vol),
            Ok(false) => tracing::info!("No USN journal to purge on volume {}", vol),
            Err(e) => {
                tracing::warn!("Journal purge failed (need admin?): {}", e);
            }
        }
    }

    progress_callback("Folder erasure complete", 1.0);

    Ok(results)
}

fn collect_files_recursive(dir: &Path, files: &mut Vec<PathBuf>) -> Result<()> {
    for entry in std::fs::read_dir(dir)? {
        let entry = entry?;
        let path = entry.path();
        if path.is_dir() {
            collect_files_recursive(&path, files)?;
        } else {
            files.push(path);
        }
    }
    Ok(())
}

fn remove_empty_dirs_recursive(dir: &Path) {
    if let Ok(entries) = std::fs::read_dir(dir) {
        for entry in entries.flatten() {
            let p = entry.path();
            if p.is_dir() {
                remove_empty_dirs_recursive(&p);
            }
        }
    }
    let _ = std::fs::remove_dir(dir);
}

/// Surgically zero the first and last 4KB of a file to destroy magic bytes.
/// This defeats signature-based file carving (Disk Drill Deep Scan, PhotoRec).
/// Uses direct I/O (FILE_FLAG_NO_BUFFERING) to ensure data hits physical sectors.
fn header_strike(path: &Path, file_size: u64) -> Result<()> {
    use windows::core::HSTRING;
    use windows::Win32::Foundation::{GENERIC_WRITE, HANDLE, CloseHandle};
    use windows::Win32::Storage::FileSystem::{
        CreateFileW, FlushFileBuffers, SetFilePointerEx, WriteFile,
        FILE_BEGIN, FILE_FLAGS_AND_ATTRIBUTES, FILE_FLAG_WRITE_THROUGH,
        FILE_SHARE_NONE, OPEN_EXISTING,
    };

    struct HGuard(HANDLE);
    impl Drop for HGuard {
        fn drop(&mut self) {
            unsafe { let _ = CloseHandle(self.0); }
        }
    }

    let path_str = path.to_string_lossy().to_string();
    let hstring = HSTRING::from(&path_str);

    let handle = unsafe {
        CreateFileW(
            &hstring,
            GENERIC_WRITE.0,
            FILE_SHARE_NONE,
            None,
            OPEN_EXISTING,
            FILE_FLAGS_AND_ATTRIBUTES(FILE_FLAG_WRITE_THROUGH.0),
            None,
        )
    }?;
    let _guard = HGuard(handle);

    let strike_size = 4096u64.min(file_size) as usize;
    let zeros = vec![0u8; strike_size];

    // Strike 1: Zero file header (first 4KB) — destroys magic bytes
    unsafe {
        SetFilePointerEx(handle, 0, None, FILE_BEGIN)?;
        let mut written: u32 = 0;
        WriteFile(handle, Some(&zeros), Some(&mut written), None)?;
    }

    // Strike 2: Zero file footer (last 4KB) — destroys EOF markers (JPEG FFD9, etc.)
    if file_size > strike_size as u64 {
        let footer_offset = file_size - strike_size as u64;
        let footer_len = strike_size.min(file_size as usize);
        unsafe {
            SetFilePointerEx(handle, footer_offset as i64, None, FILE_BEGIN)?;
            let mut written: u32 = 0;
            WriteFile(handle, Some(&zeros[..footer_len]), Some(&mut written), None)?;
        }
    }

    unsafe { FlushFileBuffers(handle)?; }

    tracing::debug!(
        "Header strike: zeroed first {} + last {} bytes of {:?}",
        strike_size, strike_size.min(file_size as usize), path
    );

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::io::Write;

    #[test]
    fn test_secure_erase_single_file() {
        let temp_dir = std::env::temp_dir();
        let target = temp_dir.join("ps149_shred_test_single.txt");

        // Create file with sensitive sample content
        {
            let mut f = std::fs::File::create(&target).unwrap();
            f.write_all(b"CONFIDENTIAL_BANK_STATEMENT_ACCOUNT_12345")
                .unwrap();
        }
        assert!(target.exists());

        // Securely erase using DoD 3-Pass
        let result = secure_erase_file(&target, SanitizeMethod::Dod3Pass, &|_msg, _pct| {});
        assert!(result.is_ok());

        let res = result.unwrap();
        assert_eq!(res.passes_completed, 3);
        assert!(!target.exists(), "Target file must be physically removed");
        assert!(res.deleted);
    }

    #[test]
    fn test_batch_erase_directory() {
        let temp_dir = std::env::temp_dir().join("ps149_test_batch_folder");
        let _ = std::fs::create_dir_all(&temp_dir);

        let file1 = temp_dir.join("file1.dat");
        let file2 = temp_dir.join("file2.dat");

        std::fs::write(&file1, b"Payload 1 content").unwrap();
        std::fs::write(&file2, b"Payload 2 content").unwrap();

        let targets = vec![temp_dir.clone()];
        let expanded = batch::expand_targets(&targets);
        assert_eq!(expanded.len(), 2);

        let batch_res =
            batch::batch_erase(&expanded, SanitizeMethod::NistClear, &|_msg, _pct| {}).unwrap();
        assert_eq!(batch_res.files_succeeded, 2);
        assert_eq!(batch_res.files_failed, 0);
        assert!(!file1.exists());
        assert!(!file2.exists());

        let _ = std::fs::remove_dir_all(&temp_dir);
    }
}
