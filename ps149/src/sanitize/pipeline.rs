use anyhow::Result;
use crossbeam_channel::bounded;
use std::thread;

use crate::model::device_type::DeviceType;
use crate::sanitize::patterns::{fill_buffer, FillPattern};

/// A filled buffer ready for I/O submission.
struct FilledBuffer {
    data: Vec<u8>,
    valid_bytes: usize,
}

/// Double-buffered write pipeline result.
#[derive(Debug, Clone)]
pub struct PipelineResult {
    pub bytes_written: u64,
    pub duration: std::time::Duration,
    pub throughput_mbps: f64,
    pub errors: Vec<String>,
}

/// Progress callback data for the pipeline.
#[derive(Debug, Clone)]
pub struct PipelineProgress {
    pub bytes_done: u64,
    pub total_bytes: u64,
}

fn optimal_buffer_size(device_type: &DeviceType) -> usize {
    match device_type {
        DeviceType::UsbFlashDrive | DeviceType::SdCard | DeviceType::Emmc => 1024 * 1024,
        DeviceType::InternalHdd | DeviceType::ExternalHdd => 8 * 1024 * 1024,
        DeviceType::InternalSsd | DeviceType::InternalNvme | DeviceType::ExternalSsd => {
            4 * 1024 * 1024
        }
        _ => 4 * 1024 * 1024,
    }
}

pub fn pipelined_write<W: std::io::Write + Send + 'static>(
    mut writer: W,
    pattern: &FillPattern,
    total_bytes: u64,
    device_type: &DeviceType,
    progress_callback: impl Fn(PipelineProgress) + Send + 'static,
) -> Result<PipelineResult> {
    let buffer_size = optimal_buffer_size(device_type);

    let (empty_tx, empty_rx) = bounded::<FilledBuffer>(2);
    let (filled_tx, filled_rx) = bounded::<FilledBuffer>(1);

    empty_tx
        .send(FilledBuffer {
            data: vec![0; buffer_size],
            valid_bytes: 0,
        })
        .unwrap();
    empty_tx
        .send(FilledBuffer {
            data: vec![0; buffer_size],
            valid_bytes: 0,
        })
        .unwrap();

    let pattern_clone = pattern.clone();
    let start_time = std::time::Instant::now();

    let fill_thread = thread::spawn(move || {
        let mut bytes_remaining = total_bytes;
        while bytes_remaining > 0 {
            let mut buf = match empty_rx.recv() {
                Ok(b) => b,
                Err(_) => break,
            };

            let to_fill = std::cmp::min(bytes_remaining, buf.data.len() as u64) as usize;

            fill_buffer(&mut buf.data[..to_fill], &pattern_clone);
            buf.valid_bytes = to_fill;

            if filled_tx.send(buf).is_err() {
                break;
            }
            bytes_remaining -= to_fill as u64;
        }
    });

    let mut bytes_written = 0;
    let mut errors = Vec::new();

    for buf in filled_rx {
        let valid_slice = &buf.data[..buf.valid_bytes];
        match writer.write_all(valid_slice) {
            Ok(_) => {
                bytes_written += buf.valid_bytes as u64;
                progress_callback(PipelineProgress {
                    bytes_done: bytes_written,
                    total_bytes,
                });
            }
            Err(e) => {
                errors.push(e.to_string());
                break;
            }
        }

        if empty_tx.send(buf).is_err() {
            break;
        }
    }

    let _ = fill_thread.join();

    let duration = start_time.elapsed();
    let throughput_mbps = if duration.as_secs_f64() > 0.0 {
        (bytes_written as f64 / 1_048_576.0) / duration.as_secs_f64()
    } else {
        0.0
    };

    Ok(PipelineResult {
        bytes_written,
        duration,
        throughput_mbps,
        errors,
    })
}
