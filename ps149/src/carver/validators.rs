
#[derive(Debug, Clone)]
pub struct ValidationResult {
    pub valid: bool,
    pub format: String,
    pub details: String,
    pub confidence_boost: f64,
}

/// Validate a carved file's internal structure against forensic file specifications.
pub fn validate_carved_file(data: &[u8], extension: &str) -> ValidationResult {
    match extension.to_lowercase().as_str() {
        "jpg" | "jpeg" => validate_jpeg(data),
        "png" => validate_png(data),
        "pdf" => validate_pdf(data),
        "zip" | "docx" | "xlsx" | "pptx" | "jar" | "apk" => validate_zip(data),
        "bmp" => validate_bmp(data),
        "wav" | "avi" | "webp" => validate_riff(data),
        "mp4" | "mov" | "m4a" => validate_mp4(data),
        "sqlite" | "sqlite3" | "db" => validate_sqlite(data),
        "pcap" => validate_pcap(data),
        "evtx" => validate_evtx(data),
        "exe" | "dll" | "sys" => validate_pe(data),
        "7z" => validate_7z(data),
        _ => ValidationResult {
            valid: true,
            format: extension.to_string(),
            details: "No deep validator available (generic signature valid)".into(),
            confidence_boost: 0.0,
        },
    }
}

fn validate_jpeg(data: &[u8]) -> ValidationResult {
    if data.len() < 4 {
        return ValidationResult {
            valid: false,
            format: "jpeg".into(),
            details: "Too short".into(),
            confidence_boost: 0.0,
        };
    }
    if data[0] != 0xFF || data[1] != 0xD8 {
        return ValidationResult {
            valid: false,
            format: "jpeg".into(),
            details: "Missing SOI".into(),
            confidence_boost: 0.0,
        };
    }

    let mut i = 2;
    let mut has_sos = false;
    while i + 1 < data.len() {
        if data[i] == 0xFF && data[i + 1] != 0x00 && data[i + 1] != 0xFF {
            let marker = data[i + 1];
            if marker == 0xDA {
                // SOS (Start of Scan)
                has_sos = true;
                break;
            } else if marker == 0xD9 {
                // EOI (End of Image)
                break;
            }
            if i + 3 < data.len() {
                let len = ((data[i + 2] as usize) << 8) | (data[i + 3] as usize);
                i += 2 + len;
            } else {
                break;
            }
        } else {
            i += 1;
        }
    }

    if !has_sos {
        return ValidationResult {
            valid: false,
            format: "jpeg".into(),
            details: "Missing SOS marker".into(),
            confidence_boost: 0.0,
        };
    }

    let end_valid = data.len() >= 2 && data[data.len() - 2] == 0xFF && data[data.len() - 1] == 0xD9;
    let boost = if end_valid { 0.8 } else { 0.5 };
    ValidationResult {
        valid: true,
        format: "jpeg".into(),
        details: if end_valid { "Valid JPEG stream with EOI" } else { "Truncated JPEG stream" }.into(),
        confidence_boost: boost,
    }
}

fn validate_png(data: &[u8]) -> ValidationResult {
    let sig = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
    if data.len() < 8 || &data[0..8] != &sig {
        return ValidationResult {
            valid: false,
            format: "png".into(),
            details: "Invalid PNG 8-byte signature".into(),
            confidence_boost: 0.0,
        };
    }
    if data.len() < 33 {
        return ValidationResult {
            valid: false,
            format: "png".into(),
            details: "Too short for minimum PNG".into(),
            confidence_boost: 0.0,
        };
    }
    if &data[12..16] != b"IHDR" {
        return ValidationResult {
            valid: false,
            format: "png".into(),
            details: "Missing IHDR chunk".into(),
            confidence_boost: 0.0,
        };
    }
    let end_valid = data.len() >= 12 && &data[data.len() - 12..data.len() - 8] == b"IEND";
    let boost = if end_valid { 0.9 } else { 0.6 };
    ValidationResult {
        valid: true,
        format: "png".into(),
        details: if end_valid { "Valid PNG structure with IEND" } else { "Partial PNG missing IEND" }.into(),
        confidence_boost: boost,
    }
}

fn validate_pdf(data: &[u8]) -> ValidationResult {
    if data.len() < 5 || &data[0..5] != b"%PDF-" {
        return ValidationResult {
            valid: false,
            format: "pdf".into(),
            details: "Invalid PDF header".into(),
            confidence_boost: 0.0,
        };
    }
    let eof_marker = b"%%EOF";
    let has_eof = data.windows(5).rev().take(1024).any(|w| w == eof_marker);
    if !has_eof {
        return ValidationResult {
            valid: false,
            format: "pdf".into(),
            details: "Missing %%EOF marker in trailer".into(),
            confidence_boost: 0.1,
        };
    }
    ValidationResult {
        valid: true,
        format: "pdf".into(),
        details: "Valid PDF document structure".into(),
        confidence_boost: 0.85,
    }
}

fn validate_zip(data: &[u8]) -> ValidationResult {
    if data.len() < 22 {
        return ValidationResult {
            valid: false,
            format: "zip".into(),
            details: "Too short".into(),
            confidence_boost: 0.0,
        };
    }
    if &data[0..4] != [0x50, 0x4B, 0x03, 0x04] {
        return ValidationResult {
            valid: false,
            format: "zip".into(),
            details: "Invalid PK signature".into(),
            confidence_boost: 0.0,
        };
    }
    let eocd_marker = [0x50, 0x4B, 0x05, 0x06];
    let has_eocd = data
        .windows(4)
        .rev()
        .take(65535 + 22)
        .any(|w| w == eocd_marker);
    if !has_eocd {
        return ValidationResult {
            valid: false,
            format: "zip".into(),
            details: "Missing EOCD record".into(),
            confidence_boost: 0.2,
        };
    }
    ValidationResult {
        valid: true,
        format: "zip".into(),
        details: "Valid ZIP/Office archive structure".into(),
        confidence_boost: 0.9,
    }
}

fn validate_bmp(data: &[u8]) -> ValidationResult {
    if data.len() < 54 || &data[0..2] != b"BM" {
        return ValidationResult {
            valid: false,
            format: "bmp".into(),
            details: "Invalid BMP magic bytes".into(),
            confidence_boost: 0.0,
        };
    }
    let dib_header_size = u32::from_le_bytes([data[14], data[15], data[16], data[17]]);
    let planes = u16::from_le_bytes([data[26], data[27]]);
    let bpp = u16::from_le_bytes([data[28], data[29]]);

    if (dib_header_size == 40 || dib_header_size == 108 || dib_header_size == 124)
        && planes == 1
        && [1, 4, 8, 16, 24, 32].contains(&bpp)
    {
        ValidationResult {
            valid: true,
            format: "bmp".into(),
            details: format!("Valid BMP ({} bpp, DIB header size {})", bpp, dib_header_size),
            confidence_boost: 0.85,
        }
    } else {
        ValidationResult {
            valid: false,
            format: "bmp".into(),
            details: "Corrupt DIB header parameters".into(),
            confidence_boost: 0.1,
        }
    }
}

fn validate_riff(data: &[u8]) -> ValidationResult {
    if data.len() < 12 || &data[0..4] != b"RIFF" {
        return ValidationResult {
            valid: false,
            format: "riff".into(),
            details: "Missing RIFF container header".into(),
            confidence_boost: 0.0,
        };
    }
    let tag = &data[8..12];
    let (fmt_name, boost) = match tag {
        b"WAVE" => ("WAV Audio", 0.9),
        b"AVI " | b"AVIX" => ("AVI Video", 0.85),
        b"WEBP" => ("WebP Image", 0.9),
        _ => ("Unknown RIFF", 0.4),
    };
    ValidationResult {
        valid: true,
        format: fmt_name.into(),
        details: format!("Valid RIFF container with tag {:?}", String::from_utf8_lossy(tag)),
        confidence_boost: boost,
    }
}

fn validate_mp4(data: &[u8]) -> ValidationResult {
    if data.len() < 12 {
        return ValidationResult {
            valid: false,
            format: "mp4".into(),
            details: "Too short for MP4".into(),
            confidence_boost: 0.0,
        };
    }
    // MP4 begins with ftyp atom at offset 4
    if &data[4..8] != b"ftyp" {
        return ValidationResult {
            valid: false,
            format: "mp4".into(),
            details: "Missing ftyp atom at offset 4".into(),
            confidence_boost: 0.0,
        };
    }
    let brand = &data[8..12];
    let brand_str = String::from_utf8_lossy(brand);
    ValidationResult {
        valid: true,
        format: "mp4".into(),
        details: format!("Valid ISO-BMFF container (Major Brand: {})", brand_str),
        confidence_boost: 0.9,
    }
}

fn validate_sqlite(data: &[u8]) -> ValidationResult {
    if data.len() < 100 || &data[0..16] != b"SQLite format 3\0" {
        return ValidationResult {
            valid: false,
            format: "sqlite".into(),
            details: "Invalid SQLite format 3 magic".into(),
            confidence_boost: 0.0,
        };
    }
    let page_size_raw = u16::from_be_bytes([data[16], data[17]]);
    let page_size = if page_size_raw == 1 { 65536u64 } else { page_size_raw as u64 };
    let is_pow2 = (512..=65536).contains(&page_size) && page_size.is_power_of_two();

    if is_pow2 {
        ValidationResult {
            valid: true,
            format: "sqlite".into(),
            details: format!("Valid SQLite database (page size: {} bytes)", page_size),
            confidence_boost: 0.95,
        }
    } else {
        ValidationResult {
            valid: false,
            format: "sqlite".into(),
            details: "Corrupt SQLite page size".into(),
            confidence_boost: 0.2,
        }
    }
}

fn validate_pcap(data: &[u8]) -> ValidationResult {
    if data.len() < 24 {
        return ValidationResult {
            valid: false,
            format: "pcap".into(),
            details: "Too short for PCAP global header".into(),
            confidence_boost: 0.0,
        };
    }
    let is_le = &data[0..4] == &[0xD4, 0xC3, 0xB2, 0xA1];
    let is_be = &data[0..4] == &[0xA1, 0xB2, 0xC3, 0xD4];
    if !is_le && !is_be {
        return ValidationResult {
            valid: false,
            format: "pcap".into(),
            details: "Invalid PCAP magic bytes".into(),
            confidence_boost: 0.0,
        };
    }
    let ver_major = if is_le {
        u16::from_le_bytes([data[4], data[5]])
    } else {
        u16::from_be_bytes([data[4], data[5]])
    };
    if ver_major == 2 {
        ValidationResult {
            valid: true,
            format: "pcap".into(),
            details: format!("Valid PCAP capture (Version 2, Endian: {})", if is_le { "LE" } else { "BE" }),
            confidence_boost: 0.9,
        }
    } else {
        ValidationResult {
            valid: false,
            format: "pcap".into(),
            details: "Unsupported PCAP version".into(),
            confidence_boost: 0.2,
        }
    }
}

fn validate_evtx(data: &[u8]) -> ValidationResult {
    if data.len() < 4096 || &data[0..8] != b"ElfFile\0" {
        return ValidationResult {
            valid: false,
            format: "evtx".into(),
            details: "Invalid Windows Event Log magic header".into(),
            confidence_boost: 0.0,
        };
    }
    let major_ver = u16::from_le_bytes([data[26], data[27]]);
    ValidationResult {
        valid: true,
        format: "evtx".into(),
        details: format!("Valid Windows EVTX Event Log (Header v{})", major_ver),
        confidence_boost: 0.95,
    }
}

fn validate_pe(data: &[u8]) -> ValidationResult {
    if data.len() < 64 || &data[0..2] != b"MZ" {
        return ValidationResult {
            valid: false,
            format: "pe".into(),
            details: "Invalid DOS MZ signature".into(),
            confidence_boost: 0.0,
        };
    }
    let e_lfanew = u32::from_le_bytes([data[60], data[61], data[62], data[63]]) as usize;
    if e_lfanew + 4 <= data.len() && &data[e_lfanew..e_lfanew + 4] == b"PE\0\0" {
        ValidationResult {
            valid: true,
            format: "pe".into(),
            details: format!("Valid Windows PE Executable (PE offset: 0x{:X})", e_lfanew),
            confidence_boost: 0.95,
        }
    } else {
        ValidationResult {
            valid: false,
            format: "pe".into(),
            details: "Missing valid PE header at e_lfanew".into(),
            confidence_boost: 0.2,
        }
    }
}

fn validate_7z(data: &[u8]) -> ValidationResult {
    let sig = [0x37, 0x7A, 0xBC, 0xAF, 0x27, 0x1C];
    if data.len() < 32 || &data[0..6] != &sig {
        return ValidationResult {
            valid: false,
            format: "7z".into(),
            details: "Invalid 7-Zip signature".into(),
            confidence_boost: 0.0,
        };
    }
    ValidationResult {
        valid: true,
        format: "7z".into(),
        details: "Valid 7-Zip Archive structure".into(),
        confidence_boost: 0.9,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_jpeg_valid() {
        let data = vec![
            0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x07, 0x4A, 0x46, 0x49, 0x46, 0x00, 0xFF, 0xDA, 0x00,
            0x0C, 0xFF, 0xD9,
        ];
        let res = validate_carved_file(&data, "jpg");
        assert!(res.valid);
    }

    #[test]
    fn test_png_valid() {
        let mut data = vec![0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
        data.extend(vec![0x00, 0x00, 0x00, 0x0D, b'I', b'H', b'D', b'R']);
        data.extend(vec![0; 20]);
        data.extend(vec![
            0x00, 0x00, 0x00, 0x00, b'I', b'E', b'N', b'D', 0xAE, 0x42, 0x60, 0x82,
        ]);
        let res = validate_carved_file(&data, "png");
        assert!(res.valid);
    }

    #[test]
    fn test_sqlite_valid() {
        let mut data = vec![0u8; 4096];
        data[0..16].copy_from_slice(b"SQLite format 3\0");
        data[16..18].copy_from_slice(&4096u16.to_be_bytes());
        let res = validate_carved_file(&data, "sqlite");
        assert!(res.valid);
        assert_eq!(res.format, "sqlite");
    }

    #[test]
    fn test_bmp_valid() {
        let mut data = vec![0u8; 100];
        data[0..2].copy_from_slice(b"BM");
        data[14..18].copy_from_slice(&40u32.to_le_bytes()); // DIB header size
        data[26..28].copy_from_slice(&1u16.to_le_bytes());  // planes = 1
        data[28..30].copy_from_slice(&24u16.to_le_bytes()); // bpp = 24
        let res = validate_carved_file(&data, "bmp");
        assert!(res.valid);
    }
}
