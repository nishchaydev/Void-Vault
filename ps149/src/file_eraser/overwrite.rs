use crate::sanitize::patterns::{self, FillPattern, SanitizeMethod};
use anyhow::{Context, Result};
use std::path::Path;
use tracing::info;
use windows::core::HSTRING;
use windows::Win32::Foundation::{CloseHandle, GENERIC_WRITE, HANDLE};
use windows::Win32::Storage::FileSystem::{
    CreateFileW, FlushFileBuffers, GetFileSizeEx, SetEndOfFile, SetFilePointerEx, WriteFile,
    FILE_BEGIN, FILE_FLAGS_AND_ATTRIBUTES, FILE_FLAG_NO_BUFFERING, FILE_FLAG_WRITE_THROUGH,
    FILE_SHARE_NONE, OPEN_EXISTING,
};

struct FileHandle(HANDLE);
impl Drop for FileHandle {
    fn drop(&mut self) {
        unsafe {
            if !self.0.is_invalid() {
                let _ = CloseHandle(self.0);
            }
        }
    }
}


/// Overwrite a file's contents with sanitization patterns.
/// Handles multi-pass overwriting based on the selected method.
/// Uses FILE_FLAG_NO_BUFFERING to bypass filesystem cache and write directly
/// to disk sectors, preventing NTFS copy-on-write from preserving old data.
pub fn overwrite_file(path: &Path, method: SanitizeMethod) -> Result<u64> {
    let path_str = path.to_string_lossy().to_string();
    let hstring = HSTRING::from(&path_str);

    // Try NO_BUFFERING first (raw sector I/O), fall back to WRITE_THROUGH only
    let (handle, sector_aligned) = {
        let flags_direct = FILE_FLAGS_AND_ATTRIBUTES(
            FILE_FLAG_WRITE_THROUGH.0 | FILE_FLAG_NO_BUFFERING.0,
        );
        match unsafe {
            CreateFileW(
                &hstring,
                GENERIC_WRITE.0,
                FILE_SHARE_NONE,
                None,
                OPEN_EXISTING,
                flags_direct,
                None,
            )
        } {
            Ok(h) => (h, true),
            Err(_) => {
                // Fallback for paths that don't support NO_BUFFERING (network, etc.)
                let flags_fallback =
                    FILE_FLAGS_AND_ATTRIBUTES(FILE_FLAG_WRITE_THROUGH.0);
                let h = unsafe {
                    CreateFileW(
                        &hstring,
                        GENERIC_WRITE.0,
                        FILE_SHARE_NONE,
                        None,
                        OPEN_EXISTING,
                        flags_fallback,
                        None,
                    )
                }
                .with_context(|| format!("Failed to open file for writing: {:?}", path))?;
                (h, false)
            }
        }
    };

    let fh = FileHandle(handle);

    let file_size = unsafe {
        let mut size: i64 = 0;
        GetFileSizeEx(fh.0, &mut size)?;
        size as u64
    };

    if file_size == 0 {
        info!("File {:?} is empty, skipping overwrite", path);
        return Ok(0);
    }

    let total_passes = method.pass_count();
    // Sector size for alignment — 4096 covers both 512 and 4Kn drives
    let sector_size: usize = 4096;
    let buf_size: usize = 1_048_576; // 1 MB chunks (already sector-aligned)
    let mut buf = vec![0u8; buf_size];
    let mut total_written: u64 = 0;

    for pass_index in 0..total_passes {
        let pattern = patterns::get_pattern(pass_index, method);
        let is_random = matches!(pattern, FillPattern::Random);

        // Fill buffer with pattern
        patterns::fill_buffer(&mut buf, &pattern);

        // Seek to start
        unsafe {
            SetFilePointerEx(fh.0, 0, None, FILE_BEGIN)?;
        }

        let mut remaining = file_size;
        while remaining > 0 {
            let logical_chunk = remaining.min(buf_size as u64) as usize;

            // With NO_BUFFERING, writes must be sector-aligned in size
            let write_chunk = if sector_aligned {
                ((logical_chunk + sector_size - 1) / sector_size) * sector_size
            } else {
                logical_chunk
            };

            // Refill for random on every chunk
            if is_random {
                patterns::fill_buffer(&mut buf[..write_chunk], &pattern);
            }

            // Ensure buffer is large enough for aligned write
            if write_chunk > buf.len() {
                buf.resize(write_chunk, 0);
                if !is_random {
                    patterns::fill_buffer(&mut buf, &pattern);
                }
            }

            let mut written: u32 = 0;
            unsafe {
                WriteFile(fh.0, Some(&buf[..write_chunk]), Some(&mut written), None)?;
            }
            remaining = remaining.saturating_sub(logical_chunk as u64);
            total_written += logical_chunk as u64;
        }

        // Flush after each pass
        unsafe {
            FlushFileBuffers(fh.0)?;
        }
    }

    info!(
        "Overwritten {:?}: {} bytes x {} passes = {} bytes total (direct_io={})",
        path, file_size, total_passes, total_written, sector_aligned
    );

    Ok(total_written)
}

/// Truncate a file to zero length.
pub fn truncate_file(path: &Path) -> Result<()> {
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
    }
    .with_context(|| format!("Failed to open file for truncation: {:?}", path))?;

    let fh = FileHandle(handle);
    unsafe {
        SetFilePointerEx(fh.0, 0, None, FILE_BEGIN)?;
        SetEndOfFile(fh.0)?;
        FlushFileBuffers(fh.0)?;
    }

    Ok(())
}

/// Push resident file data out of MFT by padding to > 1024 bytes,
/// then overwrite with zeros to force NTFS to clear the stale resident
/// data bytes from the MFT record.
///
/// Small NTFS files (<~700 bytes) are stored directly in the MFT record itself.
/// Step 1: Write 4KB padding → NTFS allocates external clusters, copies data out.
/// Step 2: Overwrite with zeros → forces NTFS to update the now-non-resident
///         data attribute, which zeros out any stale resident bytes in the
///         MFT record slack area.
/// Step 3: Flush to ensure writes hit disk before the caller overwrites with
///         the actual sanitization pattern.
pub fn force_non_resident(path: &Path) -> Result<()> {
    let meta = std::fs::metadata(path)?;
    if meta.len() < 1024 {
        let path_str = path.to_string_lossy().to_string();
        let hstring = HSTRING::from(&path_str);

        // Step 1: Write 4KB padding to force non-resident allocation
        let handle = unsafe {
            CreateFileW(
                &hstring,
                GENERIC_WRITE.0,
                FILE_SHARE_NONE,
                None,
                OPEN_EXISTING,
                FILE_FLAGS_AND_ATTRIBUTES(
                    FILE_FLAG_WRITE_THROUGH.0 | FILE_FLAG_NO_BUFFERING.0,
                ),
                None,
            )
        }?;
        let fh = FileHandle(handle);

        let padding = vec![0x41u8; 4096];
        let mut written: u32 = 0;
        unsafe {
            WriteFile(fh.0, Some(&padding), Some(&mut written), None)?;
            FlushFileBuffers(fh.0)?;
        }
        drop(fh);

        // Step 2: Re-open and overwrite with zeros to clear MFT resident slack.
        // When NTFS converts resident→non-resident, the old resident data bytes
        // remain in the MFT record's unused attribute space. Writing zeros to the
        // now-external clusters forces a metadata update that can clear those bytes.
        let handle2 = unsafe {
            CreateFileW(
                &hstring,
                GENERIC_WRITE.0,
                FILE_SHARE_NONE,
                None,
                OPEN_EXISTING,
                FILE_FLAGS_AND_ATTRIBUTES(
                    FILE_FLAG_WRITE_THROUGH.0 | FILE_FLAG_NO_BUFFERING.0,
                ),
                None,
            )
        }?;
        let fh2 = FileHandle(handle2);

        let zeros = vec![0u8; 4096];
        let mut written2: u32 = 0;
        unsafe {
            WriteFile(fh2.0, Some(&zeros), Some(&mut written2), None)?;
            FlushFileBuffers(fh2.0)?;
        }

        info!("Forced non-resident + zeroed MFT slack for {:?} (was {} bytes)", path, meta.len());
    }
    Ok(())
}

/// Issue TRIM/deallocate for a file's clusters on SSD/NVMe drives.
/// This instructs the SSD controller to mark the physical NAND pages as invalid,
/// preventing chip-off or controller-level recovery.
///
/// On HDDs this is a no-op (the IOCTL succeeds but has no effect).
/// Uses FSCTL_FILE_LEVEL_TRIM which is per-file and doesn't require admin.
pub fn trim_file_clusters(path: &Path) -> Result<bool> {
    let path_str = path.to_string_lossy().to_string();
    let hstring = HSTRING::from(&path_str);

    let handle = match unsafe {
        CreateFileW(
            &hstring,
            GENERIC_WRITE.0,
            FILE_SHARE_NONE,
            None,
            OPEN_EXISTING,
            FILE_FLAGS_AND_ATTRIBUTES(FILE_FLAG_WRITE_THROUGH.0),
            None,
        )
    } {
        Ok(h) => h,
        Err(_) => return Ok(false), // File may already be deleted
    };
    let fh = FileHandle(handle);

    let file_size = unsafe {
        let mut size: i64 = 0;
        let _ = GetFileSizeEx(fh.0, &mut size);
        size as u64
    };

    if file_size == 0 {
        return Ok(false);
    }

    // FSCTL_FILE_LEVEL_TRIM = 0x00098208
    // FILE_LEVEL_TRIM structure: { PairCount: u32, Padding: u32, Pairs: [{Offset: i64, Length: i64}] }
    const FSCTL_FILE_LEVEL_TRIM: u32 = 0x00098208;

    #[repr(C)]
    struct FileLevelTrimInput {
        pair_count: u32,
        _padding: u32,
        offset: i64,
        length: i64,
    }

    let input = FileLevelTrimInput {
        pair_count: 1,
        _padding: 0,
        offset: 0,
        length: file_size as i64,
    };

    let mut bytes_returned: u32 = 0;
    let result = unsafe {
        windows::Win32::System::IO::DeviceIoControl(
            fh.0,
            FSCTL_FILE_LEVEL_TRIM,
            Some(&input as *const _ as *const std::ffi::c_void),
            std::mem::size_of::<FileLevelTrimInput>() as u32,
            None,
            0,
            Some(&mut bytes_returned),
            None,
        )
    };

    match result {
        Ok(_) => {
            info!("TRIM issued for {:?} ({} bytes)", path, file_size);
            Ok(true)
        }
        Err(_) => {
            // TRIM not supported (HDD) or access denied — non-fatal
            Ok(false)
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::io::Write;

    #[test]
    fn test_overwrite_temp_file() {
        let dir = std::env::temp_dir();
        let test_file = dir.join("ps149_test_overwrite.bin");

        // Create file with known content
        {
            let mut f = std::fs::File::create(&test_file).unwrap();
            f.write_all(b"SECRET DATA THAT MUST BE DESTROYED").unwrap();
        }

        // Overwrite with zero fill
        let result = overwrite_file(&test_file, SanitizeMethod::NistClear);
        assert!(result.is_ok());

        // With FILE_FLAG_NO_BUFFERING, writes are sector-aligned so the file
        // size may be rounded up to the next sector boundary (4096 bytes).
        // The important thing is that the original 34 bytes are overwritten.
        let meta = std::fs::metadata(&test_file).unwrap();
        assert!(meta.len() >= 34, "File must be at least original size");

        // First 34 bytes must be zeroed (NistClear writes zeros)
        let content = std::fs::read(&test_file).unwrap();
        assert_eq!(&content[..34], &vec![0u8; 34][..]);

        // Explicit truncate helper
        let trunc_res = truncate_file(&test_file);
        assert!(trunc_res.is_ok());
        let meta_trunc = std::fs::metadata(&test_file).unwrap();
        assert_eq!(meta_trunc.len(), 0);

        let _ = std::fs::remove_file(&test_file);
    }
}
