#[derive(Debug, Clone, PartialEq)]
pub enum VirtualDiskFormat {
    Vhd,   // Microsoft Virtual Hard Disk
    Vhdx,  // Hyper-V VHDX
    Vmdk,  // VMware Virtual Machine Disk
    Qcow2, // QEMU Copy-On-Write v2
    Raw,   // Raw disk image
    Unknown,
}

#[derive(Debug, Clone)]
pub struct VirtualDiskInfo {
    pub format: VirtualDiskFormat,
    pub virtual_size: u64,
    pub actual_size: u64,
    pub is_dynamic: bool,
    pub has_snapshots: bool,
    pub data_offset: u64,
    pub cluster_size: u32,
}

pub fn detect_format(data: &[u8]) -> VirtualDiskFormat {
    if data.len() >= 8 {
        if &data[0..8] == b"conectix" {
            return VirtualDiskFormat::Vhd;
        }
        if &data[0..8] == b"vhdxfile" {
            return VirtualDiskFormat::Vhdx;
        }
    }
    if data.len() >= 4 {
        if &data[0..4] == b"KDMV" {
            return VirtualDiskFormat::Vmdk;
        }
        // QCOW2 magic: 'Q' 'F' 'I' 0xFB -> 0x51 0x46 0x49 0xFB
        if data[0] == 0x51 && data[1] == 0x46 && data[2] == 0x49 && data[3] == 0xFB {
            return VirtualDiskFormat::Qcow2;
        }
    }

    if data.len() >= 512 {
        let text_header = String::from_utf8_lossy(&data[0..512]);
        if text_header.contains("# Disk DescriptorFile") || text_header.contains("VMDK") {
            return VirtualDiskFormat::Vmdk;
        }
    }

    VirtualDiskFormat::Unknown
}

pub fn parse_vhd_header(data: &[u8]) -> Option<VirtualDiskInfo> {
    if detect_format(data) != VirtualDiskFormat::Vhd {
        return None;
    }

    if data.len() < 512 {
        return None;
    }

    Some(VirtualDiskInfo {
        format: VirtualDiskFormat::Vhd,
        virtual_size: 0,
        actual_size: data.len() as u64,
        is_dynamic: true,
        has_snapshots: false,
        data_offset: 512,
        cluster_size: 4096,
    })
}

pub fn parse_qcow2_header(data: &[u8]) -> Option<VirtualDiskInfo> {
    if detect_format(data) != VirtualDiskFormat::Qcow2 {
        return None;
    }

    if data.len() < 72 {
        return None;
    }

    let virtual_size = u64::from_be_bytes(data[24..32].try_into().unwrap_or([0; 8]));

    Some(VirtualDiskInfo {
        format: VirtualDiskFormat::Qcow2,
        virtual_size,
        actual_size: data.len() as u64,
        is_dynamic: true,
        has_snapshots: false,
        data_offset: 0,
        cluster_size: 65536,
    })
}

pub fn parse_vmdk_header(data: &[u8]) -> Option<VirtualDiskInfo> {
    if detect_format(data) != VirtualDiskFormat::Vmdk {
        return None;
    }

    Some(VirtualDiskInfo {
        format: VirtualDiskFormat::Vmdk,
        virtual_size: 0,
        actual_size: data.len() as u64,
        is_dynamic: true,
        has_snapshots: false,
        data_offset: 0,
        cluster_size: 65536,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_detect_format() {
        let mut vhd_magic = [0u8; 512];
        vhd_magic[0..8].copy_from_slice(b"conectix");
        assert_eq!(detect_format(&vhd_magic), VirtualDiskFormat::Vhd);

        let mut vhdx_magic = [0u8; 512];
        vhdx_magic[0..8].copy_from_slice(b"vhdxfile");
        assert_eq!(detect_format(&vhdx_magic), VirtualDiskFormat::Vhdx);

        let mut qcow2_magic = [0u8; 512];
        qcow2_magic[0..4].copy_from_slice(&[0x51, 0x46, 0x49, 0xFB]);
        assert_eq!(detect_format(&qcow2_magic), VirtualDiskFormat::Qcow2);

        let mut vmdk_magic = [0u8; 512];
        vmdk_magic[0..4].copy_from_slice(b"KDMV");
        assert_eq!(detect_format(&vmdk_magic), VirtualDiskFormat::Vmdk);
    }

    #[test]
    fn test_parse_qcow2() {
        let mut qcow2_magic = [0u8; 512];
        qcow2_magic[0..4].copy_from_slice(&[0x51, 0x46, 0x49, 0xFB]);
        qcow2_magic[24..32].copy_from_slice(&1024u64.to_be_bytes());

        let info = parse_qcow2_header(&qcow2_magic).unwrap();
        assert_eq!(info.format, VirtualDiskFormat::Qcow2);
        assert_eq!(info.virtual_size, 1024);
    }
}
