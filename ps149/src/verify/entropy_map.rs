use serde::Serialize;

#[derive(Debug, Clone, PartialEq, Serialize)]
pub enum SectorClassification {
    Zeroed,        // entropy < 0.1
    LowEntropy,    // entropy 0.1 - 3.0 (text, logs, sparse data)
    MediumEntropy, // entropy 3.0 - 6.5 (executables, structured data)
    HighEntropy,   // entropy 6.5 - 7.8 (compressed, multimedia)
    MaxEntropy,    // entropy 7.8 - 8.0 (encrypted or random)
}

#[derive(Debug, Clone, Serialize)]
pub struct SectorEntropy {
    pub offset: u64,
    pub entropy: f64,
    pub classification: SectorClassification,
}

#[derive(Debug, Clone, Serialize)]
pub struct EntropyMap {
    pub sector_size: usize,
    pub total_sectors: usize,
    pub sectors: Vec<SectorEntropy>,
    pub summary: EntropySummary,
}

#[derive(Debug, Clone, Serialize)]
pub struct EntropySummary {
    pub avg_entropy: f64,
    pub min_entropy: f64,
    pub max_entropy: f64,
    pub zeroed_pct: f64,
    pub low_pct: f64,
    pub medium_pct: f64,
    pub high_pct: f64,
    pub max_entropy_pct: f64,
    pub is_fully_sanitized: bool,
    pub residual_data_sectors: usize,
}


pub fn shannon_entropy(data: &[u8]) -> f64 {
    if data.is_empty() {
        return 0.0;
    }
    let mut counts = [0usize; 256];
    for &byte in data {
        counts[byte as usize] += 1;
    }

    let len = data.len() as f64;
    let mut entropy = 0.0;

    for &count in &counts {
        if count > 0 {
            let p = count as f64 / len;
            entropy -= p * p.log2();
        }
    }

    entropy
}

pub fn classify_sector(entropy: f64) -> SectorClassification {
    if entropy < 0.1 {
        SectorClassification::Zeroed
    } else if entropy < 3.0 {
        SectorClassification::LowEntropy
    } else if entropy < 6.5 {
        SectorClassification::MediumEntropy
    } else if entropy < 7.8 {
        SectorClassification::HighEntropy
    } else {
        SectorClassification::MaxEntropy
    }
}

pub fn build_entropy_map(data: &[u8], sector_size: usize) -> EntropyMap {
    let mut sectors = Vec::new();

    if data.is_empty() {
        return EntropyMap {
            sector_size,
            total_sectors: 0,
            sectors: vec![],
            summary: EntropySummary {
                avg_entropy: 0.0,
                min_entropy: 0.0,
                max_entropy: 0.0,
                zeroed_pct: 0.0,
                low_pct: 0.0,
                medium_pct: 0.0,
                high_pct: 0.0,
                max_entropy_pct: 0.0,
                is_fully_sanitized: true,
                residual_data_sectors: 0,
            },
        };
    }

    let mut sum_entropy = 0.0;
    let mut min_entropy = f64::MAX;
    let mut max_entropy = f64::MIN;

    let mut zeroed_count = 0;
    let mut low_count = 0;
    let mut medium_count = 0;
    let mut high_count = 0;
    let mut max_count = 0;

    let mut residual_data_sectors = 0;

    for (i, chunk) in data.chunks(sector_size).enumerate() {
        let entropy = shannon_entropy(chunk);
        let classification = classify_sector(entropy);

        sum_entropy += entropy;
        if entropy < min_entropy {
            min_entropy = entropy;
        }
        if entropy > max_entropy {
            max_entropy = entropy;
        }

        match classification {
            SectorClassification::Zeroed => zeroed_count += 1,
            SectorClassification::LowEntropy => {
                low_count += 1;
                residual_data_sectors += 1;
            }
            SectorClassification::MediumEntropy => {
                medium_count += 1;
                residual_data_sectors += 1;
            }
            SectorClassification::HighEntropy => high_count += 1,
            SectorClassification::MaxEntropy => max_count += 1,
        }

        sectors.push(SectorEntropy {
            offset: (i * sector_size) as u64,
            entropy,
            classification,
        });
    }

    let total = sectors.len() as f64;
    let avg_entropy = sum_entropy / total;
    let zeroed_pct = (zeroed_count as f64 / total) * 100.0;
    let low_pct = (low_count as f64 / total) * 100.0;
    let medium_pct = (medium_count as f64 / total) * 100.0;
    let high_pct = (high_count as f64 / total) * 100.0;
    let max_entropy_pct = (max_count as f64 / total) * 100.0;

    let is_fully_sanitized = zeroed_pct > 99.9 || max_entropy_pct > 99.0;

    EntropyMap {
        sector_size,
        total_sectors: sectors.len(),
        sectors,
        summary: EntropySummary {
            avg_entropy,
            min_entropy,
            max_entropy,
            zeroed_pct,
            low_pct,
            medium_pct,
            high_pct,
            max_entropy_pct,
            is_fully_sanitized,
            residual_data_sectors,
        },
    }
}

pub fn verify_sanitization(map: &EntropyMap) -> bool {
    map.summary.is_fully_sanitized
}

pub fn format_entropy_report(map: &EntropyMap) -> String {
    let mut report = String::new();
    report.push_str("Entropy Distribution Report\n");
    report.push_str("===========================\n");
    report.push_str(&format!("Total Sectors: {}\n", map.total_sectors));
    report.push_str(&format!("Sector Size: {} bytes\n", map.sector_size));
    report.push_str(&format!(
        "Average Entropy: {:.2}\n",
        map.summary.avg_entropy
    ));
    report.push_str(&format!("Min Entropy: {:.2}\n", map.summary.min_entropy));
    report.push_str(&format!("Max Entropy: {:.2}\n\n", map.summary.max_entropy));

    report.push_str("Classification Percentages:\n");
    report.push_str(&format!("  Zeroed:       {:.2}%\n", map.summary.zeroed_pct));
    report.push_str(&format!("  Low:          {:.2}%\n", map.summary.low_pct));
    report.push_str(&format!("  Medium:       {:.2}%\n", map.summary.medium_pct));
    report.push_str(&format!("  High:         {:.2}%\n", map.summary.high_pct));
    report.push_str(&format!(
        "  Max:          {:.2}%\n",
        map.summary.max_entropy_pct
    ));

    report
}

pub fn find_anomalous_sectors(map: &EntropyMap) -> Vec<&SectorEntropy> {
    let mut anomalies = Vec::new();
    let is_zero_dominant = map.summary.zeroed_pct > 50.0;
    let is_max_dominant = map.summary.max_entropy_pct > 50.0;

    for sector in &map.sectors {
        if is_zero_dominant && sector.classification != SectorClassification::Zeroed {
            anomalies.push(sector);
        } else if is_max_dominant && sector.classification != SectorClassification::MaxEntropy {
            anomalies.push(sector);
        } else if !is_zero_dominant
            && !is_max_dominant
            && (sector.classification == SectorClassification::LowEntropy
                || sector.classification == SectorClassification::MediumEntropy)
        {
            anomalies.push(sector);
        }
    }

    anomalies
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_entropy_zeros() {
        let data = vec![0u8; 1024];
        let e = shannon_entropy(&data);
        assert!(e < 0.1);
    }

    #[test]
    fn test_entropy_random() {
        let data: Vec<u8> = (0..1024).map(|i| (i * 7 % 256) as u8).collect();
        let e = shannon_entropy(&data);
        assert!(e > 7.5);
    }

    #[test]
    fn test_entropy_text() {
        let text = b"This is some simple ASCII text. It has low entropy because it uses a limited character set.";
        let e = shannon_entropy(text);
        assert!(e > 3.0 && e < 5.0);
    }

    #[test]
    fn test_classification() {
        assert_eq!(classify_sector(0.0), SectorClassification::Zeroed);
        assert_eq!(classify_sector(2.0), SectorClassification::LowEntropy);
        assert_eq!(classify_sector(4.0), SectorClassification::MediumEntropy);
        assert_eq!(classify_sector(7.0), SectorClassification::HighEntropy);
        assert_eq!(classify_sector(7.9), SectorClassification::MaxEntropy);
    }

    #[test]
    fn test_build_entropy_map_and_verify() {
        let data = vec![0u8; 1024 * 10]; // 10 sectors of zeros
        let map = build_entropy_map(&data, 1024);
        assert_eq!(map.total_sectors, 10);
        assert!(verify_sanitization(&map));
        assert_eq!(map.summary.zeroed_pct, 100.0);
        assert!(find_anomalous_sectors(&map).is_empty());
    }

    #[test]
    fn test_anomalous_sectors() {
        let mut data = vec![0u8; 1024 * 10];
        // Make 1 sector non-zero
        for i in 0..1024 {
            data[i] = (i % 256) as u8;
        }
        let map = build_entropy_map(&data, 1024);
        let anomalies = find_anomalous_sectors(&map);
        assert_eq!(anomalies.len(), 1);
        assert_eq!(anomalies[0].offset, 0);
    }

    #[test]
    fn test_format_report() {
        let data = vec![0u8; 1024 * 10];
        let map = build_entropy_map(&data, 1024);
        let report = format_entropy_report(&map);
        assert!(report.contains("Total Sectors: 10"));
        assert!(report.contains("Zeroed:       100.00%"));
    }
}
