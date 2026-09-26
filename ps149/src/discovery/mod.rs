pub mod classifier;
pub mod hotplug;
pub mod ioctl;
pub mod uasp;
pub mod wmi;

use crate::model::*;
use anyhow::Result;
use tracing::warn;

/// Orchestrates the discovery pipeline to enumerate all physical disks, partitions, and volumes.
pub fn enumerate_devices() -> Result<Vec<PhysicalDisk>> {
    let com_con = match ::wmi::COMLibrary::new() {
        Ok(c) => Some(c),
        Err(e) => {
            warn!("COMLibrary::new failed: {} — trying without_security", e);
            match ::wmi::COMLibrary::without_security() {
                Ok(c) => Some(c),
                Err(_) => {
                    warn!("Using assume_initialized fallback for COM");
                    Some(unsafe { ::wmi::COMLibrary::assume_initialized() })
                }
            }
        }
    };

    let wmi_con = com_con.and_then(|c| ::wmi::WMIConnection::new(c).ok());

    let drives: Vec<wmi::Win32DiskDrive> = wmi_con.as_ref().and_then(|w| w.query().ok()).unwrap_or_default();
    let partitions: Vec<wmi::Win32DiskPartition> = wmi_con.as_ref().and_then(|w| w.query().ok()).unwrap_or_default();
    let logical_disks: Vec<wmi::Win32LogicalDisk> = wmi_con.as_ref().and_then(|w| w.query().ok()).unwrap_or_default();

    let os_info: Vec<wmi::Win32OperatingSystem> = wmi_con.as_ref().and_then(|w| w.query().ok()).unwrap_or_default();
    let system_drive = os_info
        .into_iter()
        .next()
        .and_then(|os| os.system_drive)
        .unwrap_or_else(|| "C:".to_string());

    // Build partition-to-volumes mapping using ASSOCIATORS OF queries.
    // For each logical disk, query which partition it belongs to.
    let mut partition_volumes: std::collections::HashMap<String, Vec<Volume>> =
        std::collections::HashMap::new();

    for ld in &logical_disks {
        let drive_letter = match &ld.device_id {
            Some(id) => id.clone(),
            None => continue,
        };

        let vol = Volume {
            drive_letter: Some(drive_letter.clone()),
            label: ld.volume_name.clone(),
            filesystem: ld.file_system.clone(),
            capacity: ld.size,
            free_space: ld.free_space,
            drive_type: ld.drive_type,
        };

        // Use ASSOCIATORS OF to find partition for this logical disk
        let query = format!(
            "ASSOCIATORS OF {{Win32_LogicalDisk.DeviceID='{}'}} WHERE AssocClass = Win32_LogicalDiskToPartition",
            drive_letter
        );

        if let Some(ref conn) = wmi_con {
            match conn.raw_query::<std::collections::HashMap<String, ::wmi::Variant>>(&query) {
                Ok(assoc_parts) => {
                    for part_map in assoc_parts {
                        if let Some(::wmi::Variant::String(part_id)) = part_map.get("DeviceID") {
                            partition_volumes
                                .entry(part_id.clone())
                                .or_default()
                                .push(vol.clone());
                            break;
                        }
                    }
                }
                Err(e) => {
                    // Fallback: if ASSOCIATORS OF doesn't work, we'll attach volumes later by heuristic
                    warn!(
                        "ASSOCIATORS OF query failed for {}: {} — will use fallback",
                        drive_letter, e
                    );
                }
            }
        }
    }

    let mut result = Vec::new();

    for disk in drives {
        let did = match &disk.device_id {
            Some(id) => id.clone(),
            None => continue,
        };
        let disk_index = disk.index.unwrap_or(0);

        // Find partitions for this disk via DiskIndex
        let disk_parts: Vec<Partition> = partitions
            .iter()
            .filter(|p| p.disk_index == Some(disk_index))
            .map(|wp| {
                let part_id = wp.device_id.clone().unwrap_or_default();
                let vols = partition_volumes.remove(&part_id).unwrap_or_default();
                Partition {
                    index: wp.index.unwrap_or(0),
                    size: wp.size.unwrap_or(0),
                    is_boot: wp.boot_partition.unwrap_or(false),
                    is_primary: wp.primary_partition.unwrap_or(false),
                    partition_type: wp.partition_type.clone(),
                    volumes: vols,
                }
            })
            .collect();

        // Get disk geometry via IOCTL
        let (bytes_per_sec, total_sec) = match ioctl::get_disk_geometry(disk_index) {
            Ok(geom) => (geom.bytes_per_sector, geom.total_sectors),
            Err(e) => {
                warn!(
                    "IOCTL geometry failed for disk {}: {} — using capacity fallback",
                    disk_index, e
                );
                let cap = disk.size.unwrap_or(0);
                (512, if cap > 0 { cap / 512 } else { 0 })
            }
        };

        let dev_type = classifier::classify_device(
            disk.media_type.as_deref(),
            disk.interface_type.as_deref(),
            disk.pnp_device_id.as_deref(),
            false,
        );

        let mut disk_parts = disk_parts;
        // Fallback: If disk is removable/USB and has no volumes mapped, find removable logical disks
        let has_volumes = disk_parts.iter().any(|p| !p.volumes.is_empty());
        if !has_volumes && (matches!(dev_type, DeviceType::UsbFlashDrive | DeviceType::SdCard | DeviceType::ExternalHdd | DeviceType::ExternalSsd) || disk.interface_type.as_deref() == Some("USB") || disk.media_type.as_deref().unwrap_or("").contains("Removable")) {
            for ld in &logical_disks {
                if ld.drive_type == Some(2) { // 2 = DRIVE_REMOVABLE
                    if let Some(letter) = &ld.device_id {
                        let vol = Volume {
                            drive_letter: Some(letter.clone()),
                            label: ld.volume_name.clone(),
                            filesystem: ld.file_system.clone(),
                            capacity: ld.size,
                            free_space: ld.free_space,
                            drive_type: ld.drive_type,
                        };
                        if disk_parts.is_empty() {
                            disk_parts.push(Partition {
                                index: 0,
                                size: disk.size.unwrap_or(0),
                                is_boot: false,
                                is_primary: true,
                                partition_type: Some("Removable Volume".to_string()),
                                volumes: vec![vol],
                            });
                        } else {
                            disk_parts[0].volumes.push(vol);
                        }
                    }
                }
            }
        }

        // ONLY the disk holding the running OS system drive (e.g. C:) is PROTECTED.
        // Everything else — internal drives, USB, SD cards — is AVAILABLE.
        // A bootable USB installer has BootPartition=true but is NOT the running OS.
        let mut has_system_drive = false;
        for p in &disk_parts {
            for v in &p.volumes {
                if let Some(letter) = &v.drive_letter {
                    if letter.eq_ignore_ascii_case(&system_drive) {
                        has_system_drive = true;
                    }
                }
            }
        }
        let is_boot_disk = has_system_drive;

        let safety_status = if is_boot_disk {
            SafetyStatus::Protected
        } else {
            SafetyStatus::Available
        };

        // Real SMART READ DATA query (attributes 0x05/0xC5/0xC2) rather
        // than a hardcoded "0 defects, clean" placeholder — see
        // ioctl::read_smart_attributes for the protocol details. Not every
        // drive/transport answers this (e.g. some USB bridges don't pass
        // ATA SMART through); on failure we report that honestly instead
        // of silently claiming a clean bill of health.
        let smart_health = match ioctl::read_smart_attributes(disk_index) {
            Ok(attrs) => {
                let purge_mandated = attrs.reallocated_sectors > 0 || attrs.pending_sectors > 0;
                let g_list_status = if purge_mandated {
                    format!(
                        "{} Reallocated + {} Pending Sectors — NIST SP 800-88 §4.1 Purge Recommended",
                        attrs.reallocated_sectors, attrs.pending_sectors
                    )
                } else {
                    "Clear (0 Defective Sectors - G-List Clean)".to_string()
                };
                Some(SmartHealth {
                    reallocated_sectors: attrs.reallocated_sectors,
                    pending_sectors: attrs.pending_sectors,
                    g_list_status,
                    purge_mandated,
                    // Not derived from any real wear-leveling telemetry yet
                    // (vendor-specific attribute IDs, out of scope here) —
                    // left at a neutral placeholder rather than fabricating
                    // a precise percentage.
                    health_percent: 100,
                    temperature_c: attrs.temperature_c,
                })
            }
            Err(e) => {
                warn!(
                    "SMART READ DATA failed for disk {}: {} — reporting as unmeasured, not clean",
                    disk_index, e
                );
                Some(SmartHealth {
                    reallocated_sectors: 0,
                    pending_sectors: 0,
                    g_list_status: "Unavailable (SMART not accessible over this transport)".to_string(),
                    purge_mandated: false,
                    health_percent: 100,
                    temperature_c: None,
                })
            }
        };

        result.push(PhysicalDisk {
            index: disk_index,
            device_id: did,
            model: disk.model.clone(),
            serial_number: disk.serial_number.clone(),
            capacity: disk.size.unwrap_or(0),
            media_type: disk.media_type.clone(),
            interface_type: disk.interface_type.clone(),
            pnp_device_id: disk.pnp_device_id.clone(),
            bytes_per_sector: bytes_per_sec,
            total_sectors: total_sec,
            device_type: dev_type,
            is_boot_disk,
            safety_status,
            partitions: disk_parts,
            smart_health,
        });
    }

    #[cfg(windows)]
    {
        use std::collections::HashSet;
        let mut mapped_letters = HashSet::new();
        for d in &result {
            for p in &d.partitions {
                for v in &p.volumes {
                    if let Some(ref dl) = v.drive_letter {
                        let letter = dl.trim_end_matches(':').trim_end_matches('\\').to_uppercase();
                        mapped_letters.insert(letter);
                    }
                }
            }
        }

        // Check if any logical drives from Windows are missing from the result
        let fallback_disks = enumerate_devices_win32_fallback();
        for fb_disk in fallback_disks {
            for fb_part in &fb_disk.partitions {
                for fb_vol in &fb_part.volumes {
                    if let Some(ref dl) = fb_vol.drive_letter {
                        let letter = dl.trim_end_matches(':').trim_end_matches('\\').to_uppercase();
                        if !mapped_letters.contains(&letter) {
                            mapped_letters.insert(letter.clone());
                            if let Some(first_disk) = result.first_mut() {
                                first_disk.partitions.push(Partition {
                                    index: first_disk.partitions.len() as u32,
                                    size: fb_vol.capacity.unwrap_or(0),
                                    is_boot: letter == "C",
                                    is_primary: true,
                                    partition_type: Some(format!("Logical Drive {}:", letter)),
                                    volumes: vec![fb_vol.clone()],
                                });
                            } else {
                                result.push(fb_disk.clone());
                                break;
                            }
                        }
                    }
                }
            }
        }
    }

    if result.is_empty() {
        warn!("WMI returned 0 disks — engaging native Win32 API drive enumeration fallback");
        #[cfg(windows)]
        {
            result = enumerate_devices_win32_fallback();
        }
    }

    Ok(result)
}

#[cfg(windows)]
fn enumerate_devices_win32_fallback() -> Vec<PhysicalDisk> {
    use windows::Win32::Storage::FileSystem::{
        GetLogicalDrives, GetDriveTypeW, GetDiskFreeSpaceExW, GetVolumeInformationW
    };
    use windows::core::HSTRING;
    let mut disks = Vec::new();

    let bitmask = unsafe { GetLogicalDrives() };
    for i in 0..26 {
        if (bitmask & (1 << i)) != 0 {
            let letter = (b'A' + i as u8) as char;
            let root_path = format!("{}:\\", letter);
            let root_h = HSTRING::from(&root_path);
            let drive_type_code = unsafe { GetDriveTypeW(&root_h) };
            // 2 = DRIVE_REMOVABLE, 3 = DRIVE_FIXED, 4 = DRIVE_REMOTE, 5 = DRIVE_CDROM, 6 = DRIVE_RAMDISK
            if drive_type_code <= 1 {
                continue;
            }

            let mut vol_name = [0u16; 261];
            let mut fs_name = [0u16; 261];
            let mut free_bytes_avail = 0u64;
            let mut total_bytes = 0u64;
            let mut total_free = 0u64;

            let _ = unsafe {
                GetVolumeInformationW(
                    &root_h,
                    Some(&mut vol_name),
                    None,
                    None,
                    None,
                    Some(&mut fs_name),
                )
            };

            let _ = unsafe {
                GetDiskFreeSpaceExW(
                    &root_h,
                    Some(&mut free_bytes_avail),
                    Some(&mut total_bytes),
                    Some(&mut total_free),
                )
            };

            let label = String::from_utf16_lossy(&vol_name).trim_matches('\0').to_string();
            let fs = String::from_utf16_lossy(&fs_name).trim_matches('\0').to_string();
            let is_boot = letter == 'C';
            let dev_type = match drive_type_code {
                2 => DeviceType::UsbFlashDrive,
                3 => DeviceType::InternalNvme,
                _ => DeviceType::ExternalHdd,
            };

            let vol = Volume {
                drive_letter: Some(format!("{}:", letter)),
                label: if label.is_empty() { None } else { Some(label) },
                filesystem: if fs.is_empty() { None } else { Some(fs) },
                capacity: Some(total_bytes),
                free_space: Some(total_free),
                drive_type: Some(drive_type_code),
            };

            let part = Partition {
                index: 0,
                size: total_bytes,
                is_boot,
                is_primary: true,
                partition_type: Some(format!("Logical Disk {}", letter)),
                volumes: vec![vol],
            };

            disks.push(PhysicalDisk {
                index: i,
                device_id: format!(r"\\.\{}:", letter),
                model: Some(format!("Drive ({}:)", letter)),
                serial_number: None,
                capacity: total_bytes,
                media_type: Some(if drive_type_code == 2 { "Removable Media".into() } else { "Fixed hard disk".into() }),
                interface_type: Some(if drive_type_code == 2 { "USB".into() } else { "SATA/NVMe".into() }),
                pnp_device_id: None,
                bytes_per_sector: 512,
                total_sectors: if total_bytes > 0 { total_bytes / 512 } else { 0 },
                device_type: dev_type,
                is_boot_disk: is_boot,
                safety_status: if is_boot { SafetyStatus::Protected } else { SafetyStatus::Available },
                partitions: vec![part],
                // This fallback path only runs when WMI enumeration
                // returned nothing, and it enumerates drive letters (not
                // physical disk numbers), so there's no `\\.\PhysicalDriveN`
                // index here to run SMART READ DATA against. Reported as
                // genuinely unmeasured rather than fabricating a "Clear"
                // reading for a drive that was never actually queried.
                smart_health: Some(SmartHealth {
                    reallocated_sectors: 0,
                    pending_sectors: 0,
                    g_list_status: "Unavailable (Native Win32 Fallback — no physical disk index to query SMART)".to_string(),
                    purge_mandated: false,
                    health_percent: 100,
                    temperature_c: None,
                }),
            });
        }
    }

    disks
}

/// Check if current process has elevated Administrator privileges on Windows.
#[cfg(target_os = "windows")]
pub fn is_elevated() -> bool {
    #[link(name = "advapi32")]
    extern "system" {
        fn OpenProcessToken(process_handle: isize, desired_access: u32, token_handle: *mut isize) -> i32;
        fn GetTokenInformation(
            token_handle: isize,
            token_information_class: u32,
            token_information: *mut std::ffi::c_void,
            token_information_length: u32,
            return_length: *mut u32,
        ) -> i32;
    }
    #[link(name = "kernel32")]
    extern "system" {
        fn GetCurrentProcess() -> isize;
        fn CloseHandle(h_object: isize) -> i32;
    }

    const TOKEN_QUERY: u32 = 0x0008;
    const TOKEN_ELEVATION_CLASS: u32 = 20;

    #[repr(C)]
    struct TokenElevation {
        token_is_elevated: u32,
    }

    unsafe {
        let mut token: isize = 0;
        if OpenProcessToken(GetCurrentProcess(), TOKEN_QUERY, &mut token) != 0 {
            let mut elevation = TokenElevation { token_is_elevated: 0 };
            let mut ret_len = 0u32;
            let ok = GetTokenInformation(
                token,
                TOKEN_ELEVATION_CLASS,
                &mut elevation as *mut _ as *mut std::ffi::c_void,
                std::mem::size_of::<TokenElevation>() as u32,
                &mut ret_len,
            );
            CloseHandle(token);
            if ok != 0 {
                return elevation.token_is_elevated != 0;
            }
        }
    }
    false
}

#[cfg(not(target_os = "windows"))]
pub fn is_elevated() -> bool {
    true
}

/// Request Windows UAC elevation by re-launching the current executable with the "runas" verb.
#[cfg(target_os = "windows")]
pub fn elevate_self() -> bool {
    #[link(name = "shell32")]
    extern "system" {
        fn ShellExecuteW(
            hwnd: isize,
            lp_operation: *const u16,
            lp_file: *const u16,
            lp_parameters: *const u16,
            lp_directory: *const u16,
            n_show_cmd: i32,
        ) -> isize;
    }

    let exe = match std::env::current_exe() {
        Ok(p) => p,
        Err(_) => return false,
    };

    let wide_exe: Vec<u16> = exe.to_string_lossy().encode_utf16().chain(std::iter::once(0)).collect();
    let wide_op: Vec<u16> = "runas".encode_utf16().chain(std::iter::once(0)).collect();

    let args: Vec<String> = std::env::args().skip(1).collect();
    let args_str = args.join(" ");
    let wide_args: Vec<u16> = args_str.encode_utf16().chain(std::iter::once(0)).collect();

    const SW_SHOWNORMAL: i32 = 1;

    unsafe {
        let res = ShellExecuteW(
            0,
            wide_op.as_ptr(),
            wide_exe.as_ptr(),
            if args.is_empty() { std::ptr::null() } else { wide_args.as_ptr() },
            std::ptr::null(),
            SW_SHOWNORMAL,
        );
        res > 32
    }
}

#[cfg(not(target_os = "windows"))]
pub fn elevate_self() -> bool {
    false
}

