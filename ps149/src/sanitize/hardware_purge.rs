/// Hardware-Level Firmware Purge Engine
///
/// Two mechanisms, tried in order by `execute_firmware_purge`:
///
/// 1. **NVMe Sanitize (Crypto Erase)** — `sanitize::nvme::execute_nvme_sanitize`,
///    via `IOCTL_STORAGE_REINITIALIZE_MEDIA`. This IOCTL blocks until the
///    operation completes (or times out), so a success here is a genuine
///    verified erase — reported as `verified_purge: true`. Internal,
///    non-boot NVMe drives only.
/// 2. **DSM TRIM/Deallocate** (this file) — advisory fallback for
///    everything else. Tells the controller which blocks are free, but does
///    not itself guarantee or verify physical erasure — reported as
///    `verified_purge: false` and never described as a completed NIST
///    SP 800-88 Purge (see the honest wording in `hardware_trim_device`'s
///    success message).
///
/// **Still NOT implemented:** ATA Secure Erase Unit on Windows — Windows's
/// own AHCI stack freezes the ATA security feature set at driver init on a
/// normal desktop session (this needs WinPE; there's no in-OS workaround),
/// so it's deliberately out of scope here rather than a path that would
/// silently fail on every normal run. OPAL/SED crypto erase (see
/// `sanitize::opal`) is implemented separately — a PSID-authenticated
/// `Revert` via `sanitize::opal_protocol` — but, like everything else in
/// this file, has never been run against real hardware from this
/// environment; see `REMAINING_WORK.md`.
///
/// Why hardware-level purge matters at all:
/// Software LBA overwriting cannot reach over-provisioned NAND flash blocks,
/// retired bad sectors, or wear-leveling pools hidden by the Flash Translation
/// Layer (FTL). Hardware-level purge commands force the drive controller to
/// electrically wipe or crypto-erase all internal NAND flash cells.
use anyhow::Result;
use serde::Serialize;
use std::mem::size_of;
use std::time::Instant;
use tracing::{info, warn};

#[derive(Debug, Clone, Serialize)]
pub struct HardwarePurgeResult {
    pub disk_index: u32,
    pub command_type: String,
    pub success: bool,
    /// `true` only for a genuine completed erase (NVMe Sanitize) — `false`
    /// for TRIM/Deallocate, which is advisory-only even when acknowledged.
    /// Callers should gate any "Verified Purge" certificate wording on this,
    /// not on `success` alone.
    pub verified_purge: bool,
    pub bytes_affected: u64,
    pub duration_secs: f64,
    pub message: String,
}

const IOCTL_STORAGE_MANAGE_DATA_SET_ATTRIBUTES: u32 = 0x002D1400;
const DEVICE_DSM_ACTION_TRIM: u32 = 1;

#[repr(C)]
struct DeviceManageDataSetAttributes {
    size: u32,
    action: u32,
    flags: u32,
    operation_intent: u32,
    non_contiguous_range_entry_size: u32,
    range_count: u32,
    data_set_ranges_offset: u32,
    data_set_ranges_length: u32,
}

#[repr(C)]
struct DeviceDataSetRange {
    starting_offset: i64,
    length_in_bytes: i64,
}

/// Issues a hardware TRIM/Deallocate command across all LBAs of the storage device.
/// Forces the SSD controller to erase internal NAND flash cell references.
#[cfg(windows)]
pub fn hardware_trim_device(
    disk_index: u32,
    total_capacity_bytes: u64,
) -> Result<HardwarePurgeResult> {
    use windows::core::{HSTRING, PCWSTR};
    use windows::Win32::Foundation::GENERIC_WRITE;
    use windows::Win32::Storage::FileSystem::{
        CreateFileW, FILE_FLAGS_AND_ATTRIBUTES, FILE_SHARE_READ, FILE_SHARE_WRITE, OPEN_EXISTING,
    };
    use windows::Win32::System::IO::DeviceIoControl;

    let start = Instant::now();
    let path = format!("\\\\.\\PhysicalDrive{}", disk_index);
    let hstring = HSTRING::from(path.clone());

    info!(
        "Issuing hardware TRIM / Deallocate command to PhysicalDrive{}",
        disk_index
    );

    let handle = unsafe {
        CreateFileW(
            PCWSTR(hstring.as_ptr()),
            GENERIC_WRITE.0,
            FILE_SHARE_READ | FILE_SHARE_WRITE,
            None,
            OPEN_EXISTING,
            FILE_FLAGS_AND_ATTRIBUTES(0),
            None,
        )
    }?;

    if handle.is_invalid() {
        anyhow::bail!(
            "Failed to open physical drive {} for hardware purge",
            disk_index
        );
    }

    // Build the DSM Trim request buffer
    let header_size = size_of::<DeviceManageDataSetAttributes>();
    let range_size = size_of::<DeviceDataSetRange>();
    let total_size = header_size + range_size;

    let mut buffer = vec![0u8; total_size];

    let header = DeviceManageDataSetAttributes {
        size: header_size as u32,
        action: DEVICE_DSM_ACTION_TRIM,
        flags: 0,
        operation_intent: 0,
        non_contiguous_range_entry_size: 0,
        range_count: 1,
        data_set_ranges_offset: header_size as u32,
        data_set_ranges_length: range_size as u32,
    };

    let range = DeviceDataSetRange {
        starting_offset: 0,
        length_in_bytes: total_capacity_bytes as i64,
    };

    unsafe {
        std::ptr::copy_nonoverlapping(
            &header as *const _ as *const u8,
            buffer.as_mut_ptr(),
            header_size,
        );
        std::ptr::copy_nonoverlapping(
            &range as *const _ as *const u8,
            buffer.as_mut_ptr().add(header_size),
            range_size,
        );
    }

    let mut bytes_returned = 0u32;
    let success = unsafe {
        DeviceIoControl(
            handle,
            IOCTL_STORAGE_MANAGE_DATA_SET_ATTRIBUTES,
            Some(buffer.as_ptr() as *const _),
            buffer.len() as u32,
            None,
            0,
            Some(&mut bytes_returned),
            None,
        )
    };

    let duration = start.elapsed().as_secs_f64();

    match success {
        Ok(()) => {
            info!(
                "Hardware TRIM purge completed successfully on PhysicalDrive{} ({:.2} GB in {:.2}s)",
                disk_index,
                total_capacity_bytes as f64 / (1024.0 * 1024.0 * 1024.0),
                duration
            );
            Ok(HardwarePurgeResult {
                disk_index,
                command_type: "DSM_TRIM_DEALLOCATE".to_string(),
                success: true,
                verified_purge: false,
                bytes_affected: total_capacity_bytes,
                duration_secs: duration,
                // Honest framing: the controller only acknowledged the
                // command here — TRIM is advisory, not a verified erase.
                // Whether/when the underlying NAND is actually cleared is
                // entirely up to the controller's own garbage collection,
                // which is not observable or guaranteed by this call. Do
                // not describe this as a completed NIST 800-88 Purge.
                message: "Hardware deallocation command acknowledged by the controller. This is advisory (TRIM), not a verified erase — actual physical clearing timing and completeness are controller-dependent and not guaranteed by this command.".to_string(),
            })
        }
        Err(e) => {
            warn!(
                "PhysicalDrive{} rejected hardware TRIM (may be mechanical HDD or unsupported USB bridge): {}",
                disk_index, e
            );
            Ok(HardwarePurgeResult {
                disk_index,
                command_type: "DSM_TRIM_DEALLOCATE".to_string(),
                success: false,
                verified_purge: false,
                bytes_affected: 0,
                duration_secs: duration,
                message: format!(
                    "Device controller does not support DSM TRIM or blocked by USB bridge: {}",
                    e
                ),
            })
        }
    }
}

#[cfg(not(windows))]
pub fn hardware_trim_device(
    disk_index: u32,
    total_capacity_bytes: u64,
) -> Result<HardwarePurgeResult> {
    Ok(HardwarePurgeResult {
        disk_index,
        command_type: "UNSUPPORTED_OS".to_string(),
        success: false,
        verified_purge: false,
        bytes_affected: 0,
        duration_secs: 0.0,
        message: "Hardware purge only supported on Windows Win32 API".to_string(),
    })
}

/// Attempts a hardware-level purge, trying the strongest available
/// mechanism first: NVMe Sanitize (Crypto Erase) on internal, non-boot NVMe
/// drives, falling back to DSM TRIM/Deallocate for everything else (or if
/// Sanitize itself fails — unsupported drive/driver). Returns
/// `success: false` (with no certificate generated by the caller) rather
/// than a false positive when nothing supports it — e.g. most USB flash
/// drives, where TRIM also fails.
pub fn execute_firmware_purge(
    disk_index: u32,
    capacity_bytes: u64,
    device_type_desc: &str,
    is_boot_disk: bool,
) -> Result<HardwarePurgeResult> {
    info!(
        "Initiating hardware purge sequence on Disk {} ({})",
        disk_index, device_type_desc
    );

    // Step 1: NVMe Sanitize (Crypto Erase) — genuine verified erase, only
    // possible on internal, non-boot NVMe drives.
    #[cfg(windows)]
    if !is_boot_disk {
        let device_path = format!("\\\\.\\PhysicalDrive{}", disk_index);
        if crate::sanitize::nvme::supports_nvme_sanitize(&device_path) {
            info!("Disk {} identified as NVMe — attempting Sanitize (Crypto Erase)", disk_index);
            match crate::sanitize::nvme::execute_nvme_sanitize(
                &device_path,
                crate::sanitize::nvme::NvmeSanitizeAction::CryptoErase,
            ) {
                Ok(nvme_result) if nvme_result.success => {
                    return Ok(HardwarePurgeResult {
                        disk_index,
                        command_type: "NVME_SANITIZE_CRYPTO_ERASE".to_string(),
                        success: true,
                        verified_purge: true,
                        bytes_affected: capacity_bytes,
                        duration_secs: nvme_result.duration.as_secs_f64(),
                        message: nvme_result.message,
                    });
                }
                Ok(nvme_result) => {
                    warn!(
                        "NVMe Sanitize failed on Disk {}, falling back to TRIM: {}",
                        disk_index, nvme_result.message
                    );
                }
                Err(e) => {
                    warn!("NVMe Sanitize errored on Disk {}, falling back to TRIM: {}", disk_index, e);
                }
            }
        }
    }
    #[cfg(not(windows))]
    let _ = is_boot_disk;

    // Step 2: DSM TRIM / Deallocate — advisory fallback.
    let trim_result = hardware_trim_device(disk_index, capacity_bytes)?;
    if trim_result.success {
        return Ok(trim_result);
    }

    // Both mechanisms failed — notify the operator with a concrete next step.
    Ok(HardwarePurgeResult {
        disk_index,
        command_type: "FIRMWARE_PURGE_FALLBACK".to_string(),
        success: false,
        verified_purge: false,
        bytes_affected: 0,
        duration_secs: trim_result.duration_secs,
        message: format!(
            "No hardware erase mechanism succeeded for {} (NVMe Sanitize unavailable or \
             failed; DSM TRIM rejected by controller/bridge). \
             Recommended: Use a pattern-overwrite sanitization method instead.",
            device_type_desc
        ),
    })
}
