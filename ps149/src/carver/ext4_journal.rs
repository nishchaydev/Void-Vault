
const EXT4_SUPER_MAGIC: u16 = 0xEF53;
const SUPERBLOCK_OFFSET: usize = 1024;
const INODE_DELETED_TIME_OFFSET: usize = 0x0C; // dtime field

#[derive(Debug, Clone)]
pub struct Ext4SuperBlock {
    pub inodes_count: u32,
    pub blocks_count: u64,
    pub block_size: u32,
    pub inode_size: u16,
    pub inodes_per_group: u32,
    pub blocks_per_group: u32,
    pub volume_name: String,
    pub magic: u16,
}

#[derive(Debug, Clone)]
pub struct Ext4Inode {
    pub inode_number: u32,
    pub file_mode: u16,
    pub file_size: u64,
    pub is_deleted: bool,
    pub deletion_time: u32,
    pub link_count: u16,
    pub block_pointers: Vec<u32>,
    pub is_directory: bool,
    pub is_regular_file: bool,
}

#[derive(Debug, Clone)]
pub struct Ext4ScanResult {
    pub superblock: Option<Ext4SuperBlock>,
    pub deleted_inodes: Vec<Ext4Inode>,
    pub total_inodes_scanned: usize,
}

pub fn parse_superblock(data: &[u8]) -> Option<Ext4SuperBlock> {
    if data.len() < SUPERBLOCK_OFFSET + 1024 {
        return None;
    }

    let sb_data = &data[SUPERBLOCK_OFFSET..];
    if sb_data.len() < 120 {
        return None;
    }

    let magic = u16::from_le_bytes(sb_data[0x38..0x3A].try_into().ok()?);
    if magic != EXT4_SUPER_MAGIC {
        return None;
    }

    let inodes_count = u32::from_le_bytes(sb_data[0x00..0x04].try_into().ok()?);
    let blocks_count_lo = u32::from_le_bytes(sb_data[0x04..0x08].try_into().ok()?);
    let s_log_block_size = u32::from_le_bytes(sb_data[0x18..0x1C].try_into().ok()?);
    let block_size = 1024 << s_log_block_size;

    let inode_size = u16::from_le_bytes(sb_data[0x58..0x5A].try_into().ok()?);
    let inodes_per_group = u32::from_le_bytes(sb_data[0x28..0x2C].try_into().ok()?);
    let blocks_per_group = u32::from_le_bytes(sb_data[0x20..0x24].try_into().ok()?);

    let mut volume_name_bytes = [0u8; 16];
    volume_name_bytes.copy_from_slice(&sb_data[0x78..0x88]);

    let null_pos = volume_name_bytes.iter().position(|&b| b == 0).unwrap_or(16);
    let volume_name = String::from_utf8_lossy(&volume_name_bytes[..null_pos]).into_owned();

    Some(Ext4SuperBlock {
        inodes_count,
        blocks_count: blocks_count_lo as u64,
        block_size,
        inode_size,
        inodes_per_group,
        blocks_per_group,
        volume_name,
        magic,
    })
}

pub fn parse_inode(data: &[u8], inode_number: u32) -> Option<Ext4Inode> {
    if data.len() < 128 {
        return None;
    }

    let file_mode = u16::from_le_bytes(data[0x00..0x02].try_into().ok()?);
    let file_size_lo = u32::from_le_bytes(data[0x04..0x08].try_into().ok()?);

    let mut file_size_hi = 0u32;
    if data.len() >= 0x70 {
        if let Ok(hi) = data[0x6C..0x70].try_into() {
            file_size_hi = u32::from_le_bytes(hi);
        }
    }

    let file_size = ((file_size_hi as u64) << 32) | (file_size_lo as u64);

    let deletion_time = u32::from_le_bytes(
        data[INODE_DELETED_TIME_OFFSET..INODE_DELETED_TIME_OFFSET + 4]
            .try_into()
            .ok()?,
    );
    let link_count = u16::from_le_bytes(data[0x1A..0x1C].try_into().ok()?);

    let mut block_pointers = Vec::with_capacity(12);
    for i in 0..12 {
        let offset = 0x28 + (i * 4);
        if offset + 4 <= data.len() {
            if let Ok(block_bytes) = data[offset..offset + 4].try_into() {
                block_pointers.push(u32::from_le_bytes(block_bytes));
            }
        }
    }

    let is_deleted = deletion_time > 0 || link_count == 0;
    let is_directory = (file_mode & 0xF000) == 0x4000;
    let is_regular_file = (file_mode & 0xF000) == 0x8000;

    Some(Ext4Inode {
        inode_number,
        file_mode,
        file_size,
        is_deleted,
        deletion_time,
        link_count,
        block_pointers,
        is_directory,
        is_regular_file,
    })
}

pub fn scan_inode_table(data: &[u8], inode_size: u16, count: u32) -> Vec<Ext4Inode> {
    let mut inodes = Vec::new();
    let inode_size_usize = inode_size as usize;

    for i in 0..count {
        let offset = (i as usize) * inode_size_usize;
        if offset + inode_size_usize > data.len() {
            break;
        }

        let inode_data = &data[offset..offset + inode_size_usize];
        if let Some(inode) = parse_inode(inode_data, i + 1) {
            inodes.push(inode);
        }
    }

    inodes
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_superblock() {
        let mut data = vec![0u8; 2048];
        data[SUPERBLOCK_OFFSET + 0x38] = 0x53;
        data[SUPERBLOCK_OFFSET + 0x39] = 0xEF;
        data[SUPERBLOCK_OFFSET + 0x18] = 0x00;

        let sb = parse_superblock(&data).unwrap();
        assert_eq!(sb.magic, EXT4_SUPER_MAGIC);
        assert_eq!(sb.block_size, 1024);
    }

    #[test]
    fn test_parse_inode_active() {
        let mut data = vec![0u8; 256];
        data[0x00] = 0x00;
        data[0x01] = 0x80;
        data[0x04] = 100;
        data[0x1A] = 1;

        let inode = parse_inode(&data, 1).unwrap();
        assert_eq!(inode.file_size, 100);
        assert!(!inode.is_deleted);
        assert!(inode.is_regular_file);
    }

    #[test]
    fn test_parse_inode_deleted() {
        let mut data = vec![0u8; 256];
        data[0x00] = 0x00;
        data[0x01] = 0x80;
        data[0x1A] = 0;

        let time_bytes = 12345u32.to_le_bytes();
        data[INODE_DELETED_TIME_OFFSET..INODE_DELETED_TIME_OFFSET + 4].copy_from_slice(&time_bytes);

        let inode = parse_inode(&data, 2).unwrap();
        assert!(inode.is_deleted);
        assert_eq!(inode.deletion_time, 12345);
    }

    #[test]
    fn test_block_pointers() {
        let mut data = vec![0u8; 256];

        for i in 0..12 {
            let val = (i + 1) as u32;
            let offset = 0x28 + (i * 4);
            data[offset..offset + 4].copy_from_slice(&val.to_le_bytes());
        }

        let inode = parse_inode(&data, 3).unwrap();
        assert_eq!(inode.block_pointers.len(), 12);
        assert_eq!(inode.block_pointers[0], 1);
        assert_eq!(inode.block_pointers[11], 12);
    }
}
