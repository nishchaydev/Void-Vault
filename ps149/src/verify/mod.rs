pub mod cftt;
pub mod entropy;
pub mod entropy_map;
pub mod fast_hash;
pub mod hash;
pub mod readback;
pub mod sampling;

use crate::model::device::PhysicalDisk;
use crate::sanitize::pass::SanitizeProgress;
use crate::sanitize::patterns::FillPattern;

pub fn verify_disk(
    disk: &PhysicalDisk,
    expected_pattern: &FillPattern,
    method: crate::sanitize::patterns::SanitizeMethod,
    progress_callback: impl Fn(SanitizeProgress),
) -> anyhow::Result<readback::VerifyResult> {
    readback::verify_pass(
        disk.index,
        expected_pattern,
        disk.total_sectors,
        disk.bytes_per_sector,
        method,
        &progress_callback,
    )
}
