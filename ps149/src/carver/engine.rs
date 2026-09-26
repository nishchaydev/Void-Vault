/// Core file carving engine — scans raw disk sectors or image files
/// to detect and extract deleted/hidden files using magic byte signatures.
use crate::carver::signatures::{self, FileCategory, FileSignature};

use anyhow::{Context, Result};
use serde::Serialize;
use sha2::{Digest, Sha256};
use std::fs;
use std::io::{Read, Seek, SeekFrom, Write};
use std::path::Path;
use std::time::Instant;
use tracing::{info, warn};

/// A single carved (recovered) file.
#[derive(Debug, Clone, Serialize)]
pub struct CarvedFile {
    pub file_type: String,
    pub extension: String,
    pub category: FileCategory,
    pub offset: u64,
    pub size: u64,
    pub sha256: String,
    pub output_path: String,
    pub confidence: f64,
    pub structural_validity: bool,
    pub validation_details: String,
    pub severity: String,
    #[serde(default)]
    pub is_fragment: bool,
    #[serde(default)]
    pub original_filename: Option<String>,
    #[serde(default)]
    pub original_path: Option<String>,
    #[serde(default)]
    pub created_time: Option<String>,
    #[serde(default)]
    pub modified_time: Option<String>,
    #[serde(default)]
    pub recovery_method: Option<String>,
}

/// Summary of an entire carving operation.
#[derive(Debug, Clone, Serialize)]
pub struct CarvingResult {
    pub source: String,
    pub total_bytes_scanned: u64,
    pub files_found: usize,
    pub carved_files: Vec<CarvedFile>,
    pub duration_secs: f64,
    pub categories: std::collections::HashMap<String, usize>,
}

/// Progress callback data.
#[derive(Debug, Clone)]
#[allow(dead_code)]
pub struct CarvingProgress {
    pub bytes_scanned: u64,
    pub total_bytes: u64,
    pub files_found: usize,
}

/// Carve files from a raw disk, partition, or image file.
///
/// `source_path` can be:
/// - A raw disk path: `\\.\PhysicalDrive1`
/// - A volume: `\\.\D:`
/// - A disk image file: `C:\evidence\disk.dd`
///
/// `output_dir` is where recovered files are saved.
pub fn carve_from_source(
    source_path: &str,
    output_dir: &Path,
    total_size: Option<u64>,
    progress_callback: impl Fn(CarvingProgress),
) -> Result<CarvingResult> {
    let start = Instant::now();
    let signatures = signatures::all_signatures();

    // Create output directory structure
    fs::create_dir_all(output_dir)
        .with_context(|| format!("Failed to create output directory: {:?}", output_dir))?;

    // Open source for reading
    let mut reader = open_source(source_path)?;
    let source_size = total_size.unwrap_or_else(|| reader.seek(SeekFrom::End(0)).unwrap_or(0));
    reader.seek(SeekFrom::Start(0))?;

    info!(
        "Starting file carving: source={}, size={} bytes, signatures={}",
        source_path,
        source_size,
        signatures.len()
    );

    let chunk_size: usize = 4 * 1024 * 1024; // 4 MB sequential batch read
    let mut position: u64 = 0;
    let mut buffer = vec![0u8; chunk_size];
    let mut carved_files: Vec<CarvedFile> = Vec::new();
    let mut file_counter: usize = 0;
    let sector_step = 512usize; // Check headers at sector boundaries

    // Phase 1: Filesystem-Aware Metadata Scan (NTFS MFT & FAT32 directory tables)
    // Recovers deleted files with original filenames, full directory paths, and timestamps
    let fs_files = scan_and_recover_filesystem_metadata(&mut reader, output_dir);
    if !fs_files.is_empty() {
        info!("Filesystem metadata scan recovered {} intact files", fs_files.len());
        file_counter += fs_files.len();
        carved_files.extend(fs_files);
    }
    let _ = reader.seek(SeekFrom::Start(0));

    while position < source_size {
        let bytes_to_read = std::cmp::min(chunk_size as u64, source_size - position) as usize;
        let read_slice = &mut buffer[..bytes_to_read];
        let mut bytes_read = 0;
        while bytes_read < bytes_to_read {
            match reader.read(&mut read_slice[bytes_read..]) {
                Ok(0) => break,
                Ok(n) => bytes_read += n,
                Err(e) => {
                    warn!(
                        "Damaged/unreadable sector at byte offset 0x{:X} ({}). Zero-filling sector and continuing.",
                        position + bytes_read as u64,
                        e
                    );
                    let bad_sector_size = 512usize.min(bytes_to_read - bytes_read);
                    read_slice[bytes_read..bytes_read + bad_sector_size].fill(0);
                    bytes_read += bad_sector_size;
                    // Seek past the damaged sector
                    let next_seek_pos = position + bytes_read as u64;
                    if let Err(seek_err) = reader.seek(SeekFrom::Start(next_seek_pos)) {
                        warn!("Failed to seek past damaged sector: {}", seek_err);
                        break;
                    }
                }
            }
        }

        if bytes_read == 0 {
            break;
        }

        let current_chunk = &buffer[..bytes_read];

        // ── Fast Zero-Skip in RAM ───────────────────────────────
        // If this 4 MB chunk is all 0x00 (typical on CCTV drives where large
        // sections of deleted recordings are wiped or empty), skip it instantly!
        if is_all_zeros(current_chunk) {
            position += bytes_read as u64;
            progress_callback(CarvingProgress {
                bytes_scanned: position,
                total_bytes: source_size,
                files_found: carved_files.len(),
            });
            continue;
        }

        // ── In-Memory Sector Scan ──────────────────────────────
        let mut offset = 0usize;
        while offset < bytes_read {
            let sector_slice = &current_chunk[offset..];
            if let Some(sig) = signatures::match_header(sector_slice, &signatures) {
                let abs_offset = position + offset as u64;
                info!(
                    "Found {} header at offset 0x{:X} ({:.2} MB)",
                    sig.name,
                    abs_offset,
                    abs_offset as f64 / (1024.0 * 1024.0)
                );

                match extract_file(
                    &mut reader,
                    sig,
                    abs_offset,
                    source_size,
                    output_dir,
                    file_counter,
                ) {
                    Ok(carved) => {
                        info!(
                            "Carved: {} ({} bytes, confidence: {:.0}%)",
                            carved.output_path,
                            carved.size,
                            carved.confidence * 100.0
                        );
                        let file_size = carved.size as usize;
                        carved_files.push(carved);
                        file_counter += 1;

                        // Skip forward past this carved file
                        let advance_sectors =
                            ((file_size + sector_step - 1) / sector_step) * sector_step;
                        offset += advance_sectors;
                        let new_abs = position + offset as u64;
                        if new_abs < source_size {
                            let _ = reader.seek(SeekFrom::Start(new_abs));
                        }
                        continue;
                    }
                    Err(e) => {
                        warn!(
                            "Failed to extract {} at offset 0x{:X}: {}",
                            sig.name, abs_offset, e
                        );
                        // Reset reader position to after the current buffer
                        let _ = reader.seek(SeekFrom::Start(position + bytes_read as u64));
                    }
                }
            }

            offset += sector_step;
        }

        if offset >= bytes_read {
            position += offset as u64;
        } else {
            position += bytes_read as u64;
        }
        let _ = reader.seek(SeekFrom::Start(position));

        progress_callback(CarvingProgress {
            bytes_scanned: position,
            total_bytes: source_size,
            files_found: carved_files.len(),
        });
    }

    // Build category counts
    let mut categories = std::collections::HashMap::new();
    for cf in &carved_files {
        *categories.entry(cf.category.to_string()).or_insert(0) += 1;
    }

    let result = CarvingResult {
        source: source_path.to_string(),
        total_bytes_scanned: position,
        files_found: carved_files.len(),
        carved_files,
        duration_secs: start.elapsed().as_secs_f64(),
        categories,
    };

    info!(
        "Carving complete: {} files found in {:.1}s",
        result.files_found, result.duration_secs
    );

    Ok(result)
}

/// Extract a single file starting at `offset` using the signature's footer
/// or max_size constraint.
fn extract_file(
    reader: &mut Box<dyn ReadSeek>,
    sig: &FileSignature,
    offset: u64,
    source_size: u64,
    output_dir: &Path,
    file_index: usize,
) -> Result<CarvedFile> {
    reader.seek(SeekFrom::Start(offset))?;

    // Determine how much data to read (bounded by max_size and source_size)
    let mut max_read = std::cmp::min(sig.max_size, source_size - offset);
    let read_chunk = 512 * 1024; // 512 KB chunks for high-throughput USB/disk reads
    let mut file_data: Vec<u8> =
        Vec::with_capacity(std::cmp::min(max_read as usize, 10 * 1024 * 1024));
    let mut total_read: u64 = 0;
    let mut footer_found = false;
    let mut exact_length_detected = false;
    let mut detected_exact_len: u64 = 0;

    loop {
        if total_read >= max_read {
            break;
        }
        let to_read = std::cmp::min(read_chunk, (max_read - total_read) as usize);
        let mut chunk = vec![0u8; to_read];
        let bytes_read = reader.read(&mut chunk)?;
        if bytes_read == 0 {
            break;
        }
        file_data.extend_from_slice(&chunk[..bytes_read]);
        total_read += bytes_read as u64;

        // Structure-aware exact length detection (IntelliRAW)
        if !exact_length_detected {
            if let Some(exact_len) = crate::carver::smart_length::detect_exact_length(&file_data, sig.extension) {
                if exact_len >= sig.min_size && exact_len <= sig.max_size && exact_len <= source_size.saturating_sub(offset) {
                    max_read = exact_len;
                    detected_exact_len = exact_len;
                    exact_length_detected = true;
                    if file_data.len() as u64 >= exact_len {
                        file_data.truncate(exact_len as usize);
                        footer_found = true;
                        break;
                    }
                }
            }
        } else if file_data.len() as u64 >= max_read {
            file_data.truncate(max_read as usize);
            footer_found = true;
            break;
        }

        // If we have a footer, check if we've found it (search only the newly read window + overlap)
        if let Some(footer) = sig.footer {
            let search_start = file_data
                .len()
                .saturating_sub(bytes_read + footer.len() + 64);
            if let Some(rel_pos) = signatures::find_footer(&file_data[search_start..], footer) {
                file_data.truncate(search_start + rel_pos);
                footer_found = true;
                break;
            }
        }

        // Cap in-memory buffer at 100 MB to prevent OOM on huge files
        if file_data.len() > 100 * 1024 * 1024 {
            break;
        }
    }

    // If no footer found and file seems truncated, attempt bifragment recovery
    let mut is_fragment = false;
    if sig.footer.is_some() && !footer_found && !exact_length_detected {
        // Reset reader and try bifragment gap carving
        if let Ok(Some(candidate)) = crate::carver::fragment::attempt_bifragment_carve(
            reader,
            sig,
            offset,
            source_size.saturating_sub(offset),
            4096, // Pass real cluster/sector size, NOT sig.max_size!
        ) {
            if candidate.confidence >= 0.5 {
                if let Ok(reassembled) =
                    crate::carver::fragment::reassemble_fragments(reader, &candidate)
                {
                    file_data = reassembled;
                    is_fragment = true;
                    info!(
                        "Bifragment recovery successful: {} bytes, confidence {:.0}%",
                        file_data.len(),
                        candidate.confidence * 100.0
                    );
                }
            }
        }
        // Reset reader position for the main loop
        let _ = reader.seek(SeekFrom::Start(offset + file_data.len() as u64));
    }

    // Validate minimum size
    if (file_data.len() as u64) < sig.min_size {
        anyhow::bail!(
            "Extracted data too small ({} bytes < {} min)",
            file_data.len(),
            sig.min_size
        );
    }

    // Compute SHA-256 hash
    let mut hasher = Sha256::new();
    hasher.update(&file_data);
    let sha256 = format!("{:x}", hasher.finalize());

    // Structure-based validation
    let validation = crate::carver::validators::validate_carved_file(&file_data, sig.extension);
    let mut confidence = calculate_confidence(sig, &file_data);
    if validation.valid && validation.confidence_boost > 0.0 {
        confidence = (confidence + validation.confidence_boost).min(1.0);
    }
    if exact_length_detected {
        confidence = (confidence + 0.15).min(1.0);
    }

    // Save to output directory
    let category_dir = output_dir.join(sig.category.to_string().to_lowercase());
    fs::create_dir_all(&category_dir)?;

    let filename = format!(
        "carved_{:04}_{}.{}",
        file_index,
        &sha256[..8],
        sig.extension
    );
    let output_path = category_dir.join(&filename);

    let mut output_file = fs::File::create(&output_path)?;
    output_file.write_all(&file_data)?;

    // Severity assessment
    let entropy = calculate_shannon_entropy(&file_data[..std::cmp::min(file_data.len(), 65536)]);
    let artifact_score = crate::carver::severity::score_artifact(&filename, sig.extension, entropy, file_data.len() as u64);

    let recovery_method = if exact_length_detected {
        "IntelliRAW Structure Decoder".to_string()
    } else if is_fragment {
        "Bi-Fragment Reassembly".to_string()
    } else if footer_found {
        "Signature Header/Footer Carve".to_string()
    } else {
        "Raw Signature Carve".to_string()
    };

    let details = if exact_length_detected {
        if validation.details.is_empty() {
            format!("IntelliRAW decoded exact length: {} bytes", detected_exact_len)
        } else {
            format!("{} | Exact length {} bytes decoded from container", validation.details, detected_exact_len)
        }
    } else {
        validation.details
    };

    Ok(CarvedFile {
        file_type: sig.name.to_string(),
        extension: sig.extension.to_string(),
        category: sig.category,
        offset,
        size: file_data.len() as u64,
        sha256,
        output_path: output_path.to_string_lossy().to_string(),
        confidence,
        structural_validity: validation.valid || exact_length_detected,
        validation_details: details,
        severity: artifact_score.severity.to_string(),
        is_fragment,
        original_filename: None,
        original_path: None,
        created_time: None,
        modified_time: None,
        recovery_method: Some(recovery_method),
    })
}

/// Calculates a confidence score (0.0 - 1.0) for a carved file.
/// Higher scores indicate more likely valid files.
fn calculate_confidence(sig: &FileSignature, data: &[u8]) -> f64 {
    let mut score: f64 = 0.5; // Base: we found the header

    // Bonus: file has valid footer
    if let Some(footer) = sig.footer {
        if data.len() >= footer.len() && &data[data.len() - footer.len()..] == footer {
            score += 0.3;
        }
    } else {
        score += 0.1; // No footer to check, slight bump
    }

    // Bonus: file size is reasonable (not suspiciously tiny or at max_size cap)
    let size = data.len() as u64;
    if size > sig.min_size * 2 && size < sig.max_size / 2 {
        score += 0.1;
    }

    // Bonus: entropy check for certain types
    if matches!(
        sig.category,
        FileCategory::Image | FileCategory::Video | FileCategory::Audio
    ) {
        // Compressed media should have high entropy (close to 8.0)
        let entropy = calculate_shannon_entropy(data);
        if entropy > 6.0 {
            score += 0.1;
        }
    }

    // BFD-based classification boost
    let bfd_result = crate::carver::bfd::classify_block(&data[..std::cmp::min(data.len(), 4096)]);
    if bfd_result.confidence > 0.7 {
        // If BFD classification matches the expected file type, boost confidence
        use crate::carver::bfd::DataClass;
        let bfd_matches = match (sig.category, &bfd_result.class) {
            (FileCategory::Image, DataClass::Jpeg | DataClass::Png) => true,
            (FileCategory::Document, DataClass::Pdf) => true,
            (FileCategory::Archive, DataClass::CompressedArchive) => true,
            _ => false,
        };
        if bfd_matches {
            score = (score + 0.1).min(1.0);
        }
    }

    score.min(1.0)
}

/// Shannon entropy of a byte buffer (0.0 = all same, 8.0 = perfectly random).
fn calculate_shannon_entropy(data: &[u8]) -> f64 {
    if data.is_empty() {
        return 0.0;
    }
    let mut freq = [0u64; 256];
    for &byte in data {
        freq[byte as usize] += 1;
    }
    let len = data.len() as f64;
    let mut entropy = 0.0;
    for &count in &freq {
        if count > 0 {
            let p = count as f64 / len;
            entropy -= p * p.log2();
        }
    }
    entropy
}

/// Fast SIMD/64-bit word check to determine if a memory chunk is entirely 0x00.
#[inline]
pub fn is_all_zeros(data: &[u8]) -> bool {
    let (prefix, chunks, suffix) = unsafe { data.align_to::<u64>() };
    prefix.iter().all(|&b| b == 0)
        && chunks.iter().all(|&w| w == 0)
        && suffix.iter().all(|&b| b == 0)
}

// ── Source reader abstraction ───────────────────────────────

/// Trait combining Read + Seek for polymorphic source handling.
pub trait ReadSeek: Read + Seek {}
impl<T: Read + Seek> ReadSeek for T {}

/// Opens a source for reading — handles both files and raw disk paths.
fn open_source(path: &str) -> Result<Box<dyn ReadSeek>> {
    if path.starts_with("\\\\.\\") {
        // Raw disk / volume path — use Win32 API
        open_raw_device(path)
    } else {
        // Regular file (disk image)
        let file =
            fs::File::open(path).with_context(|| format!("Failed to open source: {}", path))?;
        Ok(Box::new(file))
    }
}

/// Opens a raw disk or volume for reading using Win32 CreateFileW.
#[cfg(windows)]
fn open_raw_device(path: &str) -> Result<Box<dyn ReadSeek>> {
    use std::os::windows::io::FromRawHandle;
    use windows::core::{HSTRING, PCWSTR};
    use windows::Win32::Foundation::GENERIC_READ;
    use windows::Win32::Storage::FileSystem::{
        CreateFileW, FILE_FLAGS_AND_ATTRIBUTES, FILE_SHARE_READ,
        FILE_SHARE_WRITE, OPEN_EXISTING,
    };

    let hstring = HSTRING::from(path);
    let handle = unsafe {
        CreateFileW(
            PCWSTR(hstring.as_ptr()),
            GENERIC_READ.0,
            FILE_SHARE_READ | FILE_SHARE_WRITE,
            None,
            OPEN_EXISTING,
            FILE_FLAGS_AND_ATTRIBUTES(0),
            None,
        )
    }?;

    if handle.is_invalid() {
        anyhow::bail!("Failed to open raw device: {}", path);
    }

    let std_handle = unsafe { std::fs::File::from_raw_handle(handle.0 as *mut std::ffi::c_void) };
    Ok(Box::new(std_handle))
}

#[cfg(not(windows))]
fn open_raw_device(path: &str) -> Result<Box<dyn ReadSeek>> {
    let file = fs::File::open(path)?;
    Ok(Box::new(file))
}

/// Discovers and recovers deleted files with original filenames, paths, and timestamps
/// using NTFS Master File Table (MFT) records and FAT32 directory tables.
fn scan_and_recover_filesystem_metadata(
    reader: &mut Box<dyn ReadSeek>,
    output_dir: &Path,
) -> Vec<CarvedFile> {
    let mut results = Vec::new();

    // 1. Attempt NTFS MFT discovery
    if let Ok((mft_entries, cluster_size)) = crate::carver::ntfs_mft::scan_ntfs_volume(&mut **reader, true) {
        info!("NTFS MFT discovered {} deleted records", mft_entries.len());
        for entry in mft_entries {
            if entry.is_directory || entry.filename.is_empty() {
                continue;
            }

            let file_data = if let Some(ref res_bytes) = entry.resident_data {
                res_bytes.clone()
            } else if !entry.data_runs.is_empty() && entry.file_size > 0 && entry.file_size <= 256 * 1024 * 1024 {
                crate::carver::ntfs_mft::recover_file_from_data_runs(&mut **reader, &entry.data_runs, cluster_size, entry.file_size).unwrap_or_default()
            } else {
                Vec::new()
            };

            if !file_data.is_empty() {
                let ext = Path::new(&entry.filename)
                    .extension()
                    .and_then(|e| e.to_str())
                    .unwrap_or("dat")
                    .to_lowercase();

                let category = match ext.as_str() {
                    "jpg" | "jpeg" | "png" | "gif" | "bmp" | "webp" | "tiff" => FileCategory::Image,
                    "pdf" | "doc" | "docx" | "xls" | "xlsx" | "ppt" | "pptx" | "txt" | "rtf" => FileCategory::Document,
                    "mp4" | "avi" | "mkv" | "mov" => FileCategory::Video,
                    "mp3" | "wav" | "flac" => FileCategory::Audio,
                    "zip" | "7z" | "rar" | "gz" | "tar" => FileCategory::Archive,
                    "exe" | "dll" | "elf" => FileCategory::Executable,
                    "db" | "sqlite" | "sqlite3" => FileCategory::Database,
                    _ => FileCategory::Document,
                };

                let cat_name = format!("{:?}", category).to_lowercase();
                let cat_dir = output_dir.join(&cat_name);
                let _ = fs::create_dir_all(&cat_dir);

                let out_file_path = cat_dir.join(&entry.filename);
                if let Ok(mut f) = fs::File::create(&out_file_path) {
                    let _ = f.write_all(&file_data);
                }

                let mut hasher = Sha256::new();
                hasher.update(&file_data);
                let sha256 = hex::encode(hasher.finalize());

                let entropy = calculate_shannon_entropy(&file_data[..std::cmp::min(file_data.len(), 65536)]);
                let artifact_score = crate::carver::severity::score_artifact(&entry.filename, &ext, entropy, file_data.len() as u64);

                let method = if entry.resident_data.is_some() {
                    "NTFS MFT (Resident)".to_string()
                } else {
                    "NTFS MFT (Cluster Runs)".to_string()
                };

                results.push(CarvedFile {
                    file_type: ext.to_uppercase(),
                    extension: ext,
                    category,
                    offset: entry.record_number * 1024,
                    size: file_data.len() as u64,
                    sha256,
                    output_path: out_file_path.to_string_lossy().to_string(),
                    confidence: 0.98,
                    structural_validity: true,
                    validation_details: format!("Recovered intact via {}", method),
                    severity: artifact_score.severity.to_string(),
                    is_fragment: false,
                    original_filename: Some(entry.filename.clone()),
                    original_path: entry.full_path.clone(),
                    created_time: Some(crate::carver::ntfs_mft::filetime_to_iso(entry.created)),
                    modified_time: Some(crate::carver::ntfs_mft::filetime_to_iso(entry.modified)),
                    recovery_method: Some(method),
                });
            }
        }
    }

    // 2. Attempt FAT32 Directory Table scan
    let _ = reader.seek(SeekFrom::Start(0));
    if let Ok(fat_records) = crate::carver::fat_dir::scan_fat32_records(&mut **reader, true) {
        info!("FAT32 discovered {} deleted records", fat_records.len());
        for rec in fat_records {
            if rec.is_directory || rec.filename.is_empty() || rec.file_size == 0 || !rec.recoverable {
                continue;
            }

            if let Ok(file_data) = crate::carver::fat_dir::recover_file_from_volume(&mut **reader, rec.byte_offset, rec.file_size) {
                if !file_data.is_empty() {
                    let ext = Path::new(&rec.filename)
                        .extension()
                        .and_then(|e| e.to_str())
                        .unwrap_or("dat")
                        .to_lowercase();

                    let category = match ext.as_str() {
                        "jpg" | "jpeg" | "png" | "gif" | "bmp" => FileCategory::Image,
                        "pdf" | "doc" | "docx" | "txt" => FileCategory::Document,
                        "mp4" | "avi" => FileCategory::Video,
                        "mp3" | "wav" => FileCategory::Audio,
                        "zip" | "rar" => FileCategory::Archive,
                        _ => FileCategory::Document,
                    };

                    let cat_dir = output_dir.join(format!("{:?}", category).to_lowercase());
                    let _ = fs::create_dir_all(&cat_dir);
                    let out_path = cat_dir.join(&rec.filename);
                    if let Ok(mut f) = fs::File::create(&out_path) {
                        let _ = f.write_all(&file_data);
                    }

                    let mut hasher = Sha256::new();
                    hasher.update(&file_data);
                    let sha256 = hex::encode(hasher.finalize());

                    results.push(CarvedFile {
                        file_type: ext.to_uppercase(),
                        extension: ext,
                        category,
                        offset: rec.byte_offset,
                        size: file_data.len() as u64,
                        sha256,
                        output_path: out_path.to_string_lossy().to_string(),
                        confidence: 0.95,
                        structural_validity: true,
                        validation_details: "Recovered via FAT32 Directory Table".to_string(),
                        severity: "Medium".to_string(),
                        is_fragment: false,
                        original_filename: Some(rec.filename.clone()),
                        original_path: Some(format!("\\{}", rec.filename)),
                        created_time: Some(rec.created),
                        modified_time: Some(rec.modified),
                        recovery_method: Some("FAT32 Directory Table".to_string()),
                    });
                }
            }
        }
    }

    // 3. Attempt exFAT Directory Table scan
    let _ = reader.seek(SeekFrom::Start(0));
    if let Ok(exfat_records) = crate::carver::exfat_dir::scan_exfat_records(&mut **reader, true) {
        info!("exFAT discovered {} deleted records", exfat_records.len());
        for rec in exfat_records {
            if rec.is_directory || rec.filename.is_empty() || rec.file_size == 0 || !rec.recoverable {
                continue;
            }

            if let Ok(file_data) = crate::carver::exfat_dir::recover_exfat_file_from_volume(&mut **reader, rec.byte_offset, rec.file_size) {
                if !file_data.is_empty() {
                    let ext = Path::new(&rec.filename)
                        .extension()
                        .and_then(|e| e.to_str())
                        .unwrap_or("dat")
                        .to_lowercase();

                    let category = match ext.as_str() {
                        "jpg" | "jpeg" | "png" | "gif" | "bmp" | "webp" => FileCategory::Image,
                        "pdf" | "doc" | "docx" | "xls" | "xlsx" | "ppt" | "pptx" | "txt" => FileCategory::Document,
                        "mp4" | "avi" | "mkv" | "mov" => FileCategory::Video,
                        "mp3" | "wav" | "flac" => FileCategory::Audio,
                        "zip" | "7z" | "rar" => FileCategory::Archive,
                        "db" | "sqlite" => FileCategory::Database,
                        _ => FileCategory::Document,
                    };

                    let cat_dir = output_dir.join(format!("{:?}", category).to_lowercase());
                    let _ = fs::create_dir_all(&cat_dir);
                    let out_path = cat_dir.join(&rec.filename);
                    if let Ok(mut f) = fs::File::create(&out_path) {
                        let _ = f.write_all(&file_data);
                    }

                    let mut hasher = Sha256::new();
                    hasher.update(&file_data);
                    let sha256 = hex::encode(hasher.finalize());

                    let entropy = calculate_shannon_entropy(&file_data[..std::cmp::min(file_data.len(), 65536)]);
                    let artifact_score = crate::carver::severity::score_artifact(&rec.filename, &ext, entropy, file_data.len() as u64);

                    results.push(CarvedFile {
                        file_type: ext.to_uppercase(),
                        extension: ext,
                        category,
                        offset: rec.byte_offset,
                        size: file_data.len() as u64,
                        sha256,
                        output_path: out_path.to_string_lossy().to_string(),
                        confidence: 0.97,
                        structural_validity: true,
                        validation_details: "Recovered via exFAT Directory Table Entry Set".to_string(),
                        severity: artifact_score.severity.to_string(),
                        is_fragment: false,
                        original_filename: Some(rec.filename.clone()),
                        original_path: Some(format!("\\{}", rec.filename)),
                        created_time: Some(rec.created),
                        modified_time: Some(rec.modified),
                        recovery_method: Some("exFAT Directory Table".to_string()),
                    });
                }
            }
        }
    }

    results
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::io::Write;

    #[test]
    fn test_carve_from_image_file() {
        // Create a temp file with an embedded JPEG
        let dir = std::env::temp_dir().join("ps149_carve_test");
        let _ = fs::remove_dir_all(&dir);
        fs::create_dir_all(&dir).unwrap();

        let image_path = dir.join("test_image.raw");
        let output_dir = dir.join("recovered");

        // Build a fake raw image: garbage + JPEG header + data + JPEG footer + garbage
        let mut raw_data = Vec::new();
        raw_data.extend_from_slice(&[0x00; 4096]); // 4KB garbage (first sector)
                                                   // JPEG at offset 4096
        raw_data.extend_from_slice(&[0xFF, 0xD8, 0xFF, 0xE0]); // JPEG header
        raw_data.extend_from_slice(&[0x42; 500]); // Fake JPEG data
        raw_data.extend_from_slice(&[0xFF, 0xD9]); // JPEG footer
        raw_data.extend_from_slice(&[0x00; 4096 - 506]); // Pad to sector boundary
        raw_data.extend_from_slice(&[0x00; 4096]); // More garbage

        let mut f = fs::File::create(&image_path).unwrap();
        f.write_all(&raw_data).unwrap();

        // Run carving
        let result = carve_from_source(
            image_path.to_str().unwrap(),
            &output_dir,
            Some(raw_data.len() as u64),
            |_| {},
        )
        .unwrap();

        assert!(result.files_found >= 1, "Should find at least 1 JPEG");
        assert_eq!(result.carved_files[0].extension, "jpg");
        assert!(result.carved_files[0].confidence > 0.5);

        // Cleanup
        let _ = fs::remove_dir_all(&dir);
    }

    #[test]
    fn test_shannon_entropy() {
        // All zeros → entropy ~0
        let zeros = vec![0u8; 1024];
        let e = calculate_shannon_entropy(&zeros);
        assert!(e < 0.01, "All zeros should have ~0 entropy, got {}", e);

        // Random data → entropy ~8
        let mut rng_data = vec![0u8; 10000];
        for (i, byte) in rng_data.iter_mut().enumerate() {
            *byte = (i * 7 + 13) as u8; // Pseudo-spread
        }
        let e2 = calculate_shannon_entropy(&rng_data);
        assert!(e2 > 5.0, "Spread data should have high entropy, got {}", e2);
    }
}
