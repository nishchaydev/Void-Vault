//! Recycle Bin metadata cleanup — removes `$I`/`$R` file pairs from
//! `$Recycle.Bin` that contain metadata about shredded files.
//!
//! When a file is sent to the Recycle Bin, Windows creates:
//! - `$I<random>.<ext>` — metadata file containing original path, deletion
//!   timestamp, and file size (the "info" file)
//! - `$R<random>.<ext>` — the actual file data (the "recovery" file)
//!
//! Even if the `$R` file is shredded, the `$I` file retains the original
//! filename, full path, and deletion timestamp — recovery tools read these.
//!
//! `$I` file format (Windows 10/11, version 2):
//! - Bytes 0..8: Version (u64 LE, value = 2)
//! - Bytes 8..16: Original file size (u64 LE)
//! - Bytes 16..24: Deletion FILETIME (u64 LE)
//! - Bytes 24..28: Path length in chars (u32 LE)
//! - Bytes 28..: Original path (UTF-16LE string)

use anyhow::Result;
use std::path::PathBuf;

/// Clean Recycle Bin `$I`/`$R` pairs for files matching target paths.
///
/// Scans all `$Recycle.Bin\<SID>\` directories on accessible volumes.
/// For each `$I` file, reads the embedded original path. If it matches
/// any target path, deletes both the `$I` and corresponding `$R` file.
///
/// Returns the number of pairs cleaned.
pub fn clean_recycle_bin(target_paths: &[String]) -> Result<u32> {
    if target_paths.is_empty() {
        return Ok(0);
    }

    let mut cleaned = 0u32;

    // Scan Recycle Bin on each volume letter
    for letter in b'C'..=b'Z' {
        let vol = letter as char;
        let recycle_base = format!("{}:\\$Recycle.Bin", vol);
        let recycle_path = PathBuf::from(&recycle_base);

        if !recycle_path.exists() {
            continue;
        }

        // Iterate SID subdirectories
        let sid_dirs = match std::fs::read_dir(&recycle_path) {
            Ok(d) => d,
            Err(_) => continue, // Access denied — common for other users' bins
        };

        for sid_entry in sid_dirs.flatten() {
            let sid_dir = sid_entry.path();
            if !sid_dir.is_dir() {
                continue;
            }

            let files = match std::fs::read_dir(&sid_dir) {
                Ok(f) => f,
                Err(_) => continue,
            };

            for file_entry in files.flatten() {
                let path = file_entry.path();
                let name = match path.file_name().and_then(|n| n.to_str()) {
                    Some(n) => n.to_string(),
                    None => continue,
                };

                // Only process $I files (metadata)
                if !name.starts_with("$I") {
                    continue;
                }

                // Try to read the original path from the $I file
                match read_i_file_path(&path) {
                    Ok(original_path) => {
                        let original_lower = original_path.to_lowercase();
                        let matches = target_paths
                            .iter()
                            .any(|t| original_lower.contains(t) || t.contains(&original_lower));

                        if matches {
                            // Delete the $I file
                            if let Err(e) = std::fs::remove_file(&path) {
                                tracing::warn!("Could not delete $I file {:?}: {}", path, e);
                                continue;
                            }

                            // Delete the corresponding $R file (same suffix)
                            let r_name = name.replacen("$I", "$R", 1);
                            let r_path = sid_dir.join(&r_name);
                            if r_path.exists() {
                                if let Err(e) = std::fs::remove_file(&r_path) {
                                    tracing::warn!("Could not delete $R file {:?}: {}", r_path, e);
                                }
                            }

                            tracing::info!(
                                "Cleaned Recycle Bin pair: {} (original: {})",
                                name,
                                original_path
                            );
                            cleaned += 1;
                        }
                    }
                    Err(_) => {
                        // Can't parse $I file — skip silently
                        continue;
                    }
                }
            }
        }
    }

    Ok(cleaned)
}

/// Read the original file path from a `$I` metadata file.
///
/// Windows 10/11 format (version 2):
/// - Offset 0:  u64 version (must be 2)
/// - Offset 8:  u64 original file size
/// - Offset 16: u64 deletion FILETIME
/// - Offset 24: u32 path length in chars
/// - Offset 28: UTF-16LE path string
fn read_i_file_path(path: &std::path::Path) -> Result<String> {
    let data = std::fs::read(path)?;
    if data.len() < 28 {
        return Err(anyhow::anyhow!("$I file too small"));
    }

    let version = u64::from_le_bytes(data[0..8].try_into()?);
    if version != 2 {
        // Version 1 (Win Vista/7) has a fixed 520-byte path at offset 24
        if version == 1 && data.len() >= 544 {
            let path_bytes = &data[24..544];
            let path_u16: Vec<u16> = path_bytes
                .chunks_exact(2)
                .map(|c| u16::from_le_bytes([c[0], c[1]]))
                .take_while(|&c| c != 0)
                .collect();
            return Ok(String::from_utf16_lossy(&path_u16));
        }
        return Err(anyhow::anyhow!("Unknown $I version: {}", version));
    }

    let path_len_chars = u32::from_le_bytes(data[24..28].try_into()?) as usize;
    let path_bytes_needed = 28 + path_len_chars * 2;

    if data.len() < path_bytes_needed {
        return Err(anyhow::anyhow!("$I file truncated"));
    }

    let path_u16: Vec<u16> = data[28..path_bytes_needed]
        .chunks_exact(2)
        .map(|c| u16::from_le_bytes([c[0], c[1]]))
        .take_while(|&c| c != 0)
        .collect();

    Ok(String::from_utf16_lossy(&path_u16))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_clean_recycle_bin_empty() {
        let result = clean_recycle_bin(&[]);
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), 0);
    }

    #[test]
    fn test_read_i_file_too_small() {
        let tmp = std::env::temp_dir().join("test_i_file.tmp");
        std::fs::write(&tmp, &[0u8; 10]).unwrap();
        let result = read_i_file_path(&tmp);
        assert!(result.is_err());
        let _ = std::fs::remove_file(&tmp);
    }

    #[test]
    fn test_read_i_file_v2_valid() {
        // Construct a minimal valid $I v2 file
        let mut data = Vec::new();
        // Version = 2
        data.extend_from_slice(&2u64.to_le_bytes());
        // Original size = 1024
        data.extend_from_slice(&1024u64.to_le_bytes());
        // Deletion FILETIME
        data.extend_from_slice(&0u64.to_le_bytes());
        // Path length = 5 chars
        data.extend_from_slice(&5u32.to_le_bytes());
        // Path: "C:\ab" in UTF-16LE
        for c in "C:\\ab".encode_utf16() {
            data.extend_from_slice(&c.to_le_bytes());
        }

        let tmp = std::env::temp_dir().join("test_i_v2.tmp");
        std::fs::write(&tmp, &data).unwrap();
        let result = read_i_file_path(&tmp).unwrap();
        assert_eq!(result, "C:\\ab");
        let _ = std::fs::remove_file(&tmp);
    }
}
