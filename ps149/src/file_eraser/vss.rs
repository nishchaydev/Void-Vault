//! Volume Shadow Copy (VSS) detection and cleanup for forensic shredding.
//!
//! Uses `vssadmin` CLI to detect and delete shadow copies that may contain
//! recoverable copies of shredded files. Requires Administrator privileges.
//!
//! # Context
//! This is a legitimate forensic data sanitization tool (NIST SP 800-88).
//! Shadow copies must be addressed because they contain full point-in-time
//! file snapshots that survive file-level overwrite operations.

use anyhow::{Context, Result};
use serde::Serialize;
use std::path::Path;
use std::process::Command;
use tracing::{info, warn};

#[derive(Debug, Clone, Serialize)]
pub struct ShadowCopy {
    pub id: String,
    pub volume: String,
    pub creation_time: String,
}

/// Extract the volume letter from a file path (e.g., 'C' from "C:\\Users\\...").
pub fn volume_letter_from_path(path: &Path) -> Option<char> {
    let s = path.to_string_lossy();
    let bytes = s.as_bytes();
    if bytes.len() >= 2 && bytes[1] == b':' && bytes[0].is_ascii_alphabetic() {
        Some(bytes[0].to_ascii_uppercase() as char)
    } else {
        // Try canonicalized path (resolves \\?\ prefix)
        if let Ok(canon) = std::fs::canonicalize(path) {
            let cs = canon.to_string_lossy();
            // \\?\C:\... format
            if cs.len() >= 6 && cs.as_bytes()[4].is_ascii_alphabetic() && cs.as_bytes()[5] == b':' {
                return Some(cs.as_bytes()[4].to_ascii_uppercase() as char);
            }
        }
        None
    }
}

/// List existing VSS shadow copies for a volume (e.g., 'C').
pub fn list_shadow_copies(volume_letter: char) -> Result<Vec<ShadowCopy>> {
    let volume_arg = format!("/for={}:\\", volume_letter.to_ascii_uppercase());

    let output = Command::new("vssadmin")
        .args(["list", "shadows", &volume_arg])
        .output()
        .context("Failed to run vssadmin. Ensure running as Administrator.")?;

    let stdout = String::from_utf8_lossy(&output.stdout);
    let mut shadows = Vec::new();

    let mut current_id = String::new();
    let mut current_volume = String::new();
    let mut current_time = String::new();

    for line in stdout.lines() {
        let trimmed = line.trim();
        if let Some(rest) = trimmed.strip_prefix("Shadow Copy ID:") {
            current_id = rest.trim().to_string();
        } else if let Some(rest) = trimmed.strip_prefix("Original Volume:") {
            current_volume = rest.trim().to_string();
        } else if trimmed.starts_with("Shadow Copy Volume:") {
            // If we have a complete record, push it
            if !current_id.is_empty() {
                shadows.push(ShadowCopy {
                    id: current_id.clone(),
                    volume: current_volume.clone(),
                    creation_time: current_time.clone(),
                });
            }
        } else if let Some(rest) = trimmed.strip_prefix("Contained") {
            // "Contained 1 shadow copies at creation time: ..."
            if let Some(time_part) = rest.split("creation time:").nth(1) {
                current_time = time_part.trim().to_string();
            }
        } else if let Some(rest) = trimmed.strip_prefix("creation time:") {
            current_time = rest.trim().to_string();
        }
    }

    // Push last record if present
    if !current_id.is_empty() && !shadows.iter().any(|s| s.id == current_id) {
        shadows.push(ShadowCopy {
            id: current_id,
            volume: current_volume,
            creation_time: current_time,
        });
    }

    info!(
        "Found {} shadow copies for volume {}:",
        shadows.len(),
        volume_letter
    );

    Ok(shadows)
}

/// Check if any shadow copies exist for the volume containing the given path.
pub fn has_shadow_copies(path: &Path) -> bool {
    volume_letter_from_path(path)
        .and_then(|v| list_shadow_copies(v).ok())
        .map(|s| !s.is_empty())
        .unwrap_or(false)
}

/// Delete all shadow copies for a volume. Returns the count deleted.
/// Requires Administrator privileges.
///
/// This is necessary for NIST SP 800-88 compliant sanitization because
/// VSS snapshots contain full copies of files that would otherwise survive
/// file-level overwrite and deletion operations.
pub fn delete_shadow_copies(volume_letter: char) -> Result<u32> {
    let shadows = list_shadow_copies(volume_letter)?;
    let count = shadows.len() as u32;

    if count == 0 {
        info!("No shadow copies to delete on volume {}", volume_letter);
        return Ok(0);
    }

    warn!(
        "Deleting {} VSS shadow copies on volume {} for forensic sanitization",
        count, volume_letter
    );

    let volume_arg = format!("/for={}:\\", volume_letter.to_ascii_uppercase());
    let output = Command::new("vssadmin")
        .args(["delete", "shadows", &volume_arg, "/quiet"])
        .output()
        .context("Failed to delete shadow copies via vssadmin")?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        warn!("vssadmin delete shadows returned non-zero: {}", stderr);
    }

    // Verify deletion
    let remaining = list_shadow_copies(volume_letter)
        .map(|s| s.len())
        .unwrap_or(0);

    let deleted = count.saturating_sub(remaining as u32);
    info!(
        "Deleted {} of {} shadow copies on volume {}",
        deleted, count, volume_letter
    );

    Ok(deleted)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_volume_letter_extraction() {
        assert_eq!(
            volume_letter_from_path(Path::new("C:\\Users\\test.txt")),
            Some('C')
        );
        assert_eq!(
            volume_letter_from_path(Path::new("d:\\data\\file.bin")),
            Some('D')
        );
        assert_eq!(volume_letter_from_path(Path::new("/unix/path")), None);
    }

    #[test]
    fn test_list_shadows_nonexistent_volume() {
        // Volume '?' doesn't exist — should return empty or error gracefully
        let result = list_shadow_copies('?');
        match result {
            Ok(shadows) => assert!(shadows.is_empty()),
            Err(_) => {} // Also acceptable
        }
    }
}
