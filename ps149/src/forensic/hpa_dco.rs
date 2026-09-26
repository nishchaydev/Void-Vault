use anyhow::Result;
use serde::{Deserialize, Serialize};
#[cfg(target_os = "linux")]
use std::process::Command;

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
pub enum HiddenAreaType {
    Hpa,
    Dco,
    Both,
    None,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HiddenAreaReport {
    pub area_type: HiddenAreaType,
    pub native_max_sectors: u64,
    pub reported_sectors: u64,
    pub dco_max_sectors: Option<u64>,
    pub hidden_bytes: u64,
    pub recommendations: Vec<String>,
}

pub fn detect_hidden_areas(
    reported_sectors: u64,
    native_max: u64,
    dco_max: Option<u64>,
) -> HiddenAreaReport {
    let mut has_hpa = false;
    let mut has_dco = false;
    let mut hidden_sectors = 0;
    let mut recommendations = Vec::new();

    if native_max > reported_sectors {
        has_hpa = true;
        let hpa_hidden = native_max - reported_sectors;
        hidden_sectors += hpa_hidden;
        recommendations.push(format!(
            "HPA detected: {} hidden sectors. Use hdparm --Nnative to remove.",
            hpa_hidden
        ));
    }

    if let Some(dco) = dco_max {
        if dco > native_max {
            has_dco = true;
            let dco_hidden = dco - native_max;
            hidden_sectors += dco_hidden;
            recommendations.push(format!(
                "DCO detected: {} hidden sectors. Use hdparm --dco-restore to remove.",
                dco_hidden
            ));
        }
    }

    let area_type = match (has_hpa, has_dco) {
        (true, true) => HiddenAreaType::Both,
        (true, false) => HiddenAreaType::Hpa,
        (false, true) => HiddenAreaType::Dco,
        (false, false) => HiddenAreaType::None,
    };

    let hidden_bytes = hidden_sectors * 512;

    HiddenAreaReport {
        area_type,
        native_max_sectors: native_max,
        reported_sectors,
        dco_max_sectors: dco_max,
        hidden_bytes,
        recommendations,
    }
}

#[cfg(target_os = "linux")]
pub fn query_native_max_linux(device: &str) -> Result<u64> {
    let output = Command::new("hdparm").arg("-N").arg(device).output()?;

    let stdout = String::from_utf8_lossy(&output.stdout);
    for line in stdout.lines() {
        if line.contains("max sectors") {
            // Very simplistic parse, actual hdparm format: max sectors = 1234567/1234567, HPA is enabled
            let parts: Vec<&str> = line.split_whitespace().collect();
            for part in parts {
                if part.contains('/') {
                    if let Ok(sectors) = part.split('/').next().unwrap_or("").parse::<u64>() {
                        return Ok(sectors);
                    }
                }
            }
        }
    }

    Err(anyhow::anyhow!(
        "Could not parse native max sectors from hdparm output"
    ))
}

/// `device` is a Windows disk index as a string (e.g. "1"), matching how
/// this is invoked from `server.rs` — kept as `&str` for parity with the
/// Linux signature (`&device path`) rather than changing the public
/// signature across both platforms.
#[cfg(target_os = "windows")]
pub fn query_native_max_windows(device: &str) -> Result<u64> {
    let disk_index: u32 = device
        .trim()
        .trim_start_matches(r"\\.\PhysicalDrive")
        .parse()
        .map_err(|_| anyhow::anyhow!("Could not parse disk index from '{}'", device))?;
    crate::discovery::ioctl::read_native_max_address_ext(disk_index)
}

/// DCO max sectors, if the drive supports DCO at all (`None` is the normal
/// case for most drives, not a failure).
#[cfg(target_os = "windows")]
pub fn query_dco_max_windows(device: &str) -> Result<Option<u64>> {
    let disk_index: u32 = device
        .trim()
        .trim_start_matches(r"\\.\PhysicalDrive")
        .parse()
        .map_err(|_| anyhow::anyhow!("Could not parse disk index from '{}'", device))?;
    crate::discovery::ioctl::read_dco_max_sectors(disk_index)
}

#[cfg(not(any(target_os = "linux", target_os = "windows")))]
pub fn query_native_max_linux(_device: &str) -> Result<u64> {
    Ok(0)
}

pub fn format_hidden_area_report(report: &HiddenAreaReport) -> String {
    let mut output = format!(
        "Hidden Area Report:\nType: {:?}\nReported Sectors: {}\nNative Max Sectors: {}\n",
        report.area_type, report.reported_sectors, report.native_max_sectors
    );

    if let Some(dco) = report.dco_max_sectors {
        output.push_str(&format!("DCO Max Sectors: {}\n", dco));
    }

    output.push_str(&format!("Total Hidden Bytes: {}\n", report.hidden_bytes));

    if !report.recommendations.is_empty() {
        output.push_str("Recommendations:\n");
        for rec in &report.recommendations {
            output.push_str(&format!("- {}\n", rec));
        }
    }

    output
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_no_hidden_areas() {
        let report = detect_hidden_areas(1000, 1000, Some(1000));
        assert_eq!(report.area_type, HiddenAreaType::None);
        assert_eq!(report.hidden_bytes, 0);
        assert!(report.recommendations.is_empty());
    }

    #[test]
    fn test_hpa_only() {
        let report = detect_hidden_areas(900, 1000, Some(1000));
        assert_eq!(report.area_type, HiddenAreaType::Hpa);
        assert_eq!(report.hidden_bytes, 100 * 512);
        assert_eq!(report.recommendations.len(), 1);
        assert!(report.recommendations[0].contains("HPA detected"));
    }

    #[test]
    fn test_dco_only() {
        let report = detect_hidden_areas(1000, 1000, Some(1100));
        assert_eq!(report.area_type, HiddenAreaType::Dco);
        assert_eq!(report.hidden_bytes, 100 * 512);
        assert_eq!(report.recommendations.len(), 1);
        assert!(report.recommendations[0].contains("DCO detected"));
    }

    #[test]
    fn test_both_hpa_and_dco() {
        let report = detect_hidden_areas(900, 1000, Some(1100));
        assert_eq!(report.area_type, HiddenAreaType::Both);
        assert_eq!(report.hidden_bytes, 200 * 512);
        assert_eq!(report.recommendations.len(), 2);
    }

    #[test]
    fn test_format_report() {
        let report = detect_hidden_areas(900, 1000, Some(1100));
        let formatted = format_hidden_area_report(&report);
        assert!(formatted.contains("Type: Both"));
        assert!(formatted.contains("Total Hidden Bytes: 102400"));
        assert!(formatted.contains("HPA detected"));
        assert!(formatted.contains("DCO detected"));
    }
}
