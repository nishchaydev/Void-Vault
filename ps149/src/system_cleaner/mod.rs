//! System Trace Cleaner — Anti-forensic module to eliminate OS-level artifacts
//! that leak file existence evidence.
//!
//! This module provides cleanup of Windows system artifacts that persist after
//! file shredding and can be used by recovery tools to prove a file existed:
//! - Windows Prefetch files (`.pf` in `C:\Windows\Prefetch\`)
//! - Thumbnail caches (`thumbcache_*.db`, `thumbs.db`)
//! - Recent Documents (`.lnk` shortcuts, Jump Lists)
//! - Recycle Bin metadata (`$I`/`$R` file pairs)
//!
//! Designed as a separate module from `file_eraser` so users can choose
//! whether to run system-wide artifact cleanup in addition to file shredding.

pub mod prefetch;
pub mod thumbcache;
pub mod recent_docs;
pub mod recycle_bin;
pub mod extended;

use anyhow::Result;
use serde::Serialize;
use std::path::PathBuf;

/// Configuration for which artifact categories to clean.
#[derive(Debug, Clone, Serialize)]
pub struct CleanOptions {
    /// Clean Windows Prefetch files referencing target paths
    pub clean_prefetch: bool,
    /// Clean thumbnail cache databases
    pub clean_thumbcache: bool,
    /// Clean Recent Documents (.lnk shortcuts)
    pub clean_recent_docs: bool,
    /// Clean Recycle Bin $I/$R metadata pairs for target paths
    pub clean_recycle_bin: bool,
    /// Run extended artifact cleanup (20+ categories: registry, app traces, etc.)
    pub clean_extended: bool,
}

impl Default for CleanOptions {
    fn default() -> Self {
        Self {
            clean_prefetch: true,
            clean_thumbcache: true,
            clean_recent_docs: true,
            clean_recycle_bin: true,
            clean_extended: true,
        }
    }
}

/// Results from a system trace cleaning operation.
#[derive(Debug, Clone, Serialize)]
pub struct CleanReport {
    /// Number of Prefetch files deleted
    pub prefetch_cleaned: u32,
    /// Number of thumbnail cache files cleaned
    pub thumbcache_cleaned: u32,
    /// Number of Recent Document shortcuts removed
    pub recent_docs_cleaned: u32,
    /// Number of Recycle Bin pairs removed
    pub recycle_bin_cleaned: u32,
    /// Number of extended artifacts cleaned (registry, app traces, etc.)
    pub extended_cleaned: u32,
    /// Non-fatal errors encountered
    pub errors: Vec<String>,
    /// Total duration
    pub duration: std::time::Duration,
}

/// Clean OS-level system artifacts that leak evidence of file existence.
///
/// This should be called AFTER file shredding to eliminate metadata shadows
/// in Windows system caches that recovery tools scan.
///
/// # Arguments
/// * `target_paths` — Original file/folder paths that were shredded. Used to
///   filter which Prefetch files, LNK shortcuts, and Recycle Bin entries to remove.
/// * `options` — Which artifact categories to clean.
/// * `progress` — Progress callback: `(message, percentage 0.0..1.0)`.
pub fn clean_system_traces(
    target_paths: &[PathBuf],
    options: &CleanOptions,
    progress: &impl Fn(&str, f64),
) -> Result<CleanReport> {
    let start = std::time::Instant::now();
    let mut report = CleanReport {
        prefetch_cleaned: 0,
        thumbcache_cleaned: 0,
        recent_docs_cleaned: 0,
        recycle_bin_cleaned: 0,
        extended_cleaned: 0,
        errors: Vec::new(),
        duration: std::time::Duration::ZERO,
    };

    // Normalize target paths for case-insensitive matching
    let targets: Vec<String> = target_paths
        .iter()
        .filter_map(|p| p.to_str())
        .map(|s| s.to_lowercase())
        .collect();

    if options.clean_prefetch {
        progress("Cleaning Prefetch files...", 0.0);
        match prefetch::clean_prefetch(&targets) {
            Ok(count) => report.prefetch_cleaned = count,
            Err(e) => report.errors.push(format!("Prefetch: {}", e)),
        }
    }

    if options.clean_thumbcache {
        progress("Cleaning thumbnail caches...", 0.25);
        match thumbcache::clean_thumbcache(target_paths) {
            Ok(count) => report.thumbcache_cleaned = count,
            Err(e) => report.errors.push(format!("Thumbcache: {}", e)),
        }
    }

    if options.clean_recent_docs {
        progress("Cleaning Recent Documents...", 0.5);
        match recent_docs::clean_recent_docs(&targets) {
            Ok(count) => report.recent_docs_cleaned = count,
            Err(e) => report.errors.push(format!("Recent docs: {}", e)),
        }
    }

    if options.clean_recycle_bin {
        progress("Cleaning Recycle Bin metadata...", 0.75);
        match recycle_bin::clean_recycle_bin(&targets) {
            Ok(count) => report.recycle_bin_cleaned = count,
            Err(e) => report.errors.push(format!("Recycle Bin: {}", e)),
        }
    }

    if options.clean_extended {
        progress("Running extended artifact cleanup...", 0.85);
        match extended::clean_extended_traces(
            &extended::ExtendedCleanOptions::default(),
            &|msg, _pct| {
                progress(msg, 0.85);
            },
        ) {
            Ok(ext_report) => {
                report.extended_cleaned = ext_report.total_artifacts_cleaned;
                // Merge errors
                report.errors.extend(ext_report.errors);
            }
            Err(e) => report.errors.push(format!("Extended: {}", e)),
        }
    }

    report.duration = start.elapsed();
    progress("System trace cleaning complete", 1.0);

    tracing::info!(
        "System trace clean: prefetch={}, thumbcache={}, recent={}, recycle_bin={}, extended={}, errors={}",
        report.prefetch_cleaned,
        report.thumbcache_cleaned,
        report.recent_docs_cleaned,
        report.recycle_bin_cleaned,
        report.extended_cleaned,
        report.errors.len()
    );

    Ok(report)
}
