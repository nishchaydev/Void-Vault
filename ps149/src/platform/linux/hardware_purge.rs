use crate::sanitize::hardware_purge::HardwarePurgeResult;
use anyhow::{Context, Result};
use std::fs::OpenOptions;
use std::os::unix::io::AsRawFd;

#[cfg(target_os = "linux")]
const BLKDISCARD: libc::c_ulong = 0x1277;

pub fn hardware_trim_device(
    disk_path: &str,
    total_capacity_bytes: u64,
) -> Result<HardwarePurgeResult> {
    let file = OpenOptions::new()
        .write(true)
        .open(disk_path)
        .context("Failed to open device for TRIM")?;

    let _fd = file.as_raw_fd();

    #[cfg(target_os = "linux")]
    {
        let range: [u64; 2] = [0, total_capacity_bytes];
        unsafe {
            if libc::ioctl(_fd, BLKDISCARD, &range) < 0 {
                return Err(anyhow::Error::last_os_error().context("BLKDISCARD ioctl failed"));
            }
        }
    }

    Ok(HardwarePurgeResult {
        success: true,
        method_used: "BLKDISCARD".to_string(),
        bytes_purged: total_capacity_bytes,
        error_message: None,
        duration_secs: 0.0,
        command_type: "BLKDISCARD".to_string(),
        message: "Successfully issued BLKDISCARD".to_string(),
    })
}
