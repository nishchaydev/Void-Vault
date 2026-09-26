use anyhow::Result;
use std::ffi::OsStr;
use std::os::windows::ffi::OsStrExt;
use windows::core::PCWSTR;
use windows::Win32::Foundation::CloseHandle;
use windows::Win32::Storage::FileSystem::{
    CreateFileW, FILE_FLAGS_AND_ATTRIBUTES, FILE_SHARE_READ, FILE_SHARE_WRITE, OPEN_EXISTING,
    BusTypeNvme, BusTypeSata, BusTypeAta, BusTypeAtapi, BusTypeUsb, BusTypeSas, BusTypeScsi,
};
use windows::Win32::System::Ioctl::{
    DISK_GEOMETRY, IOCTL_DISK_GET_DRIVE_GEOMETRY, IOCTL_STORAGE_QUERY_PROPERTY,
    STORAGE_DEVICE_DESCRIPTOR, STORAGE_PROPERTY_QUERY, StorageDeviceProperty,
    PropertyStandardQuery,
};
use windows::Win32::Storage::IscsiDisc::{ATA_PASS_THROUGH_EX, IOCTL_ATA_PASS_THROUGH};
use windows::Win32::System::IO::DeviceIoControl;

/// Holds basic disk geometry information.
#[derive(Debug)]
pub struct DiskGeometry {
    pub bytes_per_sector: u32,
    pub total_sectors: u64,
}

/// Retrieves disk geometry for a given physical disk index using DeviceIoControl.
pub fn get_disk_geometry(disk_index: u32) -> Result<DiskGeometry> {
    let path = format!("\\\\.\\PhysicalDrive{}", disk_index);
    let path_u16: Vec<u16> = OsStr::new(&path)
        .encode_wide()
        .chain(std::iter::once(0))
        .collect();
    let pcwstr = PCWSTR(path_u16.as_ptr());

    unsafe {
        // SAFETY: We are providing a valid null-terminated UTF-16 string.
        let handle_result = CreateFileW(
            pcwstr,
            0x80000000, // GENERIC_READ
            FILE_SHARE_READ | FILE_SHARE_WRITE,
            None,
            OPEN_EXISTING,
            FILE_FLAGS_AND_ATTRIBUTES(0),
            None,
        );

        let handle = match handle_result {
            Ok(h) => h,
            Err(e) => return Err(anyhow::anyhow!("CreateFileW failed: {}", e)),
        };

        let mut geometry = DISK_GEOMETRY::default();
        let mut bytes_returned: u32 = 0;

        // SAFETY: handle is valid. geometry and bytes_returned are valid stack variables.
        let result = DeviceIoControl(
            handle,
            IOCTL_DISK_GET_DRIVE_GEOMETRY,
            None,
            0,
            Some(&mut geometry as *mut _ as *mut std::ffi::c_void),
            std::mem::size_of::<DISK_GEOMETRY>() as u32,
            Some(&mut bytes_returned),
            None,
        );

        let _ = CloseHandle(handle);

        result.map_err(|e| anyhow::anyhow!("DeviceIoControl failed: {}", e))?;

        Ok(DiskGeometry {
            bytes_per_sector: geometry.BytesPerSector,
            total_sectors: (geometry.Cylinders as u64)
                * (geometry.TracksPerCylinder as u64)
                * (geometry.SectorsPerTrack as u64),
        })
    }
}

/// Physical bus/transport a disk is attached through. More authoritative
/// than the free-text WMI `interface_type` string — used to gate hardware
/// erase paths (NVMe Sanitize) that only work over certain transports.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum BusType {
    Nvme,
    Sata,
    Ata,
    Usb,
    Sas,
    Scsi,
    Other,
    Unknown,
}

/// Queries the physical bus/transport a disk is attached through via
/// `IOCTL_STORAGE_QUERY_PROPERTY`.
pub fn query_bus_type(disk_index: u32) -> Result<BusType> {
    let path = format!("\\\\.\\PhysicalDrive{}", disk_index);
    let path_u16: Vec<u16> = OsStr::new(&path)
        .encode_wide()
        .chain(std::iter::once(0))
        .collect();
    let pcwstr = PCWSTR(path_u16.as_ptr());

    unsafe {
        // SAFETY: We are providing a valid null-terminated UTF-16 string.
        let handle = CreateFileW(
            pcwstr,
            0x80000000, // GENERIC_READ
            FILE_SHARE_READ | FILE_SHARE_WRITE,
            None,
            OPEN_EXISTING,
            FILE_FLAGS_AND_ATTRIBUTES(0),
            None,
        )
        .map_err(|e| anyhow::anyhow!("CreateFileW failed: {}", e))?;

        let mut query = STORAGE_PROPERTY_QUERY::default();
        query.PropertyId = StorageDeviceProperty;
        query.QueryType = PropertyStandardQuery;

        // STORAGE_DEVICE_DESCRIPTOR has a trailing variable-length region for
        // vendor/product/serial strings. Over-allocate so DeviceIoControl has
        // room, even though we only read the fixed-offset BusType field.
        let mut out_buf = vec![0u8; 1024];
        let mut bytes_returned: u32 = 0;

        // SAFETY: handle is valid; query and out_buf are valid, sized buffers.
        let result = DeviceIoControl(
            handle,
            IOCTL_STORAGE_QUERY_PROPERTY,
            Some(&query as *const _ as *const std::ffi::c_void),
            std::mem::size_of::<STORAGE_PROPERTY_QUERY>() as u32,
            Some(out_buf.as_mut_ptr() as *mut std::ffi::c_void),
            out_buf.len() as u32,
            Some(&mut bytes_returned),
            None,
        );

        let _ = CloseHandle(handle);
        result.map_err(|e| anyhow::anyhow!("DeviceIoControl (bus type query) failed: {}", e))?;

        // SAFETY: out_buf is large enough to hold the fixed-offset header of
        // STORAGE_DEVICE_DESCRIPTOR (we don't touch the trailing string data).
        let descriptor = &*(out_buf.as_ptr() as *const STORAGE_DEVICE_DESCRIPTOR);
        let bus_type = descriptor.BusType;

        Ok(if bus_type == BusTypeNvme {
            BusType::Nvme
        } else if bus_type == BusTypeSata {
            BusType::Sata
        } else if bus_type == BusTypeAta || bus_type == BusTypeAtapi {
            BusType::Ata
        } else if bus_type == BusTypeUsb {
            BusType::Usb
        } else if bus_type == BusTypeSas {
            BusType::Sas
        } else if bus_type == BusTypeScsi {
            BusType::Scsi
        } else {
            BusType::Other
        })
    }
}

fn open_for_ata_passthrough(disk_index: u32) -> Result<windows::Win32::Foundation::HANDLE> {
    let path = format!("\\\\.\\PhysicalDrive{}", disk_index);
    let path_u16: Vec<u16> = OsStr::new(&path)
        .encode_wide()
        .chain(std::iter::once(0))
        .collect();
    unsafe {
        // SAFETY: path_u16 is a valid null-terminated UTF-16 string.
        CreateFileW(
            PCWSTR(path_u16.as_ptr()),
            0xC0000000, // GENERIC_READ | GENERIC_WRITE — ATA passthrough needs write access
            FILE_SHARE_READ | FILE_SHARE_WRITE,
            None,
            OPEN_EXISTING,
            FILE_FLAGS_AND_ATTRIBUTES(0),
            None,
        )
        .map_err(|e| anyhow::anyhow!("CreateFileW failed: {}", e))
    }
}

/// Issues READ NATIVE MAX ADDRESS EXT (ATA command 0x27, 48-bit, non-data)
/// via IOCTL_ATA_PASS_THROUGH to detect HPA (Host Protected Area) — the
/// drive's true maximum LBA, which can exceed what the drive currently
/// reports if an HPA is hiding capacity. Read-only; makes no changes to
/// the drive.
///
/// Register read-back convention (`CurrentTaskFile` = low 24 bits of the
/// 48-bit LBA, `PreviousTaskFile` = HOB/high 24 bits) is NOT explicitly
/// documented by Microsoft for the output direction — verified instead
/// against a working reference implementation (smartmontools'
/// `os_win32.cpp`), since getting this backward would silently produce a
/// wrong (but plausible-looking) hidden-sector count.
pub fn read_native_max_address_ext(disk_index: u32) -> Result<u64> {
    let handle = open_for_ata_passthrough(disk_index)?;

    unsafe {
        // SAFETY: all-zero is a valid bit pattern for this C struct
        // (integer/byte-array fields only).
        let mut apt: ATA_PASS_THROUGH_EX = std::mem::zeroed();
        apt.Length = std::mem::size_of::<ATA_PASS_THROUGH_EX>() as u16;
        apt.AtaFlags = 0x08; // ATA_FLAGS_48BIT_COMMAND — no DATA_IN/OUT, this is non-data
        apt.TimeOutValue = 10;
        apt.CurrentTaskFile[6] = 0x27; // READ NATIVE MAX ADDRESS EXT

        let apt_ptr = &mut apt as *mut ATA_PASS_THROUGH_EX;
        let mut bytes_returned: u32 = 0;

        // SAFETY: handle is valid; apt_ptr points to a valid, correctly
        // sized struct used for both input and output (standard for a
        // buffered IOCTL like this one).
        let result = DeviceIoControl(
            handle,
            IOCTL_ATA_PASS_THROUGH,
            Some(apt_ptr as *const std::ffi::c_void),
            std::mem::size_of::<ATA_PASS_THROUGH_EX>() as u32,
            Some(apt_ptr as *mut std::ffi::c_void),
            std::mem::size_of::<ATA_PASS_THROUGH_EX>() as u32,
            Some(&mut bytes_returned),
            None,
        );

        let _ = CloseHandle(handle);
        result.map_err(|e| {
            anyhow::anyhow!("READ NATIVE MAX ADDRESS EXT failed (drive may not support 48-bit LBA): {}", e)
        })?;

        let cur = apt.CurrentTaskFile;
        let prev = apt.PreviousTaskFile;
        let lba: u64 = (cur[2] as u64)
            | ((cur[3] as u64) << 8)
            | ((cur[4] as u64) << 16)
            | ((prev[2] as u64) << 24)
            | ((prev[3] as u64) << 32)
            | ((prev[4] as u64) << 40);

        // Max LBA is a 0-based address; native sector count = max LBA + 1.
        Ok(lba + 1)
    }
}

/// Combined ATA_PASS_THROUGH_EX + trailing data buffer for commands that
/// transfer data (DEVICE CONFIGURATION IDENTIFY here). A `#[repr(C)]`
/// composite struct rather than a raw `Vec<u8>` cast — guarantees the
/// header portion has correct alignment for its `ULONG`/pointer-sized
/// fields, which a plain byte-buffer-and-cast would not.
#[repr(C)]
struct AtaPassThroughWithData {
    header: ATA_PASS_THROUGH_EX,
    data: [u8; 512],
}

/// Issues DEVICE CONFIGURATION IDENTIFY (ATA command 0xB1, sub-command
/// 0xC2) via IOCTL_ATA_PASS_THROUGH to detect DCO (Device Configuration
/// Overlay) hidden capacity. Returns `Ok(None)` if the drive doesn't
/// support DCO (command rejected) — that's the normal case for most
/// drives, not a failure worth surfacing as an error.
///
/// Data structure layout (Max LBA in words 3-5, low word first, +1 for
/// 0-based LBA → sector count) verified against the T13 ATA8-ACS
/// specification (§7.10.3, Table 18) and cross-checked against hdparm's
/// `get_dco_identify_data()` reference implementation.
pub fn read_dco_max_sectors(disk_index: u32) -> Result<Option<u64>> {
    let handle = open_for_ata_passthrough(disk_index)?;

    unsafe {
        // SAFETY: all-zero is a valid bit pattern for this struct.
        let mut combined: AtaPassThroughWithData = std::mem::zeroed();
        let header_size = std::mem::size_of::<ATA_PASS_THROUGH_EX>();
        combined.header.Length = header_size as u16;
        combined.header.AtaFlags = 0x02; // ATA_FLAGS_DATA_IN
        combined.header.DataTransferLength = 512;
        combined.header.TimeOutValue = 10;
        combined.header.DataBufferOffset = header_size as _;
        combined.header.CurrentTaskFile[0] = 0xC2; // Features: DCO Identify sub-command
        combined.header.CurrentTaskFile[1] = 1; // Sector Count: 1 (256 words / 512 bytes)
        combined.header.CurrentTaskFile[6] = 0xB1; // Command: DEVICE CONFIGURATION OVERLAY

        let total_size = std::mem::size_of::<AtaPassThroughWithData>();
        let ptr = &mut combined as *mut AtaPassThroughWithData as *mut std::ffi::c_void;
        let mut bytes_returned: u32 = 0;

        // SAFETY: handle is valid; ptr points to a valid, correctly sized
        // combined header+data buffer used for both input and output.
        let result = DeviceIoControl(
            handle,
            IOCTL_ATA_PASS_THROUGH,
            Some(ptr as *const std::ffi::c_void),
            total_size as u32,
            Some(ptr),
            total_size as u32,
            Some(&mut bytes_returned),
            None,
        );

        let _ = CloseHandle(handle);

        if result.is_err() {
            // Most drives don't support DCO at all — normal, not an error.
            return Ok(None);
        }

        let word = |i: usize| -> u64 {
            u16::from_le_bytes([combined.data[i * 2], combined.data[i * 2 + 1]]) as u64
        };
        let dco_max_lba = word(3) | (word(4) << 16) | (word(5) << 32);

        Ok(Some(dco_max_lba + 1))
    }
}

/// SMART attribute values pulled from a single SMART READ DATA response.
/// `reallocated_sectors`/`pending_sectors` are the raw counters for
/// attributes 0x05 and 0xC5 (G-List / pending remap queue) — the two
/// values `model::device::SmartHealth` actually claims. `temperature_c` is
/// attribute 0xC2/0xBE if the drive reports one; `None` if it doesn't,
/// rather than a made-up number.
#[derive(Debug, Clone, Copy, Default)]
pub struct SmartAttributeData {
    pub reallocated_sectors: u32,
    pub pending_sectors: u32,
    pub temperature_c: Option<u32>,
}

/// Issues SMART READ DATA (ATA command 0xB0, feature 0xD0, the standard
/// `LBA Mid=0x4F`/`LBA High=0xC5` "SMART signature" that distinguishes a
/// SMART sub-command from a plain 0xB0) via IOCTL_ATA_PASS_THROUGH and
/// extracts the attributes this tool actually surfaces (G-List reallocated
/// sectors, pending sectors, temperature) instead of the hardcoded
/// "0 defects, 100% healthy, 35°C" placeholder that used to stand in for
/// this everywhere `SmartHealth` was built.
///
/// Response layout (512 bytes: 2-byte revision, then up to 30 x 12-byte
/// attribute entries `[id, status_lo, status_hi, value, worst, raw0..raw5,
/// reserved]`) is the standard ATA SMART attribute table described in the
/// T13 ACS spec and used identically by smartmontools' `ataPrintSmartInfo`/
/// `ata_get_attr_raw_value`. Per that convention, an attribute's raw value
/// is read as the low 32 bits of its 6-byte raw field for plain-count
/// attributes like 0x05 and 0xC5 (vendors don't populate the top 2 bytes
/// for these) — the same convention smartmontools' default `RAWFMT_RAW48`
/// formatter reduces to for those IDs.
pub fn read_smart_attributes(disk_index: u32) -> Result<SmartAttributeData> {
    let handle = open_for_ata_passthrough(disk_index)?;

    unsafe {
        // SAFETY: all-zero is a valid bit pattern for this struct.
        let mut combined: AtaPassThroughWithData = std::mem::zeroed();
        let header_size = std::mem::size_of::<ATA_PASS_THROUGH_EX>();
        combined.header.Length = header_size as u16;
        combined.header.AtaFlags = 0x02; // ATA_FLAGS_DATA_IN
        combined.header.DataTransferLength = 512;
        combined.header.TimeOutValue = 10;
        combined.header.DataBufferOffset = header_size as _;
        combined.header.CurrentTaskFile[0] = 0xD0; // Features: SMART READ DATA
        combined.header.CurrentTaskFile[1] = 1; // Sector Count: 1 (512-byte attribute table)
        combined.header.CurrentTaskFile[3] = 0x4F; // LBA Mid: SMART signature low byte
        combined.header.CurrentTaskFile[4] = 0xC5; // LBA High: SMART signature high byte
        combined.header.CurrentTaskFile[5] = 0xA0; // Device: drive 0, LBA mode
        combined.header.CurrentTaskFile[6] = 0xB0; // Command: SMART

        let total_size = std::mem::size_of::<AtaPassThroughWithData>();
        let ptr = &mut combined as *mut AtaPassThroughWithData as *mut std::ffi::c_void;
        let mut bytes_returned: u32 = 0;

        // SAFETY: handle is valid; ptr points to a valid, correctly sized
        // combined header+data buffer used for both input and output.
        let result = DeviceIoControl(
            handle,
            IOCTL_ATA_PASS_THROUGH,
            Some(ptr as *const std::ffi::c_void),
            total_size as u32,
            Some(ptr),
            total_size as u32,
            Some(&mut bytes_returned),
            None,
        );

        let _ = CloseHandle(handle);
        result.map_err(|e| anyhow::anyhow!("SMART READ DATA failed: {}", e))?;

        let mut out = SmartAttributeData::default();
        // 30 fixed-size 12-byte attribute entries starting at offset 2.
        for entry in 0..30 {
            let base = 2 + entry * 12;
            if base + 12 > combined.data.len() {
                break;
            }
            let id = combined.data[base];
            if id == 0 {
                continue; // unused attribute slot
            }
            let raw32 = u32::from_le_bytes([
                combined.data[base + 5],
                combined.data[base + 6],
                combined.data[base + 7],
                combined.data[base + 8],
            ]);
            match id {
                0x05 => out.reallocated_sectors = raw32,
                0xC5 => out.pending_sectors = raw32,
                0xC2 | 0xBE => {
                    // Temperature attributes conventionally store the
                    // current temperature in the first raw byte.
                    out.temperature_c = Some(combined.data[base + 5] as u32);
                }
                _ => {}
            }
        }

        Ok(out)
    }
}

/// Issues a TCG Storage "Level 0 Discovery" (TRUSTED RECEIVE, ATA command
/// 0x5C, Security Protocol 0x01, fixed ComID 0x0001) to detect whether a
/// drive supports TCG Opal. Read-only, no session/authentication involved —
/// this is a single unauthenticated query, not an erase. Returns the raw
/// 512-byte response for the caller to parse (see `sanitize::opal`).
pub fn opal_discovery0(disk_index: u32) -> Result<[u8; 512]> {
    let handle = open_for_ata_passthrough(disk_index)?;

    unsafe {
        // SAFETY: all-zero is a valid bit pattern for this struct.
        let mut combined: AtaPassThroughWithData = std::mem::zeroed();
        let header_size = std::mem::size_of::<ATA_PASS_THROUGH_EX>();
        combined.header.Length = header_size as u16;
        combined.header.AtaFlags = 0x02; // ATA_FLAGS_DATA_IN
        combined.header.DataTransferLength = 512;
        combined.header.TimeOutValue = 10;
        combined.header.DataBufferOffset = header_size as _;
        combined.header.CurrentTaskFile[0] = 0x01; // Security Protocol: 0x01 = Discovery
        combined.header.CurrentTaskFile[1] = 1; // Sector count = 512 bytes / 512
        combined.header.CurrentTaskFile[3] = 0x01; // ComID low byte (0x0001)
        combined.header.CurrentTaskFile[4] = 0x00; // ComID high byte
        combined.header.CurrentTaskFile[6] = 0x5C; // TRUSTED RECEIVE

        let total_size = std::mem::size_of::<AtaPassThroughWithData>();
        let ptr = &mut combined as *mut AtaPassThroughWithData as *mut std::ffi::c_void;
        let mut bytes_returned: u32 = 0;

        // SAFETY: handle is valid; ptr points to a valid, correctly sized
        // combined header+data buffer used for both input and output.
        let result = DeviceIoControl(
            handle,
            IOCTL_ATA_PASS_THROUGH,
            Some(ptr as *const std::ffi::c_void),
            total_size as u32,
            Some(ptr),
            total_size as u32,
            Some(&mut bytes_returned),
            None,
        );

        let _ = CloseHandle(handle);
        result.map_err(|e| anyhow::anyhow!("TRUSTED RECEIVE (Opal Discovery-0) failed: {}", e))?;

        Ok(combined.data)
    }
}

/// Combined ATA_PASS_THROUGH_EX + a 2048-byte (4-sector) trailing data
/// buffer — the fixed packet size the TCG Opal SSC session protocol uses
/// for every IF-SEND/IF-RECV exchange after Level 0 Discovery (matches the
/// Linux kernel Opal driver's `IO_BUFFER_LENGTH`; see
/// `sanitize::opal_protocol` for why that specific size and everything
/// built on top of it is a direct port of that driver, not a guess).
#[repr(C)]
struct AtaPassThroughWithData2048 {
    header: ATA_PASS_THROUGH_EX,
    data: [u8; 2048],
}

/// Issues TRUSTED SEND (ATA command 0x5E) to write a TCG Opal ComPacket to
/// the drive — the IF-SEND half of the session protocol. `comid` goes both
/// in the ATA Security-Protocol-Specific field (LBA Mid/High, the same
/// place Level 0 Discovery's fixed ComID 0x0001 goes in
/// `opal_discovery0`) and — separately, by the caller, inside the
/// ComPacket header itself — the two are required to match. `payload` must
/// be exactly 2048 bytes (the full fixed IF-SEND size; short packets are
/// still sent as a full zero-padded 2048-byte buffer, matching the
/// reference driver rather than trying to send only the "used" prefix).
pub fn opal_send(disk_index: u32, comid: u16, payload: &[u8; 2048]) -> Result<()> {
    let handle = open_for_ata_passthrough(disk_index)?;

    unsafe {
        // SAFETY: all-zero is a valid bit pattern for this struct.
        let mut combined: AtaPassThroughWithData2048 = std::mem::zeroed();
        let header_size = std::mem::size_of::<ATA_PASS_THROUGH_EX>();
        combined.header.Length = header_size as u16;
        combined.header.AtaFlags = 0x04; // ATA_FLAGS_DATA_OUT — this is a write to the device
        combined.header.DataTransferLength = 2048;
        combined.header.TimeOutValue = 15;
        combined.header.DataBufferOffset = header_size as _;
        combined.header.CurrentTaskFile[0] = 0x01; // Features: Security Protocol 0x01 (TCG)
        combined.header.CurrentTaskFile[1] = 4; // Sector Count: 2048 bytes / 512 = 4
        combined.header.CurrentTaskFile[3] = (comid >> 8) as u8; // LBA Mid: ComID high byte
        combined.header.CurrentTaskFile[4] = (comid & 0xFF) as u8; // LBA High: ComID low byte
        combined.header.CurrentTaskFile[6] = 0x5E; // Command: TRUSTED SEND

        combined.data.copy_from_slice(payload);

        let total_size = std::mem::size_of::<AtaPassThroughWithData2048>();
        let ptr = &mut combined as *mut AtaPassThroughWithData2048 as *mut std::ffi::c_void;
        let mut bytes_returned: u32 = 0;

        // SAFETY: handle is valid; ptr points to a valid, correctly sized
        // combined header+data buffer used for both input and output.
        let result = DeviceIoControl(
            handle,
            IOCTL_ATA_PASS_THROUGH,
            Some(ptr as *const std::ffi::c_void),
            total_size as u32,
            Some(ptr),
            total_size as u32,
            Some(&mut bytes_returned),
            None,
        );

        let _ = CloseHandle(handle);
        result.map_err(|e| anyhow::anyhow!("TRUSTED SEND (Opal IF-SEND) failed: {}", e))?;

        Ok(())
    }
}

/// Issues TRUSTED RECEIVE (ATA command 0x5C) to read a TCG Opal ComPacket
/// response — the IF-RECV half of the session protocol, using the
/// session's negotiated `comid` rather than the fixed Discovery ComID
/// `opal_discovery0` uses. Always returns the full fixed 2048-byte buffer;
/// the caller parses only as many bytes as the response header's own
/// length fields declare (see `sanitize::opal_protocol`'s response
/// parser), matching how the reference driver handles this.
pub fn opal_receive(disk_index: u32, comid: u16) -> Result<[u8; 2048]> {
    let handle = open_for_ata_passthrough(disk_index)?;

    unsafe {
        // SAFETY: all-zero is a valid bit pattern for this struct.
        let mut combined: AtaPassThroughWithData2048 = std::mem::zeroed();
        let header_size = std::mem::size_of::<ATA_PASS_THROUGH_EX>();
        combined.header.Length = header_size as u16;
        combined.header.AtaFlags = 0x02; // ATA_FLAGS_DATA_IN
        combined.header.DataTransferLength = 2048;
        combined.header.TimeOutValue = 15;
        combined.header.DataBufferOffset = header_size as _;
        combined.header.CurrentTaskFile[0] = 0x01; // Features: Security Protocol 0x01 (TCG)
        combined.header.CurrentTaskFile[1] = 4; // Sector Count: 2048 bytes / 512 = 4
        combined.header.CurrentTaskFile[3] = (comid >> 8) as u8; // LBA Mid: ComID high byte
        combined.header.CurrentTaskFile[4] = (comid & 0xFF) as u8; // LBA High: ComID low byte
        combined.header.CurrentTaskFile[6] = 0x5C; // Command: TRUSTED RECEIVE

        let total_size = std::mem::size_of::<AtaPassThroughWithData2048>();
        let ptr = &mut combined as *mut AtaPassThroughWithData2048 as *mut std::ffi::c_void;
        let mut bytes_returned: u32 = 0;

        // SAFETY: handle is valid; ptr points to a valid, correctly sized
        // combined header+data buffer used for both input and output.
        let result = DeviceIoControl(
            handle,
            IOCTL_ATA_PASS_THROUGH,
            Some(ptr as *const std::ffi::c_void),
            total_size as u32,
            Some(ptr),
            total_size as u32,
            Some(&mut bytes_returned),
            None,
        );

        let _ = CloseHandle(handle);
        result.map_err(|e| anyhow::anyhow!("TRUSTED RECEIVE (Opal IF-RECV) failed: {}", e))?;

        Ok(combined.data)
    }
}
