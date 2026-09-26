use crate::model::device_type::DeviceType;
use crate::sanitize::patterns::FillPattern;
use crate::sanitize::raw_io::{seek_to_sector, DiskHandle};
use serde::Serialize;
use std::time::Instant;
use tracing::{info, warn};
use windows::Win32::Storage::FileSystem::WriteFile;

#[derive(Debug, Clone, Serialize)]
pub struct PassResult {
    pub pass_index: usize,
    pub pattern_description: String,
    pub sectors_written: u64,
    pub total_sectors: u64,
    pub bytes_written: u64,
    pub duration: std::time::Duration,
    pub errors: Vec<String>,
}

#[derive(Debug, Clone)]
pub struct SanitizeProgress {
    pub pass_index: usize,
    pub total_passes: usize,
    pub sectors_done: u64,
    pub work_completed_sectors: u64, // Actual sectors read/written
}

/// Returns optimal write buffer size tuned per device class.
/// - Flash drives: 1 MB (prevents Windows dirty-page stall at ~50% RAM)
/// - HDDs: 8 MB (fewer syscalls, mechanical heads stay in sequential mode)
/// - SSDs/NVMe/others: 4 MB (good balance for NAND controllers)
fn optimal_buffer_size(device_type: &DeviceType) -> u32 {
    match device_type {
        DeviceType::InternalHdd | DeviceType::ExternalHdd => 8_388_608, // 8 MB
        _ => 4_194_304,                                                 // 4 MB (optimal for USB Flash, SSD, NVMe)
    }
}

pub fn write_pass(
    handle: &DiskHandle,
    pattern: &FillPattern,
    total_sectors: u64,
    bytes_per_sector: u32,
    pass_index: usize,
    total_passes: usize,
    method: crate::sanitize::patterns::SanitizeMethod,
    device_type: &DeviceType,
    progress_callback: &impl Fn(SanitizeProgress),
) -> anyhow::Result<PassResult> {
    let start_time = Instant::now();
    let buf_size = optimal_buffer_size(device_type);
    let sectors_per_chunk = (buf_size / bytes_per_sector) as u64;

    info!(
        "I/O engine: {} MB buffer (tuned for {})",
        buf_size / 1_048_576,
        device_type
    );

    let mut buf = vec![0u8; buf_size as usize];

    let is_zero_fill = matches!(pattern, FillPattern::Fixed(0));
    let is_random = matches!(pattern, FillPattern::Random);

    // Fill buffer once at the start for all non-zero patterns
    if !is_zero_fill {
        crate::sanitize::patterns::fill_buffer(&mut buf, pattern);
    }

    let pattern_desc = match pattern {
        FillPattern::Fixed(val) => format!("Fixed(0x{:02X})", val),
        FillPattern::Random => "Random".to_string(),
        FillPattern::ThreeByteRepeating(a, b, c) => {
            format!("Repeating(0x{:02X},0x{:02X},0x{:02X})", a, b, c)
        }
    };

    info!(
        "Starting pass {}/{} with pattern {}",
        pass_index + 1,
        total_passes,
        pattern_desc
    );

    // Seek to start ONCE — then write sequentially without seeking.
    // WriteFile advances the file pointer automatically.
    seek_to_sector(handle, 0, bytes_per_sector)?;

    let mut sectors_written: u64 = 0;
    let mut bytes_written: u64 = 0;
    let mut errors = Vec::new();
    let mut current_sector: u64 = 0;

    let is_fast_wipe = matches!(method, crate::sanitize::patterns::SanitizeMethod::FastWipe);
    let is_smart_secure = matches!(
        method,
        crate::sanitize::patterns::SanitizeMethod::SmartSecure
    );
    let wipe_margin_sectors = (16 * 1024 * 1024) / bytes_per_sector as u64; // 16 MB (FastWipe)
    let threshold_end_sectors = total_sectors.saturating_sub(wipe_margin_sectors);

    if is_smart_secure {
        // SmartSecure: zone-based write strategy (shared zone definition)
        let bps = bytes_per_sector as u64;
        let zones = crate::sanitize::patterns::smart_secure_zones(total_sectors, bytes_per_sector);

        for (zone_start, zone_count) in &zones {
            seek_to_sector(handle, *zone_start, bytes_per_sector)?;
            let mut written_in_zone: u64 = 0;

            while written_in_zone < *zone_count {
                let remaining = *zone_count - written_in_zone;
                let sectors_to_write = std::cmp::min(sectors_per_chunk, remaining);
                let bytes_to_write = (sectors_to_write * bps) as usize;

                if is_random {
                    crate::sanitize::patterns::fill_buffer(&mut buf[..bytes_to_write], pattern);
                }

                let mut written = 0u32;
                let result = unsafe {
                    WriteFile(
                        handle.as_raw(),
                        Some(&buf[..bytes_to_write]),
                        Some(&mut written),
                        None,
                    )
                };

                match result {
                    Ok(()) => {
                        sectors_written += sectors_to_write;
                        bytes_written += written as u64;
                    }
                    Err(e) => {
                        let err_msg = format!(
                            "Failed to write at sector {}: {}",
                            zone_start + written_in_zone,
                            e
                        );
                        warn!("{}", err_msg);
                        errors.push(err_msg);
                    }
                }

                written_in_zone += sectors_to_write;

                progress_callback(SanitizeProgress {
                    pass_index,
                    total_passes,
                    sectors_done: *zone_start + written_in_zone,
                    work_completed_sectors: sectors_written,
                });
            }
        }
    } else {
        // Standard sequential write (used by all other methods including FastWipe)
        while current_sector < total_sectors {
            let remaining = total_sectors - current_sector;
            let sectors_to_write = std::cmp::min(sectors_per_chunk, remaining);
            let bytes_to_write = (sectors_to_write * bytes_per_sector as u64) as usize;

            if is_random {
                crate::sanitize::patterns::fill_buffer(&mut buf[..bytes_to_write], pattern);
            }

            let mut written = 0u32;
            let result = unsafe {
                WriteFile(
                    handle.as_raw(),
                    Some(&buf[..bytes_to_write]),
                    Some(&mut written),
                    None,
                )
            };

            match result {
                Ok(()) => {
                    sectors_written += sectors_to_write;
                    bytes_written += written as u64;
                }
                Err(e) => {
                    let err_msg = format!("Failed to write at sector {}: {}", current_sector, e);
                    warn!("{}", err_msg);
                    errors.push(err_msg);
                }
            }

            current_sector += sectors_to_write;

            if is_fast_wipe
                && current_sector >= wipe_margin_sectors
                && current_sector < threshold_end_sectors
            {
                current_sector = threshold_end_sectors;
                seek_to_sector(handle, current_sector, bytes_per_sector)?;
            }

            progress_callback(SanitizeProgress {
                pass_index,
                total_passes,
                sectors_done: current_sector,
                work_completed_sectors: sectors_written,
            });
        }
    }

    Ok(PassResult {
        pass_index,
        pattern_description: pattern_desc,
        sectors_written,
        total_sectors,
        bytes_written,
        duration: start_time.elapsed(),
        errors,
    })
}
struct DiskWriter {
    handle: windows::Win32::Foundation::HANDLE,
}

unsafe impl Send for DiskWriter {}

impl std::io::Write for DiskWriter {
    fn write(&mut self, buf: &[u8]) -> std::io::Result<usize> {
        let mut written = 0u32;
        let result = unsafe {
            windows::Win32::Storage::FileSystem::WriteFile(
                self.handle,
                Some(buf),
                Some(&mut written),
                None,
            )
        };
        match result {
            Ok(_) => Ok(written as usize),
            Err(e) => Err(std::io::Error::from_raw_os_error(e.code().0 as i32)),
        }
    }

    fn flush(&mut self) -> std::io::Result<()> {
        Ok(())
    }
}

pub fn write_pass_pipelined(
    handle: &DiskHandle,
    pattern: &FillPattern,
    total_sectors: u64,
    bytes_per_sector: u32,
    pass_index: usize,
    total_passes: usize,
    method: crate::sanitize::patterns::SanitizeMethod,
    device_type: &DeviceType,
    progress_callback: impl Fn(SanitizeProgress) + Send + Sync + Clone + 'static,
    use_pipeline: bool,
) -> anyhow::Result<PassResult> {
    if !use_pipeline {
        return write_pass(
            handle,
            pattern,
            total_sectors,
            bytes_per_sector,
            pass_index,
            total_passes,
            method,
            device_type,
            &progress_callback,
        );
    }

    let pattern_desc = match pattern {
        FillPattern::Fixed(val) => format!("Fixed(0x{:02X})", val),
        FillPattern::Random => "Random".to_string(),
        FillPattern::ThreeByteRepeating(a, b, c) => {
            format!("Repeating(0x{:02X},0x{:02X},0x{:02X})", a, b, c)
        }
    };

    info!(
        "Starting pipelined pass {}/{} with pattern {}",
        pass_index + 1,
        total_passes,
        pattern_desc
    );

    seek_to_sector(handle, 0, bytes_per_sector)?;

    let writer = DiskWriter {
        handle: handle.as_raw(),
    };

    let total_bytes = total_sectors * bytes_per_sector as u64;

    let cb = progress_callback.clone();
    let bps = bytes_per_sector as u64;
    let res = crate::sanitize::pipeline::pipelined_write(
        writer,
        pattern,
        total_bytes,
        device_type,
        move |prog| {
            cb(SanitizeProgress {
                pass_index,
                total_passes,
                sectors_done: prog.bytes_done / bps,
                work_completed_sectors: prog.bytes_done / bps,
            });
        },
    );

    match res {
        Ok(pipeline_res) => Ok(PassResult {
            pass_index,
            pattern_description: pattern_desc,
            sectors_written: pipeline_res.bytes_written / bps,
            total_sectors,
            bytes_written: pipeline_res.bytes_written,
            duration: pipeline_res.duration,
            errors: pipeline_res.errors,
        }),
        Err(e) => Err(e.into()),
    }
}
