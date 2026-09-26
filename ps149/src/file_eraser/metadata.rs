use anyhow::{Context, Result};
use serde::Serialize;
use std::path::Path;
use tracing::info;
use windows::core::HSTRING;
use windows::Win32::Foundation::FILETIME;
use windows::Win32::Storage::FileSystem::{
    CreateFileW, DeleteFileW, MoveFileW, SetFileAttributesW, SetFileTime, FILE_ATTRIBUTE_NORMAL,
    FILE_FLAGS_AND_ATTRIBUTES, OPEN_EXISTING,
};

#[derive(Debug, Clone, Serialize)]
pub struct MetadataCleanseResult {
    pub timestamps_zeroed: bool,
    pub attributes_cleared: bool,
    pub filename_obfuscated: bool,
    pub rename_count: usize,
    pub deleted: bool,
}

/// SDelete-inspired metadata cleansing pipeline:
/// 1. Clear file attributes (remove read-only, hidden, system)
/// 2. Rename file repeatedly to overwrite MFT directory index entries
///    (uses variable-length names matching or exceeding original to fill $I30 slack)
/// 3. Truncate file to zero length
/// 4. Zero all timestamps LAST (after renames/truncation so Windows doesn't
///    overwrite our zeroed timestamps with current system time)
/// 5. Delete the file
pub fn cleanse_and_delete(path: &Path) -> Result<MetadataCleanseResult> {
    let mut result = MetadataCleanseResult {
        timestamps_zeroed: false,
        attributes_cleared: false,
        filename_obfuscated: false,
        rename_count: 0,
        deleted: false,
    };

    // Phase 1: Clear attributes
    let path_h = HSTRING::from(path.to_string_lossy().as_ref());
    match unsafe { SetFileAttributesW(&path_h, FILE_ATTRIBUTE_NORMAL) } {
        Ok(_) => result.attributes_cleared = true,
        Err(e) => info!("Could not clear attributes on {:?}: {}", path, e),
    }

    // Allow OS / Antivirus filter drivers to release recently flushed file handles
    std::thread::sleep(std::time::Duration::from_millis(60));

    // Phase 2: Filename obfuscation (enhanced SDelete technique)
    // Generate rename patterns that match or EXCEED the original filename length
    // to fully overwrite $I30 directory index slack and MFT $FILE_NAME entries.
    let parent = path.parent().unwrap_or(Path::new("."));
    let mut current_path = path.to_path_buf();

    let original_name_len = path
        .file_name()
        .map(|n| n.to_string_lossy().len())
        .unwrap_or(12);
    // Ensure rename is at least as long as the original (minimum 12 chars)
    let target_len = original_name_len.max(12);

    let rand_seed = rand::random::<u32>();
    let rename_patterns: Vec<String> = (0..5u32)
        .map(|i| {
            let prefix = (b'A' + (i as u8)) as char;
            let hex = format!("{:08x}", rand_seed ^ (0x11111111 * (i + 1)));
            // Pad with random hex chars to fill $I30 slack completely
            let base = format!("{}{}", prefix, hex);
            let padding_len = target_len.saturating_sub(base.len() + 4); // 4 for ".tmp"
            let padding: String = (0..padding_len)
                .map(|j| {
                    let b = ((rand_seed.wrapping_mul(j as u32 + i + 7)) & 0x0F) as u8;
                    if b < 10 { (b'0' + b) as char } else { (b'a' + b - 10) as char }
                })
                .collect();
            format!("{}{}.tmp", base, padding)
        })
        .collect();

    for pattern in &rename_patterns {
        let new_path = parent.join(pattern);
        let old_h = HSTRING::from(current_path.to_string_lossy().as_ref());
        let new_h = HSTRING::from(new_path.to_string_lossy().as_ref());

        let mut moved = false;
        for _ in 0..5 {
            if unsafe { MoveFileW(&old_h, &new_h) }.is_ok() {
                moved = true;
                result.rename_count += 1;
                current_path = new_path;
                break;
            }
            std::thread::sleep(std::time::Duration::from_millis(40));
        }

        if !moved {
            break;
        }
    }
    result.filename_obfuscated = result.rename_count >= 1;

    // Phase 3: Truncate file to zero length before final deletion
    let _ = crate::file_eraser::overwrite::truncate_file(&current_path);

    // Phase 4: Zero timestamps AFTER all renames and truncation.
    // CRITICAL: MoveFileW and truncate_file update $STANDARD_INFORMATION
    // timestamps to the current system time. Zeroing must happen LAST
    // so that the final MFT record has zeroed timestamps, not current ones.
    result.timestamps_zeroed = zero_timestamps(&current_path).is_ok();

    // Phase 5: Delete with sharing violation retry loop
    let final_h = HSTRING::from(current_path.to_string_lossy().as_ref());
    for _ in 0..8 {
        if unsafe { DeleteFileW(&final_h) }.is_ok() || std::fs::remove_file(&current_path).is_ok() || !current_path.exists() {
            result.deleted = true;
            break;
        }
        std::thread::sleep(std::time::Duration::from_millis(50));
    }

    if !result.deleted && path.exists() {
        let _ = std::fs::remove_file(path);
        result.deleted = !path.exists();
    }

    info!(
        "Metadata cleansed {:?}: timestamps={}, attrs={}, renames={} (len={}), deleted={}",
        path,
        result.timestamps_zeroed,
        result.attributes_cleared,
        result.rename_count,
        rename_patterns.first().map(|s| s.len()).unwrap_or(0),
        result.deleted
    );

    Ok(result)

}

fn zero_timestamps(path: &Path) -> Result<()> {
    let path_h = HSTRING::from(path.to_string_lossy().as_ref());
    let handle = match unsafe {
        CreateFileW(
            &path_h,
            windows::Win32::Storage::FileSystem::FILE_WRITE_ATTRIBUTES.0,
            windows::Win32::Storage::FileSystem::FILE_SHARE_READ
                | windows::Win32::Storage::FileSystem::FILE_SHARE_WRITE
                | windows::Win32::Storage::FileSystem::FILE_SHARE_DELETE,
            None,
            OPEN_EXISTING,
            FILE_FLAGS_AND_ATTRIBUTES(0),
            None,
        )
    } {
        Ok(h) if !h.is_invalid() => h,
        _ => return Ok(()),
    };

    // RAII guard ensuring handle is ALWAYS closed
    struct TimeHandleGuard(windows::Win32::Foundation::HANDLE);
    impl Drop for TimeHandleGuard {
        fn drop(&mut self) {
            unsafe {
                let _ = windows::Win32::Foundation::CloseHandle(self.0);
            }
        }
    }
    let _guard = TimeHandleGuard(handle);

    // FAT32 & NTFS compatible epoch timestamp (1980-01-01 00:00:00 UTC)
    // 119600 * 10^7 intervals of 100ns from 1601 to 1980
    let zero_time = FILETIME {
        dwLowDateTime: 0x24F9F000,
        dwHighDateTime: 0x01A8E79F,
    };

    unsafe {
        let _ = SetFileTime(
            handle,
            Some(&zero_time), // creation
            Some(&zero_time), // access
            Some(&zero_time), // modification
        );
    }

    Ok(())
}


/// Clean up an empty directory by obfuscating its name and removing it.
pub fn cleanse_and_delete_dir(path: &Path) -> Result<()> {
    let parent = path.parent().unwrap_or(Path::new("."));
    let mut current = path.to_path_buf();

    // Match or exceed original name length to overwrite $I30 slack
    let original_len = path
        .file_name()
        .map(|n| n.to_string_lossy().len())
        .unwrap_or(10);
    let target_len = original_len.max(10);

    let rand_seed = rand::random::<u32>();
    for i in 0..3u32 {
        let hex = format!("{:08x}", rand_seed ^ (0x22222222 * (i + 1)));
        let padding_len = target_len.saturating_sub(hex.len());
        let padding: String = (0..padding_len)
            .map(|j| {
                let b = ((rand_seed.wrapping_mul(j as u32 + i + 3)) & 0x0F) as u8;
                if b < 10 { (b'0' + b) as char } else { (b'a' + b - 10) as char }
            })
            .collect();
        let obfuscated_name = format!("{}{}", hex, padding);
        let new_path = parent.join(&obfuscated_name);
        let old_h = HSTRING::from(current.to_string_lossy().as_ref());
        let new_h = HSTRING::from(new_path.to_string_lossy().as_ref());
        if unsafe { MoveFileW(&old_h, &new_h) }.is_ok() {
            current = new_path;
        } else {
            break;
        }
    }

    std::fs::remove_dir(&current)
        .with_context(|| format!("Failed to remove directory {:?}", current))?;

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_cleanse_and_delete_dir() {
        let temp_base = std::env::temp_dir();
        let test_dir = temp_base.join(format!("ps149_test_cleanse_dir_{}", rand::random::<u32>()));
        std::fs::create_dir_all(&test_dir).expect("failed to create temp dir");
        assert!(test_dir.exists());

        let res = cleanse_and_delete_dir(&test_dir);
        assert!(res.is_ok());
        assert!(!test_dir.exists());
    }

    #[test]
    fn test_cleanse_and_delete_dir_nonexistent() {
        let temp_base = std::env::temp_dir();
        let test_dir = temp_base.join(format!("ps149_nonexistent_dir_{}", rand::random::<u32>()));
        let res = cleanse_and_delete_dir(&test_dir);
        assert!(res.is_err());
    }
}
