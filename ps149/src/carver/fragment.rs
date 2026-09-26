/// Bifragment Gap Carving (BGC) Engine
///
/// Recovers files split into exactly 2 contiguous fragments with
/// a gap of unrelated data between them. Covers ~80% of real-world
/// fragmented file recovery scenarios.
use crate::carver::signatures::FileSignature;
use anyhow::Result;
use serde::Serialize;
use std::io::{Read, Seek, SeekFrom};

/// A candidate fragmented file recovery.
#[derive(Debug, Clone, Serialize)]
pub struct FragmentCandidate {
    /// Byte offset where the file header was found.
    pub header_offset: u64,
    /// Size of fragment 1 (header to gap start).
    pub fragment1_size: u64,
    /// Byte offset where the gap begins.
    pub gap_offset: u64,
    /// Size of the gap (unrelated data between fragments).
    pub gap_size: u64,
    /// Byte offset where fragment 2 begins.
    pub fragment2_offset: u64,
    /// Size of fragment 2 (gap end to footer).
    pub fragment2_size: u64,
    /// Total reassembled file size.
    pub reassembled_size: u64,
    /// Confidence score (0.0 - 1.0), typically 0.4-0.75 for fragmented recovery.
    pub confidence: f64,
}

pub fn attempt_bifragment_carve<R: Read + Seek>(
    reader: &mut R,
    sig: &FileSignature,
    header_offset: u64,
    max_scan_distance: u64,
    sector_size: u64,
) -> Result<Option<FragmentCandidate>> {
    let footer_sig = match &sig.footer {
        Some(f) => f,
        None => return Ok(None),
    };

    reader.seek(SeekFrom::Start(header_offset))?;
    let scan_limit = (sig.max_size + max_scan_distance).min(16 * 1024 * 1024);
    if scan_limit == 0 {
        return Ok(None);
    }
    let mut buffer = vec![0u8; scan_limit as usize];

    // Read up to scan limit
    let mut total_read = 0;
    while total_read < scan_limit as usize {
        let bytes_read = reader.read(&mut buffer[total_read..])?;
        if bytes_read == 0 {
            break;
        }
        total_read += bytes_read;
    }

    if total_read < sig.min_size as usize {
        return Ok(None);
    }

    let buffer = &buffer[..total_read];
    let start_scan = (sig.min_size as usize).min(buffer.len());

    // Find candidate footer positions: scan from sig.min_size up to buffer.len()
    // DO NOT require i > sig.max_size!
    let mut footer_positions = Vec::new();
    if buffer.len() >= footer_sig.len() {
        for i in start_scan..=buffer.len() - footer_sig.len() {
            if &buffer[i..i + footer_sig.len()] == &footer_sig[..] {
                footer_positions.push(i);
            }
        }
    }

    if footer_positions.is_empty() {
        return Ok(None);
    }

    let sector = if sector_size > 0 { sector_size } else { 512 };
    let mut best_candidate: Option<FragmentCandidate> = None;

    for &footer_pos in &footer_positions {
        let total_span = (footer_pos + footer_sig.len()) as u64;

        // If total_span <= sig.max_size, check if it is already contiguous
        if total_span <= sig.max_size {
            let contig_slice = &buffer[..total_span as usize];
            let val = crate::carver::validators::validate_carved_file(contig_slice, sig.extension);
            if val.valid {
                // It is already a contiguous file
                continue;
            }
        }

        // Test candidate gaps:
        let mut candidate_pairs: Vec<(u64, u64)> = Vec::new(); // (f1_size, gap_size)

        // 1. Detect null byte gaps (runs of zeros >= 8 bytes)
        let min_null_run = 8usize.min(sector as usize);
        let mut in_zeros = false;
        let mut zero_start = 0usize;
        for i in 4..footer_pos {
            if buffer[i] == 0 {
                if !in_zeros {
                    in_zeros = true;
                    zero_start = i;
                }
            } else if in_zeros {
                in_zeros = false;
                let zero_len = i - zero_start;
                if zero_len >= min_null_run {
                    let f1 = zero_start as u64;
                    let gap = zero_len as u64;
                    candidate_pairs.push((f1, gap));
                }
            }
        }
        if in_zeros {
            let zero_len = footer_pos - zero_start;
            if zero_len >= min_null_run {
                let f1 = zero_start as u64;
                let gap = zero_len as u64;
                candidate_pairs.push((f1, gap));
            }
        }

        // 2. Candidate split points aligned to cluster / sector boundaries
        let mut split_points = Vec::new();
        let cluster_sizes = [sector, 512, 1024, 2048, 4096, 8192, 16384, 32768, 65536];
        for &cs in &cluster_sizes {
            if cs == 0 || cs >= total_span {
                continue;
            }
            let mut pt = cs;
            while pt < total_span.min(sig.max_size) {
                if !split_points.contains(&pt) {
                    split_points.push(pt);
                }
                pt += cs;
            }
        }
        // Half of total_span rounded to sector
        let half = ((total_span / 2) / sector).max(1) * sector;
        if half > 0 && half < total_span && !split_points.contains(&half) {
            split_points.push(half);
        }

        for &f1 in &split_points {
            if f1 < 4 || f1 >= total_span {
                continue;
            }
            let min_gap = if total_span > sig.max_size {
                total_span - sig.max_size
            } else {
                sector
            };

            for &cs in &[sector, 512, 4096] {
                if cs == 0 { continue; }
                let rounded_gap = ((min_gap + cs - 1) / cs) * cs;
                if f1 + rounded_gap < total_span {
                    candidate_pairs.push((f1, rounded_gap));
                }
                if rounded_gap + cs + f1 < total_span {
                    candidate_pairs.push((f1, rounded_gap + cs));
                }
            }
        }

        // Evaluate candidate pairs
        for (f1_size, gap_size) in candidate_pairs {
            if f1_size < 4 || f1_size + gap_size >= total_span {
                continue;
            }
            let f2_size = total_span - (f1_size + gap_size);
            if f2_size < footer_sig.len() as u64 {
                continue;
            }
            let reassembled_size = f1_size + f2_size;
            if reassembled_size < sig.min_size || reassembled_size > sig.max_size {
                continue;
            }

            // Build reassembled buffer to validate
            let mut candidate_data = Vec::with_capacity(reassembled_size as usize);
            candidate_data.extend_from_slice(&buffer[..f1_size as usize]);
            candidate_data.extend_from_slice(&buffer[(f1_size + gap_size) as usize..total_span as usize]);

            let val = crate::carver::validators::validate_carved_file(&candidate_data, sig.extension);
            let mut conf = validate_reassembly(sig, &candidate_data);
            if val.valid {
                conf = (conf + 0.2 + val.confidence_boost).min(1.0);
            }

            if val.valid || conf >= 0.5 {
                let candidate = FragmentCandidate {
                    header_offset,
                    fragment1_size: f1_size,
                    gap_offset: header_offset + f1_size,
                    gap_size,
                    fragment2_offset: header_offset + f1_size + gap_size,
                    fragment2_size: f2_size,
                    reassembled_size,
                    confidence: conf,
                };

                let replace = match &best_candidate {
                    Some(b) => conf > b.confidence,
                    None => true,
                };
                if replace {
                    best_candidate = Some(candidate);
                }
            }
        }
    }

    Ok(best_candidate)
}

pub fn reassemble_fragments<R: Read + Seek>(
    reader: &mut R,
    candidate: &FragmentCandidate,
) -> Result<Vec<u8>> {
    let mut data = Vec::with_capacity(candidate.reassembled_size as usize);

    reader.seek(SeekFrom::Start(candidate.header_offset))?;
    let mut f1 = vec![0u8; candidate.fragment1_size as usize];
    reader.read_exact(&mut f1)?;
    data.extend_from_slice(&f1);

    reader.seek(SeekFrom::Start(candidate.fragment2_offset))?;
    let mut f2 = vec![0u8; candidate.fragment2_size as usize];
    reader.read_exact(&mut f2)?;
    data.extend_from_slice(&f2);

    Ok(data)
}

fn validate_reassembly(sig: &FileSignature, data: &[u8]) -> f64 {
    let mut conf: f64 = 0.4;

    if let Some(footer) = &sig.footer {
        if data.len() >= footer.len() && &data[data.len() - footer.len()..] == &footer[..] {
            conf += 0.2;
        }
    }

    let half = data.len() / 2;
    if half > 0 {
        let e1 = shannon_entropy(&data[..half]);
        let e2 = shannon_entropy(&data[half..]);
        if (e1 - e2).abs() < 0.5 {
            conf += 0.05;
        }
    }

    if data.len() as u64 >= sig.min_size && data.len() as u64 <= sig.max_size {
        conf += 0.1;
    }

    conf.clamp(0.4, 0.75)
}

fn shannon_entropy(data: &[u8]) -> f64 {
    let mut counts = [0usize; 256];
    for &byte in data {
        counts[byte as usize] += 1;
    }

    let len = data.len() as f64;
    let mut entropy = 0.0;

    for &count in &counts {
        if count > 0 {
            let p = count as f64 / len;
            entropy -= p * p.log2();
        }
    }

    entropy
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::carver::signatures::FileCategory;
    use std::io::Cursor;

    fn get_test_sig() -> FileSignature {
        FileSignature {
            name: "JPEG",
            extension: "jpg",
            mime_type: "image/jpeg",
            category: FileCategory::Image,
            header: &[0xFF, 0xD8, 0xFF],
            footer: Some(&[0xFF, 0xD9]),
            max_size: 20,
            min_size: 5,
        }
    }

    #[test]
    fn test_bifragment_detection() {
        let mut data = vec![0xFF, 0xD8, 0xFF, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07]; // fragment 1
        data.extend_from_slice(&[0x00; 50]); // gap
        data.extend_from_slice(&[0x08, 0x09, 0xFF, 0xD9]); // fragment 2

        let mut cursor = Cursor::new(data);
        let sig = get_test_sig();
        let candidate = attempt_bifragment_carve(&mut cursor, &sig, 0, 100, 50).unwrap();
        assert!(candidate.is_some());
        let candidate = candidate.unwrap();
        assert_eq!(candidate.header_offset, 0);
    }

    #[test]
    fn test_reassembly() {
        let mut data = vec![0xFF, 0xD8, 0xFF, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07];
        data.extend_from_slice(&[0x00; 50]);
        data.extend_from_slice(&[0x08, 0x09, 0xFF, 0xD9]);

        let candidate = FragmentCandidate {
            header_offset: 0,
            fragment1_size: 10,
            gap_offset: 10,
            gap_size: 50,
            fragment2_offset: 60,
            fragment2_size: 4,
            reassembled_size: 14,
            confidence: 0.6,
        };

        let mut cursor = Cursor::new(data);
        let reassembled = reassemble_fragments(&mut cursor, &candidate).unwrap();
        assert_eq!(reassembled.len(), 14);
        assert_eq!(&reassembled[..3], &[0xFF, 0xD8, 0xFF]);
        assert_eq!(&reassembled[reassembled.len() - 2..], &[0xFF, 0xD9]);
    }

    #[test]
    fn test_no_fragmentation() {
        let data = vec![0xFF, 0xD8, 0xFF, 0x01, 0x02, 0x03, 0x04, 0xFF, 0xD9, 0x00];
        let mut cursor = Cursor::new(data);
        let sig = get_test_sig();
        let candidate = attempt_bifragment_carve(&mut cursor, &sig, 0, 100, 50).unwrap();
        // Since footer is within max_size (20), it shouldn't be detected as fragmented.
        assert!(candidate.is_none());
    }
}
