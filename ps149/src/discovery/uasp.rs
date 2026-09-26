#[derive(Debug, Clone)]
pub struct UaspStatus {
    pub uasp_supported: bool,
    pub protocol: UsbProtocol,
    pub max_queue_depth: u32,
    pub recommended_buffer_size: usize,
}

#[derive(Debug, Clone, PartialEq)]
pub enum UsbProtocol {
    Bot,  // Bulk-Only Transport (legacy, queue depth 1)
    Uasp, // USB Attached SCSI (queue depth 32+)
    Unknown,
}

pub fn detect_uasp(device_path: &str) -> UaspStatus {
    #[cfg(target_os = "linux")]
    {
        let mut protocol = UsbProtocol::Unknown;

        if let Ok(entries) = std::fs::read_dir("/sys/bus/usb/devices/") {
            for entry in entries.flatten() {
                let path = entry.path().join("bInterfaceProtocol");
                if let Ok(content) = std::fs::read_to_string(path) {
                    let trimmed = content.trim();
                    if trimmed == "62" {
                        protocol = UsbProtocol::Uasp;
                        break;
                    } else if trimmed == "50" {
                        protocol = UsbProtocol::Bot;
                    }
                }
            }
        }

        let (buf_size, queue_depth) = recommended_settings_for_proto(&protocol);
        return UaspStatus {
            uasp_supported: protocol == UsbProtocol::Uasp,
            protocol,
            max_queue_depth: queue_depth,
            recommended_buffer_size: buf_size,
        };
    }

    #[cfg(target_os = "windows")]
    {
        let protocol = if device_path.to_lowercase().contains("uasp") {
            UsbProtocol::Uasp
        } else {
            UsbProtocol::Bot
        };

        let (buf_size, queue_depth) = recommended_settings_for_proto(&protocol);
        return UaspStatus {
            uasp_supported: protocol == UsbProtocol::Uasp,
            protocol,
            max_queue_depth: queue_depth,
            recommended_buffer_size: buf_size,
        };
    }

    #[cfg(not(any(target_os = "linux", target_os = "windows")))]
    {
        let protocol = UsbProtocol::Unknown;
        let (buf_size, queue_depth) = recommended_settings_for_proto(&protocol);
        UaspStatus {
            uasp_supported: false,
            protocol,
            max_queue_depth: queue_depth,
            recommended_buffer_size: buf_size,
        }
    }
}

pub fn recommended_settings(status: &UaspStatus) -> (usize, u32) {
    recommended_settings_for_proto(&status.protocol)
}

fn recommended_settings_for_proto(protocol: &UsbProtocol) -> (usize, u32) {
    match protocol {
        UsbProtocol::Uasp => (4 * 1024 * 1024, 32),
        UsbProtocol::Bot => (1024 * 1024, 1),
        UsbProtocol::Unknown => (1024 * 1024, 1),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_recommended_settings() {
        let status = UaspStatus {
            uasp_supported: true,
            protocol: UsbProtocol::Uasp,
            max_queue_depth: 32,
            recommended_buffer_size: 4 * 1024 * 1024,
        };
        let (buf, qd) = recommended_settings(&status);
        assert_eq!(buf, 4 * 1024 * 1024);
        assert_eq!(qd, 32);

        let bot_status = UaspStatus {
            uasp_supported: false,
            protocol: UsbProtocol::Bot,
            max_queue_depth: 1,
            recommended_buffer_size: 1024 * 1024,
        };
        let (buf2, qd2) = recommended_settings(&bot_status);
        assert_eq!(buf2, 1024 * 1024);
        assert_eq!(qd2, 1);
    }

    #[test]
    fn test_detect_uasp_fallback() {
        let status = detect_uasp("dummy");
        assert!(status.max_queue_depth >= 1);
    }
}
