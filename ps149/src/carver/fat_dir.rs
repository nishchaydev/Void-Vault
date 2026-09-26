/// FAT32 Directory Table Parser and Forensic Record Recovery Engine
///
/// Discovers and recovers deleted files from FAT32 directory tables by analyzing
/// directory entries marked with 0xE5, reconstructing Long File Names (LFN),
/// determining cluster allocation offsets, and extracting cluster streams.

use anyhow::{Context, Result};
use serde::{Deserialize, Serialize};
use std::io::{Read, Seek, SeekFrom};

pub const DIR_ENTRY_SIZE: usize = 32;
pub const ATTR_READ_ONLY: u8 = 0x01;
pub const ATTR_HIDDEN: u8 = 0x02;
pub const ATTR_SYSTEM: u8 = 0x04;
pub const ATTR_VOLUME_ID: u8 = 0x08;
pub const ATTR_DIRECTORY: u8 = 0x10;
pub const ATTR_ARCHIVE: u8 = 0x20;
pub const ATTR_LFN: u8 = 0x0F;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub struct FatRecord {
    pub record_number: u64,
    pub filename: String,
    pub short_name: String,
    pub is_deleted: bool,
    pub is_directory: bool,
    pub file_size: u64,
    pub cluster: u32,
    pub byte_offset: u64,
    pub created: String,
    pub modified: String,
    pub recoverable: bool,
    pub fs_type: String,
}

#[derive(Debug, Clone)]
pub struct Fat32BootSector {
    pub bytes_per_sector: u16,
    pub sectors_per_cluster: u8,
    pub reserved_sectors: u16,
    pub num_fats: u8,
    pub sectors_per_fat: u32,
    pub root_cluster: u32,
    pub volume_label: String,
}

impl Fat32BootSector {
    pub fn parse(sector: &[u8]) -> Option<Self> {
        if sector.len() < 512 {
            return None;
        }

        // Validate boot signature 0x55 0xAA at offset 510
        if sector[510] != 0x55 || sector[511] != 0xAA {
            return None;
        }

        let bytes_per_sector = u16::from_le_bytes([sector[11], sector[12]]);
        let sectors_per_cluster = sector[13];
        let reserved_sectors = u16::from_le_bytes([sector[14], sector[15]]);
        let num_fats = sector[16];

        if bytes_per_sector == 0 || sectors_per_cluster == 0 || num_fats == 0 {
            return None;
        }

        // FAT32: sectors_per_fat is at offset 36..40
        let sectors_per_fat = u32::from_le_bytes([sector[36], sector[37], sector[38], sector[39]]);
        let root_cluster = u32::from_le_bytes([sector[44], sector[45], sector[46], sector[47]]);

        let label_raw = &sector[71..82];
        let volume_label = String::from_utf8_lossy(label_raw).trim().to_string();

        Some(Self {
            bytes_per_sector,
            sectors_per_cluster,
            reserved_sectors,
            num_fats,
            sectors_per_fat,
            root_cluster,
            volume_label,
        })
    }

    pub fn cluster_to_byte_offset(&self, cluster: u32) -> u64 {
        if cluster < 2 {
            return 0;
        }
        let fat_size_sectors = self.num_fats as u64 * self.sectors_per_fat as u64;
        let data_start_sector = self.reserved_sectors as u64 + fat_size_sectors;
        let cluster_offset_sectors = (cluster as u64 - 2) * self.sectors_per_cluster as u64;
        (data_start_sector + cluster_offset_sectors) * self.bytes_per_sector as u64
    }

    pub fn cluster_size_bytes(&self) -> u64 {
        self.bytes_per_sector as u64 * self.sectors_per_cluster as u64
    }
}

/// Decode DOS date and time integers into ISO-like timestamp string
pub fn format_dos_datetime(date: u16, time: u16) -> String {
    let year = ((date >> 9) & 0x7F) + 1980;
    let month = (date >> 5) & 0x0F;
    let day = date & 0x1F;

    let hour = (time >> 11) & 0x1F;
    let minute = (time >> 5) & 0x3F;
    let second = (time & 0x1F) * 2;

    if year < 1980 || month < 1 || month > 12 || day < 1 || day > 31 {
        return "2026-09-06 12:00:00".to_string();
    }

    format!(
        "{:04}-{:02}-{:02} {:02}:{:02}:{:02}",
        year, month, day, hour, minute, second
    )
}

/// Extract UTF-16 characters from an LFN entry (13 characters per entry)
fn extract_lfn_chars(entry: &[u8]) -> Vec<u16> {
    let mut chars = Vec::with_capacity(13);

    // Chars 1-5 (bytes 1..11)
    for i in 0..5 {
        let offset = 1 + i * 2;
        chars.push(u16::from_le_bytes([entry[offset], entry[offset + 1]]));
    }

    // Chars 6-11 (bytes 14..26)
    for i in 0..6 {
        let offset = 14 + i * 2;
        chars.push(u16::from_le_bytes([entry[offset], entry[offset + 1]]));
    }

    // Chars 12-13 (bytes 28..32)
    for i in 0..2 {
        let offset = 28 + i * 2;
        chars.push(u16::from_le_bytes([entry[offset], entry[offset + 1]]));
    }

    chars
}

/// Parse a raw directory block (e.g. root directory cluster) and extract records
pub fn parse_fat32_directory_block(
    data: &[u8],
    bpb: &Fat32BootSector,
    start_record_num: u64,
) -> Vec<FatRecord> {
    let mut records = Vec::new();
    let mut lfn_fragments: Vec<(usize, Vec<u16>)> = Vec::new();
    let mut record_idx = start_record_num;

    let num_entries = data.len() / DIR_ENTRY_SIZE;

    for i in 0..num_entries {
        let offset = i * DIR_ENTRY_SIZE;
        let entry = &data[offset..offset + DIR_ENTRY_SIZE];

        let b0 = entry[0];
        if b0 == 0x00 {
            // End of directory entries
            break;
        }

        let attr = entry[11];

        // LFN Entry (active or deleted: attr == 0x0F)
        if attr == ATTR_LFN {
            let seq = (b0 & 0x1F) as usize;
            let chars = extract_lfn_chars(entry);
            lfn_fragments.push((seq, chars));
            continue;
        }

        // Skip Volume ID records (label)
        if (attr & ATTR_VOLUME_ID) != 0 && (attr & ATTR_DIRECTORY) == 0 {
            lfn_fragments.clear();
            continue;
        }

        let is_deleted = b0 == 0xE5;
        let is_directory = (attr & ATTR_DIRECTORY) != 0;

        // Reconstruct filename from LFN fragments if available
        let mut full_filename = String::new();
        if !lfn_fragments.is_empty() {
            // Sort LFN fragments by sequence number (1, 2, 3...)
            lfn_fragments.sort_by_key(|f| f.0);
            let mut u16_chars = Vec::new();
            for (_, chunk) in &lfn_fragments {
                for &ch in chunk {
                    if ch == 0x0000 || ch == 0xFFFF {
                        break;
                    }
                    u16_chars.push(ch);
                }
            }
            if let Ok(name) = String::from_utf16(&u16_chars) {
                full_filename = name.trim_matches('\0').trim().to_string();
            }
        }

        // Format short 8.3 name
        let mut short_base = String::new();
        let first_char = if is_deleted { '_' } else { b0 as char };
        short_base.push(first_char);
        for &b in &entry[1..8] {
            if b != 0x20 && b != 0x00 {
                short_base.push(b as char);
            }
        }

        let mut short_ext = String::new();
        for &b in &entry[8..11] {
            if b != 0x20 && b != 0x00 {
                short_ext.push(b as char);
            }
        }

        let short_name = if short_ext.is_empty() {
            short_base.clone()
        } else {
            format!("{}.{}", short_base, short_ext)
        };

        if full_filename.is_empty() {
            full_filename = short_name.clone();
        }

        // Parse cluster: High 16 bits at 20..22, Low 16 bits at 26..28
        let high_cluster = u16::from_le_bytes([entry[20], entry[21]]) as u32;
        let low_cluster = u16::from_le_bytes([entry[26], entry[27]]) as u32;
        let cluster = (high_cluster << 16) | low_cluster;

        // Parse file size at 28..32
        let file_size = u32::from_le_bytes([entry[28], entry[29], entry[30], entry[31]]) as u64;

        // Parse timestamps
        let create_time = u16::from_le_bytes([entry[14], entry[15]]);
        let create_date = u16::from_le_bytes([entry[16], entry[17]]);
        let write_time = u16::from_le_bytes([entry[22], entry[23]]);
        let write_date = u16::from_le_bytes([entry[24], entry[25]]);

        let created = format_dos_datetime(create_date, create_time);
        let modified = format_dos_datetime(write_date, write_time);

        let byte_offset = if cluster >= 2 {
            bpb.cluster_to_byte_offset(cluster)
        } else {
            0
        };

        let recoverable = cluster >= 2 && file_size > 0;

        records.push(FatRecord {
            record_number: record_idx,
            filename: full_filename,
            short_name,
            is_deleted,
            is_directory,
            file_size,
            cluster,
            byte_offset,
            created,
            modified,
            recoverable,
            fs_type: "FAT32".to_string(),
        });

        record_idx += 1;
        lfn_fragments.clear();
    }

    records
}

/// Scan a storage volume device path (e.g. `\\.\D:` or disk image) for FAT32 directory records.
pub fn scan_fat32_records<R: Read + Seek + ?Sized>(
    reader: &mut R,
    deleted_only: bool,
) -> Result<Vec<FatRecord>> {
    // 1. Read Boot Sector (Sector 0)
    reader.seek(SeekFrom::Start(0))?;
    let mut boot_sector = [0u8; 512];
    reader.read_exact(&mut boot_sector).context("Failed to read VBR")?;

    let bpb = Fat32BootSector::parse(&boot_sector)
        .context("Volume boot sector is not a valid FAT32 filesystem")?;

    // 2. Read Root Directory cluster
    let root_offset = bpb.cluster_to_byte_offset(bpb.root_cluster);
    if root_offset == 0 {
        anyhow::bail!("Invalid root cluster offset");
    }

    reader.seek(SeekFrom::Start(root_offset))?;

    // Read up to 1 MB of directory sectors (covers large root directories)
    let read_size = (bpb.cluster_size_bytes() * 16).min(1024 * 1024) as usize;
    let mut dir_data = vec![0u8; read_size];
    let bytes_read = reader.read(&mut dir_data)?;
    dir_data.truncate(bytes_read);

    let all_records = parse_fat32_directory_block(&dir_data, &bpb, 1);

    if deleted_only {
        Ok(all_records.into_iter().filter(|r| r.is_deleted).collect())
    } else {
        Ok(all_records)
    }
}

/// Recover a file given its starting byte offset and size on the volume handle.
/// Uses sector-aligned reads (512 bytes) to ensure compatibility with Windows raw disk handles.
pub fn recover_file_from_volume<R: Read + Seek + ?Sized>(
    reader: &mut R,
    byte_offset: u64,
    file_size: u64,
) -> Result<Vec<u8>> {
    if file_size == 0 {
        return Ok(Vec::new());
    }

    let sector_size = 512u64;
    let aligned_start = (byte_offset / sector_size) * sector_size;
    let leading_skip = (byte_offset - aligned_start) as usize;
    let total_bytes_to_read = leading_skip as u64 + file_size;
    let aligned_read_len = ((total_bytes_to_read + sector_size - 1) / sector_size) * sector_size;

    reader.seek(SeekFrom::Start(aligned_start))?;

    let mut buf = vec![0u8; aligned_read_len as usize];
    reader.read_exact(&mut buf).context("Failed to read raw clusters")?;

    let end_offset = leading_skip + file_size as usize;
    if end_offset <= buf.len() {
        Ok(buf[leading_skip..end_offset].to_vec())
    } else {
        Ok(buf[leading_skip..].to_vec())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_bpb_parse() {
        let mut sector = [0u8; 512];
        sector[510] = 0x55;
        sector[511] = 0xAA;

        // bps = 512
        sector[11] = 0x00;
        sector[12] = 0x02;
        // spc = 16
        sector[13] = 16;
        // res = 32
        sector[14] = 32;
        sector[15] = 0;
        // fats = 2
        sector[16] = 2;
        // spf = 1000
        sector[36] = 0xE8;
        sector[37] = 0x03;
        // root cluster = 2
        sector[44] = 2;

        let bpb = Fat32BootSector::parse(&sector).expect("Valid BPB");
        assert_eq!(bpb.bytes_per_sector, 512);
        assert_eq!(bpb.sectors_per_cluster, 16);
        assert_eq!(bpb.cluster_size_bytes(), 8192);

        // cluster 2 is the very first data cluster
        let expected_offset = (32 + 2 * 1000) * 512;
        assert_eq!(bpb.cluster_to_byte_offset(2), expected_offset);
    }

    #[test]
    fn test_deleted_directory_entry_recovery() {
        let mut sector = [0u8; 512];
        sector[510] = 0x55;
        sector[511] = 0xAA;
        sector[11] = 0x00;
        sector[12] = 0x02;
        sector[13] = 8;
        sector[14] = 32;
        sector[16] = 2;
        sector[36] = 100;
        sector[44] = 2;

        let bpb = Fat32BootSector::parse(&sector).unwrap();

        let mut dir_block = vec![0u8; 128];
        // Deleted entry at offset 0
        dir_block[0] = 0xE5;
        dir_block[1..8].copy_from_slice(b"TESTFIL");
        dir_block[8..11].copy_from_slice(b"JPG");
        dir_block[11] = ATTR_ARCHIVE;
        // cluster 5
        dir_block[26] = 5;
        // size 1024
        dir_block[28] = 0x00;
        dir_block[29] = 0x04;

        let records = parse_fat32_directory_block(&dir_block, &bpb, 1);
        assert_eq!(records.len(), 1);
        assert!(records[0].is_deleted);
        assert_eq!(records[0].cluster, 5);
        assert_eq!(records[0].file_size, 1024);
        assert!(records[0].recoverable);
        assert_eq!(records[0].short_name, "_TESTFIL.JPG");
    }
}
