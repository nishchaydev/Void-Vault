use crate::platform::traits::DiskHandle;
use anyhow::{Context, Result};
use std::fs::{File, OpenOptions};
use std::io::{Read, Seek, SeekFrom, Write};
use std::os::unix::fs::OpenOptionsExt;

#[cfg(target_os = "linux")]
const O_DIRECT: i32 = 0x4000;
#[cfg(target_os = "linux")]
const O_SYNC: i32 = 0x101000; // O_SYNC = __O_SYNC | O_DSYNC

pub struct LinuxDiskHandle {
    file: File,
}

impl DiskHandle for LinuxDiskHandle {
    fn write_bytes(&mut self, data: &[u8]) -> Result<usize> {
        let written = self.file.write(data)?;
        Ok(written)
    }

    fn read_bytes(&mut self, buf: &mut [u8]) -> Result<usize> {
        let read = self.file.read(buf)?;
        Ok(read)
    }

    fn seek_to(&mut self, offset: u64) -> Result<()> {
        self.file.seek(SeekFrom::Start(offset))?;
        Ok(())
    }

    fn flush(&self) -> Result<()> {
        self.file.sync_all()?;
        Ok(())
    }
}

pub fn open_disk_write(disk_path: &str, write_through: bool) -> Result<LinuxDiskHandle> {
    let mut options = OpenOptions::new();
    options.write(true).read(true);

    #[cfg(target_os = "linux")]
    if write_through {
        options.custom_flags(O_DIRECT | O_SYNC);
    }

    let file = options
        .open(disk_path)
        .with_context(|| format!("Failed to open {} for writing", disk_path))?;
    Ok(LinuxDiskHandle { file })
}

pub fn open_disk_read(disk_path: &str) -> Result<LinuxDiskHandle> {
    let file = OpenOptions::new()
        .read(true)
        .open(disk_path)
        .with_context(|| format!("Failed to open {} for reading", disk_path))?;
    Ok(LinuxDiskHandle { file })
}

pub fn seek_to_sector(
    handle: &mut LinuxDiskHandle,
    sector: u64,
    bytes_per_sector: u32,
) -> Result<()> {
    handle.seek_to(sector * bytes_per_sector as u64)
}
