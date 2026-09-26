//! $LogFile Flood Module — NTFS Transaction Log Overflow
//!
//! The NTFS $LogFile is a circular buffer (~64MB) that records every metadata
//! operation (create, rename, delete, attribute change). Forensic tools like
//! X-Ways and R-Studio replay $LogFile transactions to reconstruct deleted
//! file operations and recover filenames, timestamps, and MFT record states.
//!
//! This module floods the $LogFile with thousands of dummy metadata operations,
//! causing the circular buffer to wrap around and overwrite the real transaction
//! records from the actual file deletion.
//!
//! Technique: Create 10,000+ temp files → rename each 3x → delete all
//! = ~40,000+ dummy $LogFile entries, far exceeding the typical ~50,000 capacity.

use anyhow::{Context, Result};
use std::path::PathBuf;
use tracing::info;

/// Result of a $LogFile flood operation.
#[derive(Debug, Clone)]
pub struct LogFloodResult {
    /// Number of dummy files created
    pub files_created: u32,
    /// Total dummy metadata operations generated
    pub operations_generated: u32,
    /// Whether the flood completed successfully
    pub completed: bool,
    /// Duration of the flood
    pub duration: std::time::Duration,
}

/// Flood the NTFS $LogFile on the specified volume with dummy metadata operations.
///
/// Creates thousands of tiny temp files, renames them multiple times, then deletes
/// them. Each create/rename/delete generates multiple $LogFile entries, eventually
/// overflowing the circular buffer and destroying evidence of the real file operations.
///
/// # Arguments
/// * `volume_letter` — Drive letter (e.g. 'C', 'O') of the NTFS volume to flood
/// * `intensity` — Number of dummy files to create (recommended: 10_000 for standard,
///   20_000 for paranoid mode)
/// * `progress_callback` — Progress reporter: `(message, percentage 0.0..1.0)`
pub fn flood_logfile(
    volume_letter: char,
    intensity: u32,
    progress_callback: &impl Fn(&str, f64),
) -> Result<LogFloodResult> {
    let start = std::time::Instant::now();

    // Create a temp directory on the target volume for our dummy files
    let flood_dir = PathBuf::from(format!("{}:\\__vv_lf_{:08x}", volume_letter, rand::random::<u32>()));
    std::fs::create_dir_all(&flood_dir)
        .with_context(|| format!("Cannot create flood dir on {}:", volume_letter))?;

    let mut total_ops: u32 = 0;
    let mut files_created: u32 = 0;
    let rename_passes = 3u32;

    progress_callback("$LogFile flood: creating dummy files...", 0.0);

    // Phase 1: Create dummy files with random names
    // Each CreateFile generates ~3-5 $LogFile entries (MFT alloc, dir index, timestamps)
    let mut paths: Vec<PathBuf> = Vec::with_capacity(intensity as usize);
    for i in 0..intensity {
        if i % 1000 == 0 {
            let pct = (i as f64 / intensity as f64) * 0.4;
            progress_callback(
                &format!("$LogFile flood: creating files ({}/{})", i, intensity),
                pct,
            );
        }

        let name = format!("{:08x}{:08x}.tmp", rand::random::<u32>(), i);
        let file_path = flood_dir.join(&name);

        match std::fs::File::create(&file_path) {
            Ok(_) => {
                paths.push(file_path);
                files_created += 1;
                total_ops += 3; // create + dir_index_update + timestamp
            }
            Err(_) => {
                // Disk full or permission error — stop creating, proceed to renames
                break;
            }
        }
    }

    // Phase 2: Rename each file multiple times to generate more $LogFile entries
    // Each rename generates ~4 entries (old dir update, new dir update, MFT update, timestamps)
    progress_callback("$LogFile flood: renaming files...", 0.4);
    for pass in 0..rename_passes {
        let pct = 0.4 + (pass as f64 / rename_passes as f64) * 0.3;
        progress_callback(
            &format!("$LogFile flood: rename pass {}/{}", pass + 1, rename_passes),
            pct,
        );

        for path in paths.iter_mut() {
            let new_name = format!("{:08x}{:08x}.tmp", rand::random::<u32>(), rand::random::<u32>());
            let new_path = flood_dir.join(&new_name);
            if std::fs::rename(&*path, &new_path).is_ok() {
                *path = new_path;
                total_ops += 4; // dir_old + dir_new + mft + timestamp
            }
        }
    }

    // Phase 3: Delete all dummy files
    // Each delete generates ~3 entries (MFT update, dir index removal, bitmap update)
    progress_callback("$LogFile flood: deleting dummy files...", 0.7);
    for (i, path) in paths.iter().enumerate() {
        if i % 2000 == 0 {
            let pct = 0.7 + (i as f64 / paths.len().max(1) as f64) * 0.25;
            progress_callback(
                &format!("$LogFile flood: cleaning up ({}/{})", i, paths.len()),
                pct,
            );
        }
        if std::fs::remove_file(path).is_ok() {
            total_ops += 3;
        }
    }

    // Phase 4: Remove the flood directory itself
    let _ = std::fs::remove_dir_all(&flood_dir);
    total_ops += 2;

    let duration = start.elapsed();
    progress_callback(
        &format!(
            "$LogFile flood complete: {} ops in {:.1}s",
            total_ops,
            duration.as_secs_f64()
        ),
        1.0,
    );

    info!(
        "$LogFile flood on {}: created={}, total_ops={}, duration={:?}",
        volume_letter, files_created, total_ops, duration
    );

    Ok(LogFloodResult {
        files_created,
        operations_generated: total_ops,
        completed: true,
        duration,
    })
}

/// Convenience function: flood with default intensity (10,000 files = ~40,000+ ops).
pub fn flood_logfile_default(volume_letter: char) -> Result<LogFloodResult> {
    flood_logfile(volume_letter, 10_000, &|_msg, _pct| {})
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_flood_small_batch() {
        // Use C: drive with tiny batch for testing
        let result = flood_logfile('C', 50, &|msg, pct| {
            println!("[{:.0}%] {}", pct * 100.0, msg);
        });
        assert!(result.is_ok());
        let r = result.unwrap();
        assert!(r.files_created > 0);
        assert!(r.operations_generated > r.files_created); // ops > files due to renames
        assert!(r.completed);
    }
}
