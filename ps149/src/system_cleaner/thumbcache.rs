//! Thumbnail cache cleanup — clears Windows thumbnail databases that
//! may contain preview images of shredded files.
//!
//! Windows caches thumbnails in:
//! - `%LocalAppData%\Microsoft\Windows\Explorer\thumbcache_*.db`
//! - Legacy `thumbs.db` files in any directory
//!
//! These contain visual previews that prove a file's content even after deletion.

use anyhow::Result;
use std::path::{Path, PathBuf};

/// Clear thumbnail cache databases.
///
/// For thumbcache_*.db files: overwrite with zeros and truncate (Windows
/// recreates them on next Explorer launch — deleting causes errors).
///
/// For thumbs.db files in target directories: delete them outright.
///
/// Returns the number of cache files cleaned.
pub fn clean_thumbcache(target_paths: &[PathBuf]) -> Result<u32> {
    let mut cleaned = 0u32;

    // Phase 1: Clear system thumbcache databases
    if let Some(local_app) = std::env::var_os("LOCALAPPDATA") {
        let explorer_dir = PathBuf::from(local_app)
            .join("Microsoft")
            .join("Windows")
            .join("Explorer");

        if explorer_dir.exists() {
            if let Ok(entries) = std::fs::read_dir(&explorer_dir) {
                for entry in entries.flatten() {
                    let path = entry.path();
                    let name = path
                        .file_name()
                        .and_then(|n| n.to_str())
                        .unwrap_or("")
                        .to_lowercase();

                    if name.starts_with("thumbcache_") && name.ends_with(".db") {
                        // Overwrite with zeros + truncate (don't delete — Windows needs these)
                        match overwrite_and_truncate(&path) {
                            Ok(_) => {
                                tracing::info!("Cleared thumbcache: {:?}", path);
                                cleaned += 1;
                            }
                            Err(e) => {
                                tracing::warn!("Could not clear {:?}: {}", path, e);
                            }
                        }
                    }
                }
            }
        }
    }

    // Phase 2: Delete thumbs.db in target directories
    for target in target_paths {
        let dir = if target.is_dir() {
            target.clone()
        } else {
            target.parent().unwrap_or(Path::new(".")).to_path_buf()
        };

        let thumbs_path = dir.join("thumbs.db");
        if thumbs_path.exists() {
            match std::fs::remove_file(&thumbs_path) {
                Ok(_) => {
                    tracing::info!("Deleted thumbs.db: {:?}", thumbs_path);
                    cleaned += 1;
                }
                Err(e) => {
                    tracing::warn!("Could not delete {:?}: {}", thumbs_path, e);
                }
            }
        }
    }

    Ok(cleaned)
}

/// Overwrite a file's contents with zeros and truncate to 0 bytes.
fn overwrite_and_truncate(path: &Path) -> Result<()> {
    let size = std::fs::metadata(path)?.len();
    if size > 0 {
        // Write zeros over existing content
        let zeros = vec![0u8; size.min(1_048_576) as usize]; // Cap at 1MB chunks
        let file = std::fs::OpenOptions::new().write(true).open(path)?;
        use std::io::Write;
        let mut writer = std::io::BufWriter::new(file);
        let mut remaining = size;
        while remaining > 0 {
            let chunk = remaining.min(zeros.len() as u64) as usize;
            writer.write_all(&zeros[..chunk])?;
            remaining -= chunk as u64;
        }
        writer.flush()?;
    }
    // Truncate to 0
    std::fs::OpenOptions::new()
        .write(true)
        .truncate(true)
        .open(path)?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_clean_thumbcache_no_targets() {
        let result = clean_thumbcache(&[]);
        assert!(result.is_ok());
    }

    #[test]
    fn test_clean_thumbcache_nonexistent_dir() {
        let targets = vec![PathBuf::from("Z:\\nonexistent\\path")];
        let result = clean_thumbcache(&targets);
        assert!(result.is_ok());
    }
}
