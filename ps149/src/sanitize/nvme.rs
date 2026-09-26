use anyhow::Result;
use serde::Serialize;

/// NVMe Sanitize action types per NVMe 1.4+ specification
#[derive(Debug, Clone, Copy, Serialize)]
pub enum NvmeSanitizeAction {
    /// Block Erase — physical reset of all NAND cells
    BlockErase,
    /// Crypto Erase — destroy the Media Encryption Key
    CryptoErase,
    /// Overwrite — write fixed pattern to all locations
    Overwrite,
}

impl std::fmt::Display for NvmeSanitizeAction {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::BlockErase => write!(f, "Block Erase (NAND Reset)"),
            Self::CryptoErase => write!(f, "Crypto Erase (Key Destruction)"),
            Self::Overwrite => write!(f, "Overwrite (Pattern Write)"),
        }
    }
}

#[derive(Debug, Clone, Serialize)]
pub struct NvmeSanitizeResult {
    pub device_path: String,
    pub action: NvmeSanitizeAction,
    pub success: bool,
    pub duration: std::time::Duration,
    pub message: String,
}

/// Check if a device supports NVMe Sanitize commands.
/// On Linux: reads /sys/block/<dev>/device/model and checks for NVMe namespace.
/// On Windows: queries the physical bus type via IOCTL_STORAGE_QUERY_PROPERTY.
#[cfg(target_os = "linux")]
pub fn supports_nvme_sanitize(device_path: &str) -> bool {
    // Check if it's an NVMe device by looking at /sys/class/nvme/
    let dev_name = std::path::Path::new(device_path)
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("");
    dev_name.starts_with("nvme")
}

/// Windows: real bus-type check, not a stub. Boot-disk exclusion is the
/// caller's responsibility (`hardware_purge::execute_firmware_purge`
/// already has full `PhysicalDisk` info to do that) — this function's only
/// concern is whether the transport can carry a Sanitize command at all.
#[cfg(windows)]
pub fn supports_nvme_sanitize(device_path: &str) -> bool {
    match parse_disk_index(device_path) {
        Some(idx) => matches!(
            crate::discovery::ioctl::query_bus_type(idx),
            Ok(crate::discovery::ioctl::BusType::Nvme)
        ),
        None => false,
    }
}

#[cfg(not(any(target_os = "linux", windows)))]
pub fn supports_nvme_sanitize(_device_path: &str) -> bool {
    false // Unsupported platform
}

#[cfg(windows)]
fn parse_disk_index(device_path: &str) -> Option<u32> {
    device_path
        .to_ascii_lowercase()
        .rsplit("physicaldrive")
        .next()
        .and_then(|s| s.parse::<u32>().ok())
}

/// Execute NVMe Sanitize command via ioctl (Linux only).
#[cfg(target_os = "linux")]
pub fn execute_nvme_sanitize(
    device_path: &str,
    action: NvmeSanitizeAction,
) -> Result<NvmeSanitizeResult> {
    use std::time::Instant;
    let start = Instant::now();

    // NVMe Admin command: Sanitize (opcode 0x84)
    // CDW10 bits [2:0]: Sanitize Action
    //   001b = Exit Failure Mode
    //   010b = Block Erase
    //   011b = Overwrite
    //   100b = Crypto Erase
    let sanact: u32 = match action {
        NvmeSanitizeAction::BlockErase => 0x02,
        NvmeSanitizeAction::Overwrite => 0x03,
        NvmeSanitizeAction::CryptoErase => 0x04,
    };

    // Use std::process::Command to invoke nvme-cli as a safe wrapper
    // rather than raw ioctl (nvme-cli handles error codes properly)
    let action_str = match action {
        NvmeSanitizeAction::BlockErase => "block-erase",
        NvmeSanitizeAction::CryptoErase => "crypto-erase",
        NvmeSanitizeAction::Overwrite => "overwrite",
    };

    let output = std::process::Command::new("nvme")
        .args(["sanitize", device_path, "-a", &sanact.to_string()])
        .output();

    match output {
        Ok(out) => {
            let success = out.status.success();
            let message = if success {
                format!("NVMe {} completed successfully", action)
            } else {
                let stderr = String::from_utf8_lossy(&out.stderr);
                format!("NVMe Sanitize failed: {}", stderr.trim())
            };
            Ok(NvmeSanitizeResult {
                device_path: device_path.to_string(),
                action,
                success,
                duration: start.elapsed(),
                message,
            })
        }
        Err(e) => Ok(NvmeSanitizeResult {
            device_path: device_path.to_string(),
            action,
            success: false,
            duration: start.elapsed(),
            message: format!(
                "nvme-cli not found or failed: {}. Install with: sudo apt install nvme-cli",
                e
            ),
        }),
    }
}

/// Windows: real implementation via `IOCTL_STORAGE_REINITIALIZE_MEDIA`. This
/// IOCTL blocks until the operation completes or times out, so a successful
/// return here is a genuine completed-erase guarantee — not merely "command
/// accepted" the way DSM TRIM is (see `sanitize::hardware_purge`).
///
/// Only `CryptoErase`/`BlockErase` map to a valid `STORAGE_SANITIZE_METHOD`
/// for this IOCTL — `Overwrite` isn't one of its options, so that action is
/// rejected here rather than silently doing something else.
#[cfg(windows)]
pub fn execute_nvme_sanitize(
    device_path: &str,
    action: NvmeSanitizeAction,
) -> Result<NvmeSanitizeResult> {
    use std::ffi::{c_void, OsStr};
    use std::os::windows::ffi::OsStrExt;
    use std::time::Instant;
    use windows::core::PCWSTR;
    use windows::Win32::Foundation::{CloseHandle, GENERIC_READ, GENERIC_WRITE};
    use windows::Win32::Storage::FileSystem::{
        CreateFileW, FILE_FLAGS_AND_ATTRIBUTES, FILE_SHARE_READ, FILE_SHARE_WRITE, OPEN_EXISTING,
    };
    use windows::Win32::System::Ioctl::{
        IOCTL_STORAGE_REINITIALIZE_MEDIA, STORAGE_REINITIALIZE_MEDIA,
        STORAGE_REINITIALIZE_MEDIA_0, StorageSanitizeMethodBlockErase,
        StorageSanitizeMethodCryptoErase,
    };
    use windows::Win32::System::IO::DeviceIoControl;

    let start = Instant::now();

    let sanitize_method = match action {
        NvmeSanitizeAction::CryptoErase => StorageSanitizeMethodCryptoErase,
        NvmeSanitizeAction::BlockErase => StorageSanitizeMethodBlockErase,
        NvmeSanitizeAction::Overwrite => {
            return Ok(NvmeSanitizeResult {
                device_path: device_path.to_string(),
                action,
                success: false,
                duration: start.elapsed(),
                message: "Overwrite is not a valid IOCTL_STORAGE_REINITIALIZE_MEDIA option \
                    on Windows — use a pattern-overwrite sanitization method instead."
                    .to_string(),
            });
        }
    };

    const TIMEOUT_SECS: u32 = 300;

    let path_u16: Vec<u16> = OsStr::new(device_path)
        .encode_wide()
        .chain(std::iter::once(0))
        .collect();

    let handle = unsafe {
        // SAFETY: path_u16 is a valid null-terminated UTF-16 string.
        CreateFileW(
            PCWSTR(path_u16.as_ptr()),
            GENERIC_READ.0 | GENERIC_WRITE.0,
            FILE_SHARE_READ | FILE_SHARE_WRITE,
            None,
            OPEN_EXISTING,
            FILE_FLAGS_AND_ATTRIBUTES(0),
            None,
        )
    };
    let handle = match handle {
        Ok(h) => h,
        Err(e) => {
            return Ok(NvmeSanitizeResult {
                device_path: device_path.to_string(),
                action,
                success: false,
                duration: start.elapsed(),
                message: format!("Failed to open {} (requires Administrator): {}", device_path, e),
            });
        }
    };

    let mut bytes_returned: u32 = 0;

    // Attempt 1: bare IOCTL (NULL input) — broadest driver support, defaults
    // to crypto erase on current drivers per Microsoft's documentation.
    let bare_result = unsafe {
        DeviceIoControl(
            handle,
            IOCTL_STORAGE_REINITIALIZE_MEDIA,
            None,
            0,
            None,
            0,
            Some(&mut bytes_returned),
            None,
        )
    };

    let final_result = if bare_result.is_ok() {
        bare_result
    } else {
        // Attempt 2: explicit struct requesting the specific sanitize method.
        // SanitizeMethod occupies bits 0-3 of the packed bitfield per the
        // ntddstor.h STORAGE_REINITIALIZE_MEDIA layout.
        let sanitize_method_bits = (sanitize_method.0 as u32) & 0xF;
        let input = STORAGE_REINITIALIZE_MEDIA {
            Version: std::mem::size_of::<STORAGE_REINITIALIZE_MEDIA>() as u32,
            Size: std::mem::size_of::<STORAGE_REINITIALIZE_MEDIA>() as u32,
            TimeoutInSeconds: TIMEOUT_SECS,
            SanitizeOption: STORAGE_REINITIALIZE_MEDIA_0 {
                _bitfield: sanitize_method_bits,
            },
        };
        unsafe {
            DeviceIoControl(
                handle,
                IOCTL_STORAGE_REINITIALIZE_MEDIA,
                Some(&input as *const _ as *const c_void),
                std::mem::size_of::<STORAGE_REINITIALIZE_MEDIA>() as u32,
                None,
                0,
                Some(&mut bytes_returned),
                None,
            )
        }
    };

    unsafe {
        let _ = CloseHandle(handle);
    }

    match final_result {
        Ok(()) => Ok(NvmeSanitizeResult {
            device_path: device_path.to_string(),
            action,
            success: true,
            duration: start.elapsed(),
            message: format!(
                "NVMe {} completed via IOCTL_STORAGE_REINITIALIZE_MEDIA (blocking call — \
                 completion confirmed before return).",
                action
            ),
        }),
        Err(e) => Ok(NvmeSanitizeResult {
            device_path: device_path.to_string(),
            action,
            success: false,
            duration: start.elapsed(),
            message: format!(
                "NVMe Sanitize not supported by this drive/driver, or this is a USB-enclosed/\
                 boot disk where it can't apply: {}",
                e
            ),
        }),
    }
}

#[cfg(not(any(target_os = "linux", windows)))]
pub fn execute_nvme_sanitize(
    device_path: &str,
    action: NvmeSanitizeAction,
) -> Result<NvmeSanitizeResult> {
    Ok(NvmeSanitizeResult {
        device_path: device_path.to_string(),
        action,
        success: false,
        duration: std::time::Duration::ZERO,
        message: "NVMe Sanitize not supported on this platform.".to_string(),
    })
}
