/// Platform Abstraction Layer — OS-agnostic trait definitions.
///
/// Each OS backend implements these traits so the core forensic
/// logic remains platform-independent.
use anyhow::Result;
use std::path::Path;
use std::sync::mpsc::Receiver;
use std::thread::JoinHandle;

use crate::model::device::PhysicalDisk;
use crate::sanitize::hardware_purge::HardwarePurgeResult;

/// Raw disk I/O handle for reading and writing sectors.
pub trait DiskHandle: Send {
    fn write_bytes(&mut self, data: &[u8]) -> Result<usize>;
    fn read_bytes(&mut self, buf: &mut [u8]) -> Result<usize>;
    fn seek_to(&mut self, offset: u64) -> Result<()>;
    fn flush(&self) -> Result<()>;
}

/// Events from USB hotplug monitoring.
#[derive(Debug, Clone)]
pub enum HotplugEvent {
    DeviceArrived { description: String },
    DeviceRemoved { description: String },
}
