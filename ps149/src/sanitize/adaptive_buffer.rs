use std::time::{Duration, Instant};

use crate::model::device_type::DeviceType;

#[derive(Debug, Clone)]
pub struct BufferBenchmark {
    pub buffer_size: usize,
    pub throughput_mbps: f64,
    pub latency_us: u64,
    pub samples: usize,
}

#[derive(Debug, Clone)]
pub struct AdaptiveBufferConfig {
    pub optimal_size: usize,
    pub benchmarks: Vec<BufferBenchmark>,
    pub device_type: DeviceType,
    pub queue_depth: u32,
}

const CANDIDATE_SIZES: &[usize] = &[
    256 * 1024,       // 256 KB
    512 * 1024,       // 512 KB
    1024 * 1024,      // 1 MB
    2 * 1024 * 1024,  // 2 MB
    4 * 1024 * 1024,  // 4 MB
    8 * 1024 * 1024,  // 8 MB
    16 * 1024 * 1024, // 16 MB
];

pub fn get_default_buffer_size(device_type: &DeviceType) -> usize {
    match device_type {
        DeviceType::UsbFlashDrive
        | DeviceType::UsbStorageDevice
        | DeviceType::SdCard
        | DeviceType::Emmc => 1024 * 1024,
        DeviceType::InternalHdd | DeviceType::ExternalHdd => 8 * 1024 * 1024,
        DeviceType::InternalSsd | DeviceType::ExternalSsd | DeviceType::Ufs => 4 * 1024 * 1024,
        DeviceType::InternalNvme => 4 * 1024 * 1024,
        DeviceType::Unknown => 4 * 1024 * 1024,
    }
}

pub fn simulate_benchmark(buffer_size: usize, _data_size: usize) -> BufferBenchmark {
    let samples = 3;
    let mut total_duration = Duration::ZERO;

    for _ in 0..samples {
        let start = Instant::now();
        let mut buffer = vec![0u8; buffer_size];
        for i in 0..buffer.len() {
            buffer[i] = (i % 256) as u8;
        }
        total_duration += start.elapsed();
    }

    let avg_duration = total_duration / samples as u32;
    let latency_us = avg_duration.as_micros() as u64;

    let throughput_mbps = if latency_us > 0 {
        let bytes_per_us = buffer_size as f64 / latency_us as f64;
        bytes_per_us // bytes/us is equivalent to MB/s
    } else {
        let mb = buffer_size as f64 / (1024.0 * 1024.0);
        let sec = avg_duration.as_secs_f64().max(0.000001);
        mb / sec
    };

    BufferBenchmark {
        buffer_size,
        throughput_mbps,
        latency_us,
        samples,
    }
}

pub fn find_optimal_buffer(device_type: &DeviceType) -> AdaptiveBufferConfig {
    let mut benchmarks = Vec::new();
    let mut optimal_size = CANDIDATE_SIZES[0];
    let mut max_throughput = 0.0;

    for &size in CANDIDATE_SIZES {
        let bench = simulate_benchmark(size, size);
        if bench.throughput_mbps > max_throughput {
            max_throughput = bench.throughput_mbps;
            optimal_size = size;
        }
        benchmarks.push(bench);
    }

    let queue_depth = match device_type {
        DeviceType::UsbFlashDrive
        | DeviceType::UsbStorageDevice
        | DeviceType::SdCard
        | DeviceType::Emmc => 1,
        DeviceType::InternalHdd | DeviceType::ExternalHdd => 2,
        DeviceType::InternalSsd | DeviceType::ExternalSsd | DeviceType::Ufs => 4,
        DeviceType::InternalNvme => 8,
        DeviceType::Unknown => 2,
    };

    AdaptiveBufferConfig {
        optimal_size,
        benchmarks,
        device_type: device_type.clone(),
        queue_depth,
    }
}

pub fn format_benchmark_report(config: &AdaptiveBufferConfig) -> String {
    let mut report = String::from("Buffer Size | Throughput (MB/s) | Latency (us)\n");
    report.push_str("----------------------------------------------\n");
    for bench in &config.benchmarks {
        let size_mb = bench.buffer_size as f64 / (1024.0 * 1024.0);
        let size_str = if size_mb < 1.0 {
            format!("{} KB", bench.buffer_size / 1024)
        } else {
            format!("{} MB", size_mb)
        };
        report.push_str(&format!(
            "{:<11} | {:<17.2} | {:<12}\n",
            size_str, bench.throughput_mbps, bench.latency_us
        ));
    }
    report.push_str(&format!(
        "Optimal size selected: {} bytes\n",
        config.optimal_size
    ));
    report.push_str(&format!("Queue depth: {}", config.queue_depth));
    report
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_default_buffer_sizes() {
        assert_eq!(
            get_default_buffer_size(&DeviceType::UsbFlashDrive),
            1024 * 1024
        );
        assert_eq!(
            get_default_buffer_size(&DeviceType::InternalHdd),
            8 * 1024 * 1024
        );
        assert_eq!(
            get_default_buffer_size(&DeviceType::InternalSsd),
            4 * 1024 * 1024
        );
        assert_eq!(
            get_default_buffer_size(&DeviceType::InternalNvme),
            4 * 1024 * 1024
        );
        assert_eq!(
            get_default_buffer_size(&DeviceType::Unknown),
            4 * 1024 * 1024
        );
    }

    #[test]
    fn test_benchmark_simulation() {
        let bench = simulate_benchmark(1024 * 1024, 1024 * 1024);
        assert_eq!(bench.buffer_size, 1024 * 1024);
        assert!(bench.throughput_mbps > 0.0);
        assert!(bench.samples > 0);
    }

    #[test]
    fn test_optimal_buffer_selection() {
        let config = find_optimal_buffer(&DeviceType::InternalSsd);
        assert!(CANDIDATE_SIZES.contains(&config.optimal_size));
        assert_eq!(config.benchmarks.len(), CANDIDATE_SIZES.len());
        assert_eq!(config.queue_depth, 4);
    }

    #[test]
    fn test_format_benchmark_report() {
        let config = find_optimal_buffer(&DeviceType::UsbFlashDrive);
        let report = format_benchmark_report(&config);
        assert!(report.contains("Buffer Size | Throughput (MB/s) | Latency (us)"));
        assert!(report.contains("Optimal size selected"));
        assert!(report.contains("Queue depth: 1"));
    }
}
