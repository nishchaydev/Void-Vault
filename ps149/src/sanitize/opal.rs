#[derive(Debug, Clone)]
pub struct OpalDriveInfo {
    pub supports_opal: bool,
    pub opal_version: Option<String>,
    pub locked: bool,
    pub encryption_supported: bool,
}

#[derive(Debug, Clone)]
pub struct OpalEraseResult {
    pub success: bool,
    pub method: OpalMethod,
    pub duration: std::time::Duration,
    pub details: String,
}

#[derive(Debug, Clone)]
pub enum OpalMethod {
    CryptoErase,
    RevertTper,
    RevertSp,
}

#[cfg(target_os = "linux")]
pub fn detect_opal_support(device_path: &str) -> OpalDriveInfo {
    let path = std::path::Path::new("/sys/class/block")
        .join(device_path.trim_start_matches("/dev/"))
        .join("device/sed");

    let supports = path.exists();
    OpalDriveInfo {
        supports_opal: supports,
        opal_version: if supports {
            Some("2.0".to_string())
        } else {
            None
        },
        locked: false,
        encryption_supported: supports,
    }
}

/// Real TCG Opal detection via Level 0 Discovery (see
/// `discovery::ioctl::opal_discovery0`) — not an erase, a single
/// unauthenticated read-only query. Detection only — the actual erase
/// (`crypto_erase` below) is a separate call, implemented on Windows via
/// `opal_protocol`'s PSID-authenticated `Revert` (see that module's doc
/// comment for scope and how much to trust it before real hardware
/// confirms it). Feature codes
/// (TPer=0x0001, Locking=0x0002, Geometry=0x0003, Opal v1.00=0x0200,
/// Single User Mode=0x0201, Additional DataStore=0x0202, Opal v2.00=0x0203)
/// verified against both the Linux kernel's `block/opal_proto.h` and
/// Drive-Trust-Alliance `sedutil`'s `DtaStructures.h` — both agree exactly.
///
/// `locked` is deliberately left `false` (unknown, not "confirmed
/// unlocked") — determining actual lock state needs the Locking feature
/// descriptor's SSC-specific status bits, which this Discovery-0-only pass
/// doesn't parse. Don't read `locked: false` here as a guarantee.
#[cfg(target_os = "windows")]
pub fn detect_opal_support(device_path: &str) -> OpalDriveInfo {
    let disk_index: u32 = match device_path
        .trim()
        .trim_start_matches(r"\\.\PhysicalDrive")
        .parse()
    {
        Ok(idx) => idx,
        Err(_) => {
            return OpalDriveInfo {
                supports_opal: false,
                opal_version: None,
                locked: false,
                encryption_supported: false,
            };
        }
    };

    let data = match crate::discovery::ioctl::opal_discovery0(disk_index) {
        Ok(d) => d,
        Err(_) => {
            // Command rejected — most drives simply don't support this at
            // all. Not an error worth surfacing, same as DCO's "not found".
            return OpalDriveInfo {
                supports_opal: false,
                opal_version: None,
                locked: false,
                encryption_supported: false,
            };
        }
    };

    const FC_OPAL_V100: u16 = 0x0200;
    const FC_OPAL_V200: u16 = 0x0203;

    let mut supports_opal = false;
    let mut opal_version = None;

    // Walk feature descriptors starting right after the 48-byte header.
    // Bounds-checked against the fixed 512-byte buffer regardless of the
    // header's own length field, so a misread there can't cause an
    // out-of-bounds read — worst case it just stops a little early/late on
    // padding.
    let mut offset = 48usize;
    while offset + 4 <= data.len() {
        let code = u16::from_be_bytes([data[offset], data[offset + 1]]);
        let len = data[offset + 3] as usize;
        if code == 0 && len == 0 {
            break; // ran into zero-padded tail, nothing more to parse
        }
        let body_start = offset + 4;
        if body_start + len > data.len() {
            break; // malformed/truncated — stop rather than read out of bounds
        }

        if code == FC_OPAL_V200 {
            supports_opal = true;
            opal_version = Some("2.00".to_string());
        } else if code == FC_OPAL_V100 && opal_version.is_none() {
            supports_opal = true;
            opal_version = Some("1.00".to_string());
        }

        offset = body_start + len;
    }

    OpalDriveInfo {
        supports_opal,
        opal_version,
        locked: false, // not determined by Discovery-0 — see doc comment above
        encryption_supported: supports_opal,
    }
}

#[cfg(target_os = "linux")]
pub fn crypto_erase(device_path: &str, admin_password: &str) -> anyhow::Result<OpalEraseResult> {
    use std::process::Command;
    let start = std::time::Instant::now();
    let status = Command::new("sedutil-cli")
        .args(&["--revertTPer", admin_password, device_path])
        .status();

    let success = status.map(|s| s.success()).unwrap_or(false);
    Ok(OpalEraseResult {
        success,
        method: OpalMethod::CryptoErase,
        duration: start.elapsed(),
        details: if success {
            "Crypto Erase successful via sedutil-cli".to_string()
        } else {
            "Failed to execute sedutil-cli".to_string()
        },
    })
}

/// Performs a real TCG Opal crypto-erase on Windows via `opal_protocol`'s
/// PSID-authenticated `Revert` call (see that module's doc comment for the
/// full session protocol and its provenance).
///
/// **`psid`, not an admin/SID password**: unlike the Linux path above
/// (which shells out to `sedutil-cli --revertTPer`, authenticating as the
/// SID/owner authority with whatever password the drive was previously
/// provisioned with), this Windows implementation only supports the
/// **PSID** authority — the fixed physical value printed on the drive's
/// label, usable even on a drive that was never provisioned with an admin
/// password at all. The two platforms are not equivalent yet: a drive
/// erased here needs its physical PSID; the Linux path needs its
/// previously-set SID password. Implementing SID/Admin1-authenticated
/// sessions here too is a real, separate gap (see `opal_protocol`'s doc
/// comment) — not silently assumed to work by reusing this same parameter.
///
/// **Never compiled or run against real Opal hardware** — see
/// `REMAINING_WORK.md` and `opal_protocol`'s doc comment for what that
/// means for how much to trust this before using it for an actual erase.
#[cfg(target_os = "windows")]
pub fn crypto_erase(device_path: &str, psid: &str) -> anyhow::Result<OpalEraseResult> {
    let start = std::time::Instant::now();

    let disk_index: u32 = match device_path
        .trim()
        .trim_start_matches(r"\\.\PhysicalDrive")
        .parse()
    {
        Ok(idx) => idx,
        Err(_) => {
            return Ok(OpalEraseResult {
                success: false,
                method: OpalMethod::RevertTper,
                duration: start.elapsed(),
                details: format!(
                    "Could not parse a physical disk index out of '{}' (expected \
                     \\\\.\\PhysicalDriveN)",
                    device_path
                ),
            });
        }
    };

    match super::opal_protocol::psid_revert(disk_index, psid.as_bytes()) {
        Ok(()) => Ok(OpalEraseResult {
            success: true,
            method: OpalMethod::RevertTper,
            duration: start.elapsed(),
            details: "PSID Revert (RevertTPer) succeeded — the drive has generated new \
                internal media encryption keys and reset to factory state. This has never \
                been run against real Opal hardware; treat a first real run as a validation \
                run, not a routine one."
                .to_string(),
        }),
        Err(e) => Ok(OpalEraseResult {
            success: false,
            method: OpalMethod::RevertTper,
            duration: start.elapsed(),
            details: format!("PSID Revert failed: {}", e),
        }),
    }
}

pub fn format_opal_report(result: &OpalEraseResult) -> String {
    format!(
        "TCG OPAL ERASURE REPORT\n\
        Success: {}\n\
        Method: {:?}\n\
        Duration: {:.2}s\n\
        Details: {}",
        result.success,
        result.method,
        result.duration.as_secs_f64(),
        result.details
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_format_opal_report() {
        let result = OpalEraseResult {
            success: true,
            method: OpalMethod::CryptoErase,
            duration: std::time::Duration::from_secs(5),
            details: "Test".to_string(),
        };
        let report = format_opal_report(&result);
        assert!(report.contains("Success: true"));
    }
}
