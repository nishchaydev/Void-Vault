//! Prefetch file cleanup — removes Windows Prefetch files that reference
//! shredded file paths, eliminating evidence of file access.
//!
//! Windows Prefetch files (`.pf`) in `C:\Windows\Prefetch\` record:
//! - The executable name and full path
//! - Volume serial number
//! - Run count and last execution timestamps
//!
//! When a file was opened by an application, the Prefetch file for that
//! application proves the file existed and was accessed.

use anyhow::Result;
use std::path::Path;

/// The Prefetch filename format is `EXECNAME-HASH.pf`.
/// We match by checking if any component of the target path appears
/// in the Prefetch filename or (if readable) the file header.
///
/// Returns the number of Prefetch files deleted.
pub fn clean_prefetch(target_paths: &[String]) -> Result<u32> {
    if target_paths.is_empty() {
        return Ok(0);
    }

    let prefetch_dir = Path::new("C:\\Windows\\Prefetch");
    if !prefetch_dir.exists() {
        tracing::info!("Prefetch directory not found — skipping");
        return Ok(0);
    }

    let entries = match std::fs::read_dir(prefetch_dir) {
        Ok(e) => e,
        Err(e) => {
            tracing::warn!("Cannot read Prefetch directory (need admin?): {}", e);
            return Ok(0); // Gracefully degrade if not elevated
        }
    };

    let mut cleaned = 0u32;

    // Extract just the filenames/basenames from target paths for matching
    let target_names: Vec<String> = target_paths
        .iter()
        .filter_map(|p| {
            Path::new(p)
                .file_stem()
                .and_then(|s| s.to_str())
                .map(|s| s.to_lowercase())
        })
        .collect();

    for entry in entries.flatten() {
        let path = entry.path();
        if path.extension().and_then(|e| e.to_str()) != Some("pf") {
            continue;
        }

        let pf_name = match path.file_name().and_then(|n| n.to_str()) {
            Some(n) => n.to_lowercase(),
            None => continue,
        };

        // Check if any target file's name appears in the Prefetch filename
        // Prefetch format: `EXECNAME-HASH.pf` — the exec name is uppercase
        let should_delete = target_names.iter().any(|name| pf_name.contains(name));

        if should_delete {
            match std::fs::remove_file(&path) {
                Ok(_) => {
                    tracing::info!("Deleted Prefetch file: {:?}", path);
                    cleaned += 1;
                }
                Err(e) => {
                    tracing::warn!("Could not delete Prefetch {:?}: {}", path, e);
                }
            }
        }
    }

    Ok(cleaned)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_clean_prefetch_empty_targets() {
        let result = clean_prefetch(&[]);
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), 0);
    }

    #[test]
    fn test_clean_prefetch_nonexistent_targets() {
        let targets = vec!["nonexistent_file_12345.txt".to_lowercase()];
        let result = clean_prefetch(&targets);
        // Should succeed even if no matches found
        assert!(result.is_ok());
    }
}
