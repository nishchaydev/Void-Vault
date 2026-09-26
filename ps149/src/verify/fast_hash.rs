use std::time::Instant;
use xxhash_rust::xxh3::{xxh3_128, Xxh3};

#[derive(Debug, Clone)]
pub struct FastHashResult {
    pub hash: u128,
    pub bytes_hashed: u64,
    pub is_zeroed: bool,
    pub duration: std::time::Duration,
    pub throughput_gbps: f64,
}

/// Fast verification that a region is entirely zeroed using xxHash3.
pub fn verify_zeroed_fast(data: &[u8]) -> FastHashResult {
    let start = Instant::now();
    let hash = xxh3_128(data);
    let duration = start.elapsed();
    let bytes_hashed = data.len() as u64;
    let throughput_gbps = if duration.as_secs_f64() > 0.0 {
        (bytes_hashed as f64 / 1_000_000_000.0) / duration.as_secs_f64()
    } else {
        0.0
    };

    let is_zeroed = data.iter().all(|&b| b == 0);

    FastHashResult {
        hash,
        bytes_hashed,
        is_zeroed,
        duration,
        throughput_gbps,
    }
}

/// Compute xxHash3-128 of arbitrary data for fast comparison.
pub fn fast_hash(data: &[u8]) -> u128 {
    xxh3_128(data)
}

/// Streaming xxHash3 for data larger than memory.
pub struct StreamingHasher {
    hasher: Xxh3,
}

impl StreamingHasher {
    pub fn new() -> Self {
        Self {
            hasher: Xxh3::new(),
        }
    }

    pub fn update(&mut self, data: &[u8]) {
        self.hasher.update(data);
    }

    pub fn finish(&self) -> u128 {
        self.hasher.digest128()
    }
}

impl Default for StreamingHasher {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_fast_hash() {
        let data = b"hello world";
        let hash = fast_hash(data);
        assert_ne!(hash, 0);
    }

    #[test]
    fn test_verify_zeroed() {
        let data = vec![0u8; 1024];
        let res = verify_zeroed_fast(&data);
        assert!(res.is_zeroed);
        assert!(res.bytes_hashed == 1024);
    }
}
