use anyhow::{Context, Result};
use std::ffi::CString;
use std::process::Command;

pub fn dismount_volume(mount_point: &str) -> Result<()> {
    let _target = CString::new(mount_point)?;
    #[cfg(target_os = "linux")]
    unsafe {
        if libc::umount2(_target.as_ptr(), 0) < 0 {
            return Err(anyhow::Error::last_os_error().context("umount2 failed"));
        }
    }
    Ok(())
}

pub fn format_volume(device_path: &str, fs_type: &str) -> Result<()> {
    let mkfs_bin = format!("mkfs.{}", fs_type);
    let status = Command::new(&mkfs_bin)
        .arg(device_path)
        .status()
        .context(format!("Failed to run {}", mkfs_bin))?;

    if !status.success() {
        return Err(anyhow::anyhow!("{} failed with {}", mkfs_bin, status));
    }
    Ok(())
}
