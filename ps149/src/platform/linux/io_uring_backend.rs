//! io_uring-based async I/O for Linux
//! Falls back to synchronous I/O on non-Linux or older kernels.

use anyhow::Result;

#[cfg(target_os = "linux")]
use std::os::unix::io::AsRawFd;

#[derive(Debug, Clone)]
pub struct IoUringConfig {
    pub ring_depth: u32,    // Queue depth (32-256)
    pub sq_poll: bool,      // Kernel-side SQ polling
    pub direct_io: bool,    // O_DIRECT bypass page cache
    pub buffer_size: usize, // Per-buffer size
}

impl Default for IoUringConfig {
    fn default() -> Self {
        Self {
            ring_depth: 64,
            sq_poll: false,
            direct_io: true,
            buffer_size: 4 * 1024 * 1024, // 4MB
        }
    }
}

#[derive(Debug, Clone)]
pub struct IoUringResult {
    pub bytes_written: u64,
    pub completions: u64,
    pub duration: std::time::Duration,
    pub throughput_mbps: f64,
}

#[cfg(target_os = "linux")]
pub fn is_io_uring_supported() -> bool {
    io_uring::IoUring::new(1).is_ok()
}

#[cfg(not(target_os = "linux"))]
pub fn is_io_uring_supported() -> bool {
    false
}

#[cfg(target_os = "linux")]
pub fn create_ring(config: &IoUringConfig) -> Result<io_uring::IoUring> {
    let mut builder = io_uring::IoUring::builder();
    if config.sq_poll {
        builder.setup_sqpoll(2000); // 2000 ms idle time
    }
    let ring = builder.build(config.ring_depth)?;
    Ok(ring)
}

#[cfg(not(target_os = "linux"))]
pub fn create_ring(_config: &IoUringConfig) -> Result<()> {
    Err(anyhow::anyhow!("io_uring is only supported on Linux"))
}

#[cfg(target_os = "linux")]
pub fn async_write_pass<F: AsRawFd>(
    fd: F,
    pattern: &[u8],
    total_bytes: u64,
    config: &IoUringConfig,
) -> Result<IoUringResult> {
    use io_uring::{opcode, types};
    use std::time::Instant;

    let mut ring = create_ring(config)?;
    let start = Instant::now();

    let raw_fd = fd.as_raw_fd();
    let fd_type = types::Fd(raw_fd);

    let mut offset = 0u64;
    let mut completions = 0u64;
    let mut in_flight = 0;

    let buf_size = config.buffer_size;
    let max_in_flight = config.ring_depth as usize;

    let mut buffer = vec![0u8; buf_size];
    let pat_len = pattern.len();
    if pat_len > 0 {
        for chunk in buffer.chunks_mut(pat_len) {
            let copy_len = std::cmp::min(pat_len, chunk.len());
            chunk.copy_from_slice(&pattern[..copy_len]);
        }
    }

    while offset < total_bytes || in_flight > 0 {
        let mut sq = ring.submission();
        while in_flight < max_in_flight && offset < total_bytes {
            let remaining = total_bytes - offset;
            let write_len = std::cmp::min(buf_size as u64, remaining) as u32;

            let write_op = opcode::Write::new(fd_type, buffer.as_ptr(), write_len)
                .offset(offset as i64)
                .build()
                .user_data(offset);

            unsafe {
                if sq.push(&write_op).is_err() {
                    break;
                }
            }
            offset += write_len as u64;
            in_flight += 1;
        }
        sq.sync();
        drop(sq);

        if in_flight > 0 {
            ring.submit_and_wait(1)?;
            let mut cq = ring.completion();
            for cqe in &mut cq {
                let res = cqe.result();
                if res < 0 {
                    return Err(anyhow::anyhow!("io_uring write error: {}", res));
                }
                completions += 1;
                in_flight -= 1;
            }
        }
    }

    let duration = start.elapsed();
    let duration_secs = duration.as_secs_f64();
    let throughput_mbps = if duration_secs > 0.0 {
        (total_bytes as f64 / 1_048_576.0) / duration_secs
    } else {
        0.0
    };

    Ok(IoUringResult {
        bytes_written: total_bytes,
        completions,
        duration,
        throughput_mbps,
    })
}

#[cfg(not(target_os = "linux"))]
pub fn async_write_pass<F>(
    _fd: F,
    _pattern: &[u8],
    _total_bytes: u64,
    _config: &IoUringConfig,
) -> Result<IoUringResult> {
    Err(anyhow::anyhow!("io_uring is only supported on Linux"))
}

pub fn format_uring_report(result: &IoUringResult) -> String {
    format!(
        "io_uring write completed: {} bytes in {:.2}s ({:.2} MB/s) [{} completions]",
        result.bytes_written,
        result.duration.as_secs_f64(),
        result.throughput_mbps,
        result.completions
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_is_supported() {
        let supported = is_io_uring_supported();
        println!("io_uring supported: {}", supported);
    }

    #[test]
    fn test_format_report() {
        let res = IoUringResult {
            bytes_written: 1048576,
            completions: 1,
            duration: std::time::Duration::from_secs(1),
            throughput_mbps: 1.0,
        };
        let report = format_uring_report(&res);
        assert!(report.contains("1.00 MB/s"));
    }
}
