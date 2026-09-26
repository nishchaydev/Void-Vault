//! Recent Documents cleanup — removes Windows LNK shortcuts and Jump List
//! entries that reference shredded file paths.
//!
//! Windows records file access history in:
//! - `%AppData%\Microsoft\Windows\Recent\` — `.lnk` shortcut files
//! - `%AppData%\Microsoft\Windows\Recent\AutomaticDestinations\` — Jump Lists
//! - `%AppData%\Microsoft\Windows\Recent\CustomDestinations\` — Pinned items
//!
//! Each `.lnk` file contains the original full path, drive serial, timestamps,
//! and MAC address — providing strong forensic evidence of file access.

use anyhow::Result;
use std::path::PathBuf;

/// Clean Recent Documents shortcuts that reference target paths.
///
/// Scans `.lnk` files in the Recent directory and deletes those whose
/// filename matches any of the target file basenames.
///
/// Jump Lists (`.automaticDestinations-ms`) are OLE compound documents
/// that require specialized parsing — for now we log a warning about them.
///
/// Returns the number of shortcuts deleted.
pub fn clean_recent_docs(target_paths: &[String]) -> Result<u32> {
    let appdata = match std::env::var_os("APPDATA") {
        Some(v) => PathBuf::from(v),
        None => {
            tracing::warn!("APPDATA environment variable not set");
            return Ok(0);
        }
    };

    let recent_dir = appdata
        .join("Microsoft")
        .join("Windows")
        .join("Recent");

    if !recent_dir.exists() {
        tracing::info!("Recent documents directory not found — skipping");
        return Ok(0);
    }

    // Extract basenames from target paths for matching
    let target_basenames: Vec<String> = target_paths
        .iter()
        .filter_map(|p| {
            std::path::Path::new(p)
                .file_stem()
                .and_then(|s| s.to_str())
                .map(|s| s.to_lowercase())
        })
        .collect();

    let mut cleaned = 0u32;

    // Phase 1: Clean .lnk files in Recent directory
    if let Ok(entries) = std::fs::read_dir(&recent_dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_dir() {
                continue; // Skip AutomaticDestinations/CustomDestinations subdirs
            }

            let ext = path
                .extension()
                .and_then(|e| e.to_str())
                .unwrap_or("")
                .to_lowercase();

            if ext != "lnk" {
                continue;
            }

            // Match LNK filename against target basenames
            // LNK files are named like `Document.docx.lnk`
            let lnk_name = path
                .file_stem()
                .and_then(|n| n.to_str())
                .unwrap_or("")
                .to_lowercase();

            // Also check the stem of the stem (for `file.ext.lnk` → `file`)
            let inner_stem = std::path::Path::new(&lnk_name)
                .file_stem()
                .and_then(|s| s.to_str())
                .unwrap_or(&lnk_name)
                .to_lowercase();

            let should_delete = target_basenames
                .iter()
                .any(|name| lnk_name.contains(name) || inner_stem.contains(name));

            if should_delete {
                match std::fs::remove_file(&path) {
                    Ok(_) => {
                        tracing::info!("Deleted Recent shortcut: {:?}", path);
                        cleaned += 1;
                    }
                    Err(e) => {
                        tracing::warn!("Could not delete {:?}: {}", path, e);
                    }
                }
            }
        }
    }

    // Phase 2: Warn about Jump Lists (complex OLE compound docs)
    let auto_dest = recent_dir.join("AutomaticDestinations");
    if auto_dest.exists() {
        if let Ok(entries) = std::fs::read_dir(&auto_dest) {
            let jl_count = entries.count();
            if jl_count > 0 {
                tracing::warn!(
                    "Found {} Jump List files in {:?}. These are OLE compound documents \
                     that may contain references to shredded files. Manual review recommended.",
                    jl_count,
                    auto_dest
                );
            }
        }
    }

    Ok(cleaned)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_clean_recent_docs_empty_targets() {
        let result = clean_recent_docs(&[]);
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), 0);
    }

    #[test]
    fn test_clean_recent_docs_nonexistent_targets() {
        let targets = vec!["nonexistent_file_xyz_99999.txt".to_string()];
        let result = clean_recent_docs(&targets);
        assert!(result.is_ok());
    }
}
