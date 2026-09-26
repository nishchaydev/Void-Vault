/// Smart Exact-Length Decoder for Forensic File Carving
///
/// Many file types (BMP, RIFF/WAV/AVI, PNG, MP4/MOV, SQLite, PCAP, EVTX, PE)
/// embed their exact byte lengths or chunk structures in their headers.
///
/// Basic carvers blindly read until `max_size` (e.g. 4 GB for videos, 2 GB for audio),
/// producing bloated files filled with zeroes or subsequent files, and jumping past
/// other recoverable evidence.
///
/// This module inspects internal headers and container chunk hierarchies to calculate
/// the EXACT file size with byte-level precision, matching commercial forensic tools.

/// Detects the exact file length from internal container headers.
/// Returns `Some(size)` if the structure is validly parsed, or `None` if fallback is required.
pub fn detect_exact_length(data: &[u8], extension: &str) -> Option<u64> {
    match extension.to_lowercase().as_str() {
        "bmp" => detect_bmp_length(data),
        "wav" | "avi" | "webp" => detect_riff_length(data),
        "png" => detect_png_length(data),
        "mp4" | "mov" | "m4a" => detect_mp4_length(data),
        "sqlite" | "sqlite3" | "db" => detect_sqlite_length(data),
        "zip" | "docx" | "xlsx" | "pptx" | "jar" | "apk" => detect_zip_length(data),
        "pcap" => detect_pcap_length(data),
        "evtx" => detect_evtx_length(data),
        "exe" | "dll" | "sys" => detect_pe_length(data),
        _ => None,
    }
}

/// BMP file length is stored as a 32-bit little-endian integer at offset 2..6.
fn detect_bmp_length(data: &[u8]) -> Option<u64> {
    if data.len() < 14 || &data[0..2] != b"BM" {
        return None;
    }
    let size = u32::from_le_bytes([data[2], data[3], data[4], data[5]]) as u64;
    // Basic sanity checks: BMP must be at least 26 bytes (header + minimum DIB header)
    if size >= 26 && size <= 200 * 1024 * 1024 {
        Some(size)
    } else {
        None
    }
}

/// RIFF containers (WAV, AVI, WEBP) store (file_size - 8) at offset 4..8 (little-endian).
fn detect_riff_length(data: &[u8]) -> Option<u64> {
    if data.len() < 12 || &data[0..4] != b"RIFF" {
        return None;
    }
    let riff_size = u32::from_le_bytes([data[4], data[5], data[6], data[7]]) as u64;
    let total_size = riff_size + 8;

    let format_tag = &data[8..12];
    let is_valid_tag = format_tag == b"WAVE" || format_tag == b"AVI " || format_tag == b"AVIX" || format_tag == b"WEBP";

    if is_valid_tag && total_size >= 12 && total_size <= 4 * 1024 * 1024 * 1024 {
        Some(total_size)
    } else {
        None
    }
}

/// PNG chunk parser walks chunk lengths (length + 4-byte type + data + 4-byte CRC)
/// until the IEND chunk is found.
fn detect_png_length(data: &[u8]) -> Option<u64> {
    let png_sig = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
    if data.len() < 8 || &data[0..8] != &png_sig {
        return None;
    }

    let mut offset = 8;
    while offset + 8 <= data.len() {
        let chunk_len = u32::from_be_bytes([
            data[offset], data[offset + 1], data[offset + 2], data[offset + 3]
        ]) as usize;
        let chunk_type = &data[offset + 4..offset + 8];

        let next_offset = offset + 8 + chunk_len + 4; // length + type + data + CRC

        if chunk_type == b"IEND" {
            return Some(next_offset as u64);
        }

        // Safety bound: if chunk length exceeds remaining buffer or reasonable size (100MB)
        if chunk_len > 100 * 1024 * 1024 || next_offset > data.len() {
            break;
        }

        offset = next_offset;
    }

    None
}

/// MP4 / MOV ISO Base Media File Format box walker.
/// Walks top-level atoms (ftyp, moov, mdat, free, etc.) and returns cumulative length.
fn detect_mp4_length(data: &[u8]) -> Option<u64> {
    if data.len() < 8 {
        return None;
    }

    let mut offset = 0;
    let mut box_count = 0;
    let mut has_ftyp = false;

    while offset + 8 <= data.len() {
        let box_len_raw = u32::from_be_bytes([
            data[offset], data[offset + 1], data[offset + 2], data[offset + 3]
        ]) as u64;
        let box_type = &data[offset + 4..offset + 8];

        let box_len = if box_len_raw == 1 {
            // Extended 64-bit size at offset + 8
            if offset + 16 > data.len() {
                break;
            }
            u64::from_be_bytes([
                data[offset + 8], data[offset + 9], data[offset + 10], data[offset + 11],
                data[offset + 12], data[offset + 13], data[offset + 14], data[offset + 15],
            ])
        } else if box_len_raw == 0 {
            // Extends to EOF
            break;
        } else {
            box_len_raw
        };

        if box_len < 8 {
            break;
        }

        // Verify valid ASCII box type
        let is_ascii = box_type.iter().all(|&b| b.is_ascii_graphic() || b == b' ');
        if !is_ascii {
            break;
        }

        if box_type == b"ftyp" {
            has_ftyp = true;
        }

        box_count += 1;
        offset += box_len as usize;

        // If offset extends beyond buffer, we at least know the file extends to this offset
        if offset > data.len() {
            if has_ftyp && box_count >= 1 {
                return Some(offset as u64);
            }
            break;
        }
    }

    if has_ftyp && box_count >= 2 {
        Some(offset as u64)
    } else {
        None
    }
}

/// SQLite Database size is calculated as page_size * database_page_count.
fn detect_sqlite_length(data: &[u8]) -> Option<u64> {
    if data.len() < 100 || &data[0..16] != b"SQLite format 3\0" {
        return None;
    }

    let page_size_raw = u16::from_be_bytes([data[16], data[17]]);
    let page_size = if page_size_raw == 1 {
        65536u64
    } else {
        page_size_raw as u64
    };

    // Page count is at offset 28..32
    let page_count = u32::from_be_bytes([data[28], data[29], data[30], data[31]]) as u64;

    // Validate page size is power of 2 between 512 and 65536
    if (512..=65536).contains(&page_size) && page_size.is_power_of_two() && page_count > 0 {
        let total_size = page_size * page_count;
        if total_size <= 64 * 1024 * 1024 * 1024 {
            return Some(total_size);
        }
    }

    None
}

/// ZIP End of Central Directory (EOCD) record parser.
/// Locates `PK\x05\x06` and computes `cd_offset + cd_size + 22 + comment_length`.
fn detect_zip_length(data: &[u8]) -> Option<u64> {
    if data.len() < 22 || &data[0..4] != b"PK\x03\x04" {
        return None;
    }

    // Search backwards for PK\x05\x06
    let search_window = data.len().min(65536 + 22);
    let start_idx = data.len() - search_window;

    for i in (start_idx..=data.len() - 22).rev() {
        if &data[i..i + 4] == b"PK\x05\x06" {
            let cd_size = u32::from_le_bytes([data[i + 12], data[i + 13], data[i + 14], data[i + 15]]) as u64;
            let cd_offset = u32::from_le_bytes([data[i + 16], data[i + 17], data[i + 18], data[i + 19]]) as u64;
            let comment_len = u16::from_le_bytes([data[i + 20], data[i + 21]]) as u64;

            let total_size = cd_offset + cd_size + 22 + comment_len;
            if total_size >= 22 && total_size <= 4 * 1024 * 1024 * 1024 {
                return Some(total_size);
            }
        }
    }

    None
}

/// PCAP packet stream length parser.
/// Reads 24-byte global header and walks 16-byte packet headers.
fn detect_pcap_length(data: &[u8]) -> Option<u64> {
    if data.len() < 24 {
        return None;
    }

    let is_little_endian = &data[0..4] == &[0xD4, 0xC3, 0xB2, 0xA1];
    let is_big_endian = &data[0..4] == &[0xA1, 0xB2, 0xC3, 0xD4];

    if !is_little_endian && !is_big_endian {
        return None;
    }

    let mut offset = 24;
    let mut packet_count = 0;

    while offset + 16 <= data.len() {
        let incl_len = if is_little_endian {
            u32::from_le_bytes([data[offset + 8], data[offset + 9], data[offset + 10], data[offset + 11]]) as usize
        } else {
            u32::from_be_bytes([data[offset + 8], data[offset + 9], data[offset + 10], data[offset + 11]]) as usize
        };

        // Standard ethernet MTU/jumbo frame cap (65,535 bytes)
        if incl_len > 65535 || offset + 16 + incl_len > data.len() {
            break;
        }

        offset += 16 + incl_len;
        packet_count += 1;
    }

    if packet_count > 0 {
        Some(offset as u64)
    } else {
        None
    }
}

/// EVTX Windows Event Log chunk parser.
/// 4096-byte header followed by 64KB chunks (`ElfChnk\0`).
fn detect_evtx_length(data: &[u8]) -> Option<u64> {
    if data.len() < 4096 || &data[0..8] != b"ElfFile\0" {
        return None;
    }

    let chunk_size = 65536usize;
    let mut offset = 4096usize;
    let mut chunk_count = 0;

    while offset + 8 <= data.len() {
        if &data[offset..offset + 8] == b"ElfChnk\0" {
            chunk_count += 1;
            offset += chunk_size;
        } else {
            break;
        }
    }

    if chunk_count > 0 {
        Some(offset as u64)
    } else {
        Some(4096)
    }
}

/// Windows PE Executable (EXE/DLL) section size parser.
/// Reads DOS header (e_lfanew) and PE sections to find highest raw data boundary.
fn detect_pe_length(data: &[u8]) -> Option<u64> {
    if data.len() < 64 || &data[0..2] != b"MZ" {
        return None;
    }

    let e_lfanew = u32::from_le_bytes([data[60], data[61], data[62], data[63]]) as usize;
    if e_lfanew + 24 > data.len() || &data[e_lfanew..e_lfanew + 4] != b"PE\0\0" {
        return None;
    }

    let num_sections = u16::from_le_bytes([data[e_lfanew + 6], data[e_lfanew + 7]]) as usize;
    let opt_hdr_size = u16::from_le_bytes([data[e_lfanew + 20], data[e_lfanew + 21]]) as usize;

    let sec_table_offset = e_lfanew + 24 + opt_hdr_size;
    let mut max_end_offset = sec_table_offset;

    for i in 0..num_sections {
        let sec_offset = sec_table_offset + i * 40;
        if sec_offset + 40 > data.len() {
            break;
        }

        let raw_size = u32::from_le_bytes([
            data[sec_offset + 16], data[sec_offset + 17],
            data[sec_offset + 18], data[sec_offset + 19],
        ]) as usize;

        let raw_ptr = u32::from_le_bytes([
            data[sec_offset + 20], data[sec_offset + 21],
            data[sec_offset + 22], data[sec_offset + 23],
        ]) as usize;

        let sec_end = raw_ptr.saturating_add(raw_size);
        if sec_end > max_end_offset {
            max_end_offset = sec_end;
        }
    }

    if max_end_offset > sec_table_offset && max_end_offset <= 1024 * 1024 * 1024 {
        Some(max_end_offset as u64)
    } else {
        None
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_bmp_length() {
        let mut data = vec![0u8; 1024];
        data[0] = b'B';
        data[1] = b'M';
        data[2..6].copy_from_slice(&512u32.to_le_bytes());
        assert_eq!(detect_exact_length(&data, "bmp"), Some(512));
    }

    #[test]
    fn test_riff_length() {
        let mut data = vec![0u8; 2048];
        data[0..4].copy_from_slice(b"RIFF");
        data[4..8].copy_from_slice(&1000u32.to_le_bytes());
        data[8..12].copy_from_slice(b"WAVE");
        assert_eq!(detect_exact_length(&data, "wav"), Some(1008));
    }

    #[test]
    fn test_sqlite_length() {
        let mut data = vec![0u8; 4096];
        data[0..16].copy_from_slice(b"SQLite format 3\0");
        data[16..18].copy_from_slice(&4096u16.to_be_bytes()); // page_size = 4096
        data[28..32].copy_from_slice(&25u32.to_be_bytes()); // page_count = 25
        assert_eq!(detect_exact_length(&data, "sqlite"), Some(4096 * 25));
    }
}
