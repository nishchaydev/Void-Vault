use crate::carver::signatures::{match_header, FileSignature};
use anyhow::Result;
use rayon::prelude::*;
use std::time::Instant;

#[derive(Debug, Clone)]
pub struct ParallelCarveResult {
    pub total_matches: usize,
    pub chunks_processed: usize,
    pub duration: std::time::Duration,
}

#[derive(Debug, Clone)]
pub struct CarveMatch {
    pub offset: u64,
    pub signature_name: String,
    pub chunk_id: usize,
}

/// Scan a byte slice for file signatures in parallel using rayon.
pub fn parallel_scan(
    data: &[u8],
    chunk_size: usize,
    signatures: &[FileSignature],
) -> Result<(Vec<CarveMatch>, ParallelCarveResult)> {
    let start = Instant::now();
    let overlap = 512;

    let num_chunks = if data.is_empty() {
        0
    } else {
        (data.len() + chunk_size - 1) / chunk_size
    };
    let mut chunks = Vec::with_capacity(num_chunks);

    for i in 0..num_chunks {
        let chunk_start = i * chunk_size;
        let chunk_end = std::cmp::min(data.len(), chunk_start + chunk_size + overlap);
        chunks.push((i, chunk_start, &data[chunk_start..chunk_end]));
    }

    let all_matches: Vec<CarveMatch> = chunks
        .par_iter()
        .flat_map(|&(chunk_id, chunk_start, chunk_data)| {
            let mut matches = Vec::new();
            let scan_len = std::cmp::min(chunk_size, chunk_data.len());
            for i in 0..scan_len {
                if let Some(sig) = match_header(&chunk_data[i..], signatures) {
                    matches.push(CarveMatch {
                        offset: (chunk_start + i) as u64,
                        signature_name: sig.name.to_string(),
                        chunk_id,
                    });
                }
            }
            matches
        })
        .collect();

    let mut deduplicated = all_matches;
    deduplicated.sort_by_key(|m| m.offset);
    deduplicated.dedup_by_key(|m| m.offset);

    let res = ParallelCarveResult {
        total_matches: deduplicated.len(),
        chunks_processed: num_chunks,
        duration: start.elapsed(),
    };

    Ok((deduplicated, res))
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::carver::signatures::all_signatures;

    #[test]
    fn test_parallel_scan() {
        let sigs = all_signatures();
        let mut data = vec![0u8; 10000];
        // Insert a JPEG header at offset 100
        data[100] = 0xFF;
        data[101] = 0xD8;
        data[102] = 0xFF;
        data[103] = 0xE0;

        let (matches, res) = parallel_scan(&data, 4096, &sigs).unwrap();
        assert_eq!(matches.len(), 1);
        assert_eq!(matches[0].offset, 100);
        assert_eq!(matches[0].signature_name, "JPEG Image");
        assert_eq!(res.total_matches, 1);
    }
}
