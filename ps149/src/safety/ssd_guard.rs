use crate::model::device_type::DeviceType;
use crate::sanitize::patterns::SanitizeMethod;

#[derive(Debug, Clone)]
pub enum SsdWarningLevel {
    None,
    Advisory,
    Critical,
}

#[derive(Debug, Clone)]
pub struct SsdWarning {
    pub level: SsdWarningLevel,
    pub device_type: String,
    pub message: String,
    pub recommendation: String,
}

pub fn check_ssd_sanitize_warning(device_type: &DeviceType, method: &SanitizeMethod) -> SsdWarning {
    let _ = method; // All current SanitizeMethods are software overwrites
    match device_type {
        DeviceType::InternalHdd | DeviceType::ExternalHdd => {
            SsdWarning {
                level: SsdWarningLevel::None,
                device_type: device_type.to_string(),
                message: "Magnetic media detected. Overwrite is effective.".to_string(),
                recommendation: "Proceed with standard sanitization.".to_string(),
            }
        },
        DeviceType::InternalSsd | DeviceType::InternalNvme | DeviceType::ExternalSsd => {
            SsdWarning {
                level: SsdWarningLevel::Critical,
                device_type: device_type.to_string(),
                message: "Software overwrite leaves up to 67% of SSD data intact in overprovisioned areas (Wei et al., FAST 2011).".to_string(),
                recommendation: "Use NVMe Sanitize (Block Erase) or ATA Secure Erase for complete sanitization.".to_string(),
            }
        },
        DeviceType::UsbFlashDrive | DeviceType::SdCard | DeviceType::Emmc | DeviceType::Ufs => {
            SsdWarning {
                level: SsdWarningLevel::Advisory,
                device_type: device_type.to_string(),
                message: "Flash media detected. Wear-leveling (FTL) may prevent some blocks from being overwritten.".to_string(),
                recommendation: "Physical destruction recommended for highly sensitive data.".to_string(),
            }
        },
        _ => {
            SsdWarning {
                level: SsdWarningLevel::Advisory,
                device_type: device_type.to_string(),
                message: "Unknown storage medium. Effectiveness of overwrite cannot be guaranteed.".to_string(),
                recommendation: "Verify media type before sanitization.".to_string(),
            }
        }
    }
}
