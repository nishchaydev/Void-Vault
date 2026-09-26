pub const MFT_ENTRY_SIZE: usize = 1024;
pub const MFT_MAGIC: &[u8; 4] = b"FILE";
pub const ATTR_FILENAME: u32 = 0x30;
pub const ATTR_DATA: u32 = 0x80;
pub const ATTR_END: u32 = 0xFFFFFFFF;

use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::io::{Read, Seek, SeekFrom};

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct MftEntry {
    pub record_number: u64,
    pub is_deleted: bool,
    pub is_directory: bool,
    pub filename: String,
    #[serde(default)]
    pub full_path: Option<String>,
    pub parent_record: u64,
    pub file_size: u64,
    pub created: u64,
    pub modified: u64,
    #[serde(default)]
    pub resident_data: Option<Vec<u8>>,
    pub data_runs: Vec<DataRun>,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct DataRun {
    pub cluster_offset: u64,
    pub cluster_count: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MftScanResult {
    pub total_entries: usize,
    pub deleted_entries: Vec<MftEntry>,
    pub active_entries: usize,
}

/// Applies the NTFS Update Sequence Array (Fixup) to a 1024-byte MFT record.
/// Restores the original 2-byte values at the end of each 512-byte sector.
pub fn apply_mft_fixup(data: &mut [u8]) -> bool {
    if data.len() < MFT_ENTRY_SIZE || &data[0..4] != MFT_MAGIC {
        return false;
    }

    let fixup_offset = match data[0x04..0x06].try_into() {
        Ok(b) => u16::from_le_bytes(b) as usize,
        Err(_) => return false,
    };
    let fixup_count = match data[0x06..0x08].try_into() {
        Ok(b) => u16::from_le_bytes(b) as usize,
        Err(_) => return false,
    };

    // For 1024-byte record on 512-byte sectors: fixup_count is typically 3 (1 USN + 2 sectors)
    if fixup_count < 2 || fixup_offset + fixup_count * 2 > data.len() {
        return false;
    }

    let usn = [data[fixup_offset], data[fixup_offset + 1]];

    for i in 1..fixup_count {
        let sector_end = i * 512 - 2;
        if sector_end + 2 > data.len() {
            break;
        }

        // Check if the sequence number matches
        if data[sector_end] != usn[0] || data[sector_end + 1] != usn[1] {
            // Torn write / corruption detected, but we continue best-effort
        }

        let replacement_offset = fixup_offset + i * 2;
        data[sector_end] = data[replacement_offset];
        data[sector_end + 1] = data[replacement_offset + 1];
    }

    true
}

/// Converts a 64-bit Windows FILETIME (100-ns intervals since Jan 1, 1601 UTC)
/// into an ISO-8601 formatted timestamp string.
pub fn filetime_to_iso(filetime: u64) -> String {
    if filetime == 0 {
        return String::new();
    }
    let secs_since_1601 = filetime / 10_000_000;
    if secs_since_1601 < 11_644_473_600 {
        return String::new();
    }
    let unix_secs = (secs_since_1601 - 11_644_473_600) as i64;
    let nsecs = ((filetime % 10_000_000) * 100) as u32;

    if let Some(dt) = chrono::DateTime::from_timestamp(unix_secs, nsecs) {
        dt.to_rfc3339()
    } else {
        String::new()
    }
}

/// NTFS Volume Boot Record (Sector 0) parser.
#[derive(Debug, Clone)]
pub struct NtfsBootSector {
    pub bytes_per_sector: u16,
    pub sectors_per_cluster: u8,
    pub mft_start_lcn: i64,
    pub mft2_start_lcn: i64,
    pub clusters_per_mft_record: i8,
}

impl NtfsBootSector {
    pub fn parse(sector: &[u8]) -> Option<Self> {
        if sector.len() < 512 || &sector[3..11] != b"NTFS    " {
            return None;
        }
        let bytes_per_sector = u16::from_le_bytes(sector[0x0B..0x0D].try_into().ok()?);
        let sectors_per_cluster = sector[0x0D];
        let mft_start_lcn = i64::from_le_bytes(sector[0x30..0x38].try_into().ok()?);
        let mft2_start_lcn = i64::from_le_bytes(sector[0x38..0x40].try_into().ok()?);
        let clusters_per_mft_record = sector[0x40] as i8;

        Some(Self {
            bytes_per_sector,
            sectors_per_cluster,
            mft_start_lcn,
            mft2_start_lcn,
            clusters_per_mft_record,
        })
    }

    pub fn cluster_size(&self) -> u64 {
        (self.bytes_per_sector as u64) * (self.sectors_per_cluster as u64)
    }

    pub fn mft_byte_offset(&self) -> u64 {
        if self.mft_start_lcn >= 0 {
            (self.mft_start_lcn as u64) * self.cluster_size()
        } else {
            0
        }
    }

    pub fn mft_record_size(&self) -> usize {
        if self.clusters_per_mft_record < 0 {
            1usize << (-self.clusters_per_mft_record as usize)
        } else {
            (self.clusters_per_mft_record as usize) * (self.cluster_size() as usize)
        }
    }
}

pub fn parse_mft_entry(data: &[u8]) -> Option<MftEntry> {
    if data.len() < MFT_ENTRY_SIZE || &data[0..4] != MFT_MAGIC {
        return None;
    }

    // Work on a copy with fixup applied
    let mut record = data[..MFT_ENTRY_SIZE].to_vec();
    apply_mft_fixup(&mut record);

    let flags = u16::from_le_bytes(record[0x16..0x18].try_into().ok()?);
    let is_in_use = (flags & 0x01) != 0;
    let is_deleted = !is_in_use;
    let is_directory = (flags & 0x02) != 0;

    let record_number = u32::from_le_bytes(record[0x2C..0x30].try_into().ok()?) as u64;

    let mut entry = MftEntry {
        record_number,
        is_deleted,
        is_directory,
        filename: String::new(),
        full_path: None,
        parent_record: 0,
        file_size: 0,
        created: 0,
        modified: 0,
        resident_data: None,
        data_runs: Vec::new(),
    };

    let mut attr_offset = u16::from_le_bytes(record[0x14..0x16].try_into().ok()?) as usize;

    while attr_offset + 8 <= record.len() {
        let attr_type = u32::from_le_bytes(record[attr_offset..attr_offset + 4].try_into().ok()?);
        if attr_type == ATTR_END {
            break;
        }

        let attr_len =
            u32::from_le_bytes(record[attr_offset + 4..attr_offset + 8].try_into().ok()?) as usize;
        if attr_len == 0 || attr_offset + attr_len > record.len() {
            break; // Corrupt attribute
        }

        let non_resident = record[attr_offset + 8] != 0;

        match attr_type {
            ATTR_FILENAME => {
                let content_offset = attr_offset
                    + u16::from_le_bytes(
                        record[attr_offset + 0x14..attr_offset + 0x16]
                            .try_into()
                            .ok()?,
                    ) as usize;
                if content_offset + 66 <= attr_offset + attr_len {
                    let parent = u64::from_le_bytes(
                        record[content_offset..content_offset + 8].try_into().ok()?,
                    ) & 0x0000FFFFFFFFFFFF;
                    let created = u64::from_le_bytes(
                        record[content_offset + 8..content_offset + 16]
                            .try_into()
                            .ok()?,
                    );
                    let modified = u64::from_le_bytes(
                        record[content_offset + 16..content_offset + 24]
                            .try_into()
                            .ok()?,
                    );

                    let namespace = record[content_offset + 65];
                    let filename_len = record[content_offset + 64] as usize;
                    let filename_start = content_offset + 66;
                    let filename_end = filename_start + filename_len * 2;

                    if filename_end <= attr_offset + attr_len {
                        let utf16_chars: Vec<u16> = record[filename_start..filename_end]
                            .chunks_exact(2)
                            .map(|c| u16::from_le_bytes([c[0], c[1]]))
                            .collect();
                        let parsed_name = String::from_utf16_lossy(&utf16_chars);

                        // Prefer Win32 / Win32+DOS namespaces over DOS 8.3 short names
                        if entry.filename.is_empty() || namespace == 1 || namespace == 3 {
                            entry.filename = parsed_name;
                            entry.parent_record = parent;
                            entry.created = created;
                            entry.modified = modified;
                        }
                    }
                }
            }
            ATTR_DATA => {
                if non_resident {
                    // Non-resident stream: real file size is at offset 0x30..0x38
                    if attr_offset + 0x38 <= record.len() {
                        let real_size = u64::from_le_bytes(
                            record[attr_offset + 0x30..attr_offset + 0x38]
                                .try_into()
                                .ok()?,
                        );
                        entry.file_size = real_size;
                    }

                    if attr_offset + 0x22 <= record.len() {
                        let runlist_offset = attr_offset
                            + u16::from_le_bytes(
                                record[attr_offset + 0x20..attr_offset + 0x22]
                                    .try_into()
                                    .ok()?,
                            ) as usize;
                        if runlist_offset < attr_offset + attr_len {
                            entry.data_runs =
                                parse_data_runs(&record[runlist_offset..attr_offset + attr_len]);
                        }
                    }
                } else {
                    // Resident stream: content is stored inside MFT record
                    let content_offset = attr_offset
                        + u16::from_le_bytes(
                            record[attr_offset + 0x14..attr_offset + 0x16]
                                .try_into()
                                .ok()?,
                        ) as usize;
                    let content_len = u32::from_le_bytes(
                        record[attr_offset + 0x10..attr_offset + 0x14]
                            .try_into()
                            .ok()?,
                    ) as usize;
                    entry.file_size = content_len as u64;

                    if content_offset + content_len <= attr_offset + attr_len
                        && content_offset + content_len <= record.len()
                    {
                        entry.resident_data =
                            Some(record[content_offset..content_offset + content_len].to_vec());
                    }
                }
            }
            _ => {}
        }

        attr_offset += attr_len;
    }

    Some(entry)
}

pub fn scan_mft_region(data: &[u8]) -> MftScanResult {
    let mut total_entries = 0;
    let mut deleted_entries = Vec::new();
    let mut active_entries = 0;

    for chunk in data.chunks_exact(MFT_ENTRY_SIZE) {
        if chunk.len() == MFT_ENTRY_SIZE && &chunk[0..4] == MFT_MAGIC {
            total_entries += 1;
            if let Some(entry) = parse_mft_entry(chunk) {
                if entry.is_deleted {
                    deleted_entries.push(entry);
                } else {
                    active_entries += 1;
                }
            }
        }
    }

    MftScanResult {
        total_entries,
        deleted_entries,
        active_entries,
    }
}

pub fn parse_data_runs(data: &[u8]) -> Vec<DataRun> {
    let mut runs = Vec::new();
    let mut offset = 0;
    let mut current_cluster = 0u64;

    while offset < data.len() {
        let header = data[offset];
        if header == 0 {
            break;
        }
        offset += 1;

        let length_size = (header & 0x0F) as usize;
        let offset_size = (header >> 4) as usize;

        if offset + length_size + offset_size > data.len() {
            break;
        }

        let mut cluster_count = 0u64;
        for i in 0..length_size {
            cluster_count |= (data[offset + i] as u64) << (i * 8);
        }
        offset += length_size;

        let mut cluster_offset_delta = 0i64;
        for i in 0..offset_size {
            cluster_offset_delta |= (data[offset + i] as i64) << (i * 8);
        }

        // Sign extension
        if offset_size > 0 {
            let sign_bit = 1 << ((offset_size * 8) - 1);
            if cluster_offset_delta & sign_bit != 0 {
                let mask = !((1i64 << (offset_size * 8)) - 1);
                cluster_offset_delta |= mask;
            }
        }
        offset += offset_size;

        // Reconstruct absolute cluster offset
        let mut abs_cluster_offset = 0;
        if offset_size > 0 {
            current_cluster = (current_cluster as i64 + cluster_offset_delta) as u64;
            abs_cluster_offset = current_cluster;
        }

        runs.push(DataRun {
            cluster_offset: abs_cluster_offset,
            cluster_count,
        });
    }

    runs
}

/// Reads file data from a non-resident MFT data runlist.
pub fn recover_file_from_data_runs<R: Read + Seek + ?Sized>(
    reader: &mut R,
    runs: &[DataRun],
    cluster_size: u64,
    file_size: u64,
) -> Result<Vec<u8>> {
    if file_size == 0 || runs.is_empty() {
        return Ok(Vec::new());
    }

    let mut out = Vec::with_capacity(file_size.min(100 * 1024 * 1024) as usize);
    let mut remaining = file_size;

    for run in runs {
        if remaining == 0 {
            break;
        }
        let run_bytes = run.cluster_count * cluster_size;
        let bytes_to_read = remaining.min(run_bytes) as usize;

        if run.cluster_offset == 0 {
            // Sparse run
            out.resize(out.len() + bytes_to_read, 0);
            remaining -= bytes_to_read as u64;
            continue;
        }

        let abs_byte_offset = run.cluster_offset * cluster_size;
        if reader.seek(SeekFrom::Start(abs_byte_offset)).is_err() {
            break;
        }

        let mut buf = vec![0u8; bytes_to_read];
        let bytes_read = match reader.read(&mut buf) {
            Ok(n) => n,
            Err(_) => break,
        };

        out.extend_from_slice(&buf[..bytes_read]);
        remaining -= bytes_read as u64;
    }

    Ok(out)
}

/// Scans an NTFS volume for both deleted and active MFT records,
/// constructs full folder paths by following parent record chains,
/// and returns all discovered entries.
pub fn scan_ntfs_volume<R: Read + Seek + ?Sized>(
    reader: &mut R,
    deleted_only: bool,
) -> Result<(Vec<MftEntry>, u64)> {
    // 1. Read Sector 0 (VBR)
    reader.seek(SeekFrom::Start(0))?;
    let mut boot_buf = [0u8; 512];
    reader.read_exact(&mut boot_buf).context("Failed to read NTFS boot sector")?;

    let boot = NtfsBootSector::parse(&boot_buf)
        .context("Volume is not an NTFS filesystem")?;

    let mft_offset = boot.mft_byte_offset();
    let cluster_size = boot.cluster_size();
    if mft_offset == 0 {
        anyhow::bail!("Invalid MFT start cluster");
    }

    // 2. Seek to $MFT and read MFT records (scan up to 16 MB of MFT table = 16,384 records)
    reader.seek(SeekFrom::Start(mft_offset))?;
    let max_mft_read = 16 * 1024 * 1024; // 16 MB
    let mut mft_bytes = vec![0u8; max_mft_read];
    let bytes_read = reader.read(&mut mft_bytes).unwrap_or(0);
    mft_bytes.truncate(bytes_read);

    // 3. First pass: parse all valid records to build the record_number -> (filename, parent) map
    let mut name_map = HashMap::new();
    let mut all_entries = Vec::new();

    for chunk in mft_bytes.chunks_exact(MFT_ENTRY_SIZE) {
        if &chunk[0..4] == MFT_MAGIC {
            if let Some(entry) = parse_mft_entry(chunk) {
                if !entry.filename.is_empty() {
                    name_map.insert(entry.record_number, (entry.filename.clone(), entry.parent_record));
                }
                all_entries.push(entry);
            }
        }
    }

    // 4. Second pass: resolve full directory paths and filter
    let mut result_entries = Vec::new();
    for mut entry in all_entries {
        if deleted_only && !entry.is_deleted {
            continue;
        }

        // Build full path
        let mut path_parts = Vec::new();
        let mut curr = entry.record_number;
        let mut visited = std::collections::HashSet::new();

        while let Some((name, parent)) = name_map.get(&curr) {
            if !visited.insert(curr) || curr == 5 || *parent == curr {
                break;
            }
            if !name.is_empty() {
                path_parts.push(name.clone());
            }
            curr = *parent;
        }
        path_parts.reverse();
        if !path_parts.is_empty() {
            entry.full_path = Some(format!("\\{}", path_parts.join("\\")));
        }

        result_entries.push(entry);
    }

    Ok((result_entries, cluster_size))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_data_runs() {
        let data = vec![0x31, 0x02, 0x34, 0x12, 0x00, 0x00];
        let runs = parse_data_runs(&data);
        assert_eq!(runs.len(), 1);
        assert_eq!(runs[0].cluster_count, 2);
        assert_eq!(runs[0].cluster_offset, 0x1234);
    }

    #[test]
    fn test_parse_data_runs_negative() {
        let data = vec![0x11, 0x03, 0xFE, 0x00];
        let runs = parse_data_runs(&data);
        assert_eq!(runs.len(), 1);
        assert_eq!(runs[0].cluster_count, 3);
        assert_eq!(runs[0].cluster_offset, (-2i64) as u64);
    }

    #[test]
    fn test_parse_mft_entry() {
        let mut data = vec![0u8; 1024];
        data[0..4].copy_from_slice(b"FILE");

        data[0x16] = 0x03;
        data[0x14] = 0x38;

        data[0x2C] = 0x42;

        // $FILE_NAME attribute (type 0x30) at offset 0x38
        data[0x38] = 0x30;
        data[0x3C] = 0x68;
        data[0x40] = 0x00;
        data[0x4C] = 0x18;

        data[0x90] = 0x04; // 4 chars
        data[0x92] = b't';
        data[0x94] = b'e';
        data[0x96] = b's';
        data[0x98] = b't';

        data[0xA0] = 0xFF;
        data[0xA1] = 0xFF;
        data[0xA2] = 0xFF;
        data[0xA3] = 0xFF;

        let entry = parse_mft_entry(&data).unwrap();
        assert_eq!(entry.record_number, 0x42);
        assert_eq!(entry.is_deleted, false);
        assert_eq!(entry.is_directory, true);
        assert_eq!(entry.filename, "test");
    }

    #[test]
    fn test_scan_mft_region() {
        let mut data = vec![0u8; 2048];

        data[0..4].copy_from_slice(b"FILE");
        data[0x16] = 0x01;
        data[0x14] = 0x38;
        data[0x38..0x3C].copy_from_slice(&0xFFFFFFFFu32.to_le_bytes());

        data[1024..1028].copy_from_slice(b"FILE");
        data[1024 + 0x16] = 0x00;
        data[1024 + 0x14] = 0x38;
        data[1024 + 0x38..1024 + 0x3C].copy_from_slice(&0xFFFFFFFFu32.to_le_bytes());

        let result = scan_mft_region(&data);
        assert_eq!(result.total_entries, 2);
        assert_eq!(result.active_entries, 1);
        assert_eq!(result.deleted_entries.len(), 1);
    }

    #[test]
    fn test_filetime_to_iso() {
        // 133500000000000000 = ~2024
        let iso = filetime_to_iso(133500000000000000);
        assert!(!iso.is_empty());
        assert!(iso.starts_with("2024"));
    }

    #[test]
    fn test_ntfs_boot_sector_parse() {
        let mut sector = [0u8; 512];
        sector[3..11].copy_from_slice(b"NTFS    ");
        sector[0x0B..0x0D].copy_from_slice(&512u16.to_le_bytes());
        sector[0x0D] = 8; // 8 sectors/cluster = 4096 bytes
        sector[0x30..0x38].copy_from_slice(&786432i64.to_le_bytes());
        sector[0x40] = -10i8 as u8; // 2^10 = 1024 byte record

        let boot = NtfsBootSector::parse(&sector).unwrap();
        assert_eq!(boot.bytes_per_sector, 512);
        assert_eq!(boot.sectors_per_cluster, 8);
        assert_eq!(boot.cluster_size(), 4096);
        assert_eq!(boot.mft_record_size(), 1024);
        assert_eq!(boot.mft_byte_offset(), 786432 * 4096);
    }
}
