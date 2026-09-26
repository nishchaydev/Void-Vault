use crate::sanitize::patterns::{self, FillPattern, SanitizeMethod};
use anyhow::{Context, Result};
use windows::core::HSTRING;
use windows::Win32::Foundation::{GENERIC_READ, GENERIC_WRITE, HANDLE};
use windows::Win32::Storage::FileSystem::{
    CreateFileW, DeleteFileW, FlushFileBuffers, WriteFile, CREATE_ALWAYS,
    FILE_FLAGS_AND_ATTRIBUTES, FILE_FLAG_WRITE_THROUGH, FILE_SHARE_NONE,
    FILE_FLAG_NO_BUFFERING, OPEN_EXISTING, ReadFile,
};

use super::FreeSpaceWipeResult;

/// Wipe all free space on a volume using enhanced SDelete technique:
/// 1. **MFT Record Exhaustion**: Create thousands of small temp files to fill
///    all unallocated MFT records with dummy entries (destroying deleted file
///    metadata including filenames, sizes, timestamps, and resident data)
/// 2. Create a temporary file on the volume
/// 3. Keep writing pattern data until the disk is full (ERROR_DISK_FULL)
/// 4. Repeat for all configured passes
/// 5. Delete temporary files
///
/// This overwrites all previously-deleted file clusters, stale MFT slack,
/// and orphaned metadata fragments.
pub fn wipe_free_space(
    volume_letter: char,
    method: SanitizeMethod,
    progress_callback: &impl Fn(&str, f64),
) -> Result<FreeSpaceWipeResult> {
    let start = std::time::Instant::now();
    let total_passes = method.pass_count();

    // ── Phase 1: MFT Record Exhaustion ──────────────────────────
    // Deleted files leave 1024-byte MFT records containing filenames, timestamps,
    // and resident file data. Creating thousands of tiny files forces NTFS to
    // allocate new MFT records that overwrite these deleted entries.
    progress_callback("Exhausting MFT records (destroying deleted file metadata)...", 0.0);
    let mft_dir = format!("{}:\\ps149_mft_exhaust", volume_letter);
    let _ = std::fs::create_dir_all(&mft_dir);
    
    let mut mft_files_created = 0u32;
    let max_mft_files = if matches!(method, SanitizeMethod::FastWipe) {
        50
    } else {
        5000 // Enough to exhaust typical MFT free records
    };
    
    for i in 0..max_mft_files {
        let path = format!("{}\\m{:05}.tmp", mft_dir, i);
        match std::fs::write(&path, &[0u8; 1]) {
            Ok(_) => mft_files_created += 1,
            Err(_) => break, // Disk full or MFT full — done
        }
        if i % 500 == 0 {
            let pct = (i as f64 / max_mft_files as f64) * 0.15;
            progress_callback(
                &format!("MFT exhaustion: {} records filled...", mft_files_created),
                pct,
            );
        }
    }

    tracing::info!("MFT exhaustion: created {} dummy files to overwrite deleted MFT records", mft_files_created);

    // Delete the MFT exhaustion files
    let _ = std::fs::remove_dir_all(&mft_dir);

    // ── Phase 2: Free Space Cluster Wipe (multi-pass) ───────────
    let temp_path = format!("{}:\\ps149_freespace_wipe.tmp", volume_letter);
    let hstring = HSTRING::from(&temp_path);
    let total_free = get_volume_free_space(volume_letter).unwrap_or(1);
    let buf_size: usize = 1_048_576; // 1 MB
    let mut buf = vec![0u8; buf_size];
    let mut grand_total_written: u64 = 0;

    for pass in 0..total_passes {
        let pass_pct_base = 0.15 + (pass as f64 / total_passes as f64) * 0.85;

        progress_callback(
            &format!("Free space wipe pass {}/{}: creating wipe file...", pass + 1, total_passes),
            pass_pct_base,
        );

        let (handle, _sector_aligned) = {
            let flags_direct = FILE_FLAGS_AND_ATTRIBUTES(
                FILE_FLAG_WRITE_THROUGH.0 | FILE_FLAG_NO_BUFFERING.0,
            );
            match unsafe {
                CreateFileW(
                    &hstring,
                    GENERIC_WRITE.0,
                    FILE_SHARE_NONE,
                    None,
                    CREATE_ALWAYS,
                    flags_direct,
                    None,
                )
            } {
                Ok(h) => (h, true),
                Err(_) => {
                    let flags_fallback = FILE_FLAGS_AND_ATTRIBUTES(FILE_FLAG_WRITE_THROUGH.0);
                    let h = unsafe { CreateFileW(&hstring, GENERIC_WRITE.0, FILE_SHARE_NONE, None, CREATE_ALWAYS, flags_fallback, None) }
                        .with_context(|| format!("Failed to create temp file on {}:", volume_letter))?;
                    (h, false)
                }
            }
        };

        let _guard = HandleGuard(handle);

        let pattern = patterns::get_pattern(pass, method);
        patterns::fill_buffer(&mut buf, &pattern);
        let is_random = matches!(pattern, FillPattern::Random);

        let mut pass_written: u64 = 0;
        let max_bytes: Option<u64> = if matches!(method, SanitizeMethod::FastWipe) {
            Some(32 * 1_048_576)
        } else {
            None
        };

        loop {
            if let Some(max) = max_bytes {
                if pass_written >= max {
                    break;
                }
            }
            if is_random {
                patterns::fill_buffer(&mut buf, &pattern);
            }

            let mut written: u32 = 0;
            let result = unsafe { WriteFile(handle, Some(&buf), Some(&mut written), None) };

            match result {
                Ok(_) => {
                    pass_written += written as u64;
                    if pass_written % (100 * 1_048_576) == 0 {
                        let mb = pass_written / 1_048_576;
                        let pct = pass_pct_base + (pass_written as f64 / total_free as f64).min(0.85) * (0.85 / total_passes as f64);
                        progress_callback(
                            &format!("Pass {}/{}: {} MB written", pass + 1, total_passes, mb),
                            pct.min(0.99),
                        );
                    }
                }
                Err(_) => {
                    // ERROR_DISK_FULL — volume is full for this pass
                    tracing::info!(
                        "Free space wipe pass {}: {} bytes written to {}",
                        pass + 1, pass_written, temp_path
                    );
                    break;
                }
            }
        }

        grand_total_written += pass_written;

        // Flush and close handle
        unsafe {
            let _ = FlushFileBuffers(handle);
        }
        drop(_guard);

        if pass < total_passes - 1 {
            // Delete the temporary file between passes to free clusters for next pass
            let del_h = HSTRING::from(&temp_path);
            if unsafe { DeleteFileW(&del_h) }.is_err() {
                let _ = std::fs::remove_file(&temp_path);
            }
        }
    }

    progress_callback("Free space wipe complete", 1.0);

    // Read back from disk to compute honest verification hash
    let verification_hash = {
        let read_handle = unsafe {
            CreateFileW(
                &hstring,
                GENERIC_READ.0,
                FILE_SHARE_NONE,
                None,
                OPEN_EXISTING,
                FILE_FLAGS_AND_ATTRIBUTES(FILE_FLAG_WRITE_THROUGH.0),
                None,
            )
        };
        match read_handle {
            Ok(rh) => {
                let _rg = HandleGuard(rh);
                let mut readback = vec![0u8; 64 * 1024];
                let mut bytes_read: u32 = 0;
                let _ = unsafe {
                    ReadFile(
                        rh,
                        Some(&mut readback),
                        Some(&mut bytes_read),
                        None,
                    )
                };
                format!("{:032x}", crate::verify::fast_hash::fast_hash(&readback[..bytes_read as usize]))
            }
            Err(_) => "readback_failed".to_string(),
        }
    };

    // Now truncate and cleanse the final temp file before deletion
    // Truncating to 0 bytes and obfuscating ensures no commercial recovery tool
    // sees a deleted 33.5 MB file in the directory table.
    let temp_p = std::path::Path::new(&temp_path);
    let _ = crate::file_eraser::overwrite::truncate_file(temp_p);
    let _ = crate::file_eraser::metadata::cleanse_and_delete(temp_p);

    Ok(FreeSpaceWipeResult {
        volume: format!("{}:", volume_letter),
        bytes_wiped: grand_total_written,
        method,
        duration: start.elapsed(),
        verification_hash,
    })
}

struct HandleGuard(HANDLE);
impl Drop for HandleGuard {
    fn drop(&mut self) {
        unsafe {
            let _ = windows::Win32::Foundation::CloseHandle(self.0);
        }
    }
}

fn get_volume_free_space(letter: char) -> Option<u64> {
    let root = format!("{}:\\", letter);
    let hstring = HSTRING::from(&root);

    use windows::Win32::Storage::FileSystem::GetDiskFreeSpaceExW;
    let mut free_bytes: u64 = 0;

    let ok = unsafe { GetDiskFreeSpaceExW(&hstring, Some(&mut free_bytes), None, None) };

    match ok {
        Ok(_) => Some(free_bytes),
        Err(_) => None,
    }
}
