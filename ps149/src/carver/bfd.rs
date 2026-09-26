use std::fmt;

#[derive(Debug, Clone, PartialEq)]
pub enum DataClass {
    Jpeg,
    Png,
    Pdf,
    CompressedArchive,
    PlainText,
    Executable,
    Encrypted,
    Empty,
    Unknown,
}

impl fmt::Display for DataClass {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            DataClass::Jpeg => write!(f, "JPEG Image"),
            DataClass::Png => write!(f, "PNG Image"),
            DataClass::Pdf => write!(f, "PDF Document"),
            DataClass::CompressedArchive => write!(f, "Compressed Archive (ZIP/DOCX)"),
            DataClass::PlainText => write!(f, "Plain Text"),
            DataClass::Executable => write!(f, "Executable (PE/ELF)"),
            DataClass::Encrypted => write!(f, "Encrypted / Random Data"),
            DataClass::Empty => write!(f, "Empty (Zeros)"),
            DataClass::Unknown => write!(f, "Unknown"),
        }
    }
}

#[derive(Debug, Clone)]
pub struct BfdResult {
    pub class: DataClass,
    pub confidence: f64,
    pub entropy: f64,
}

/// Compute the Byte Frequency Distribution for a data block.
pub fn compute_bfd(data: &[u8]) -> [f64; 256] {
    let mut counts = [0usize; 256];
    for &byte in data {
        counts[byte as usize] += 1;
    }

    let mut bfd = [0.0; 256];
    if data.is_empty() {
        return bfd;
    }

    let len = data.len() as f64;
    for i in 0..256 {
        bfd[i] = counts[i] as f64 / len;
    }
    bfd
}

/// Compute Shannon entropy from a BFD.
pub fn entropy_from_bfd(bfd: &[f64; 256]) -> f64 {
    let mut entropy = 0.0;
    for &prob in bfd.iter() {
        if prob > 0.0 {
            entropy -= prob * prob.log2();
        }
    }
    entropy
}

/// Cosine similarity between two BFD vectors.
fn cosine_similarity(a: &[f64; 256], b: &[f64; 256]) -> f64 {
    let mut dot_product = 0.0;
    let mut norm_a = 0.0;
    let mut norm_b = 0.0;

    for i in 0..256 {
        dot_product += a[i] * b[i];
        norm_a += a[i] * a[i];
        norm_b += b[i] * b[i];
    }

    if norm_a == 0.0 || norm_b == 0.0 {
        return 0.0;
    }

    dot_product / (norm_a.sqrt() * norm_b.sqrt())
}

// Simple approximation of reference profiles
fn get_reference_profile(class: &DataClass) -> [f64; 256] {
    let mut bfd = [0.0; 256];
    match class {
        DataClass::Jpeg => {
            for i in 0..256 {
                bfd[i] = 1.0 / 256.0;
            }
            bfd[0x00] = 0.02;
            bfd[0xFF] = 0.02;
        }
        DataClass::Png => {
            for i in 0..256 {
                bfd[i] = 1.0 / 256.0;
            }
            bfd[0x00] = 0.03;
        }
        DataClass::Pdf => {
            for i in 32..127 {
                bfd[i] = 1.0 / 95.0;
            }
            for i in 0..256 {
                bfd[i] += 0.001;
            }
        }
        DataClass::CompressedArchive => {
            for i in 0..256 {
                bfd[i] = 1.0 / 256.0;
            }
        }
        DataClass::PlainText => {
            for i in 32..127 {
                bfd[i] = 1.0 / 95.0;
            }
            bfd[9] = 0.01;
            bfd[10] = 0.02;
            bfd[13] = 0.02;
        }
        DataClass::Executable => {
            for i in 0..256 {
                bfd[i] = 0.5 / 256.0;
            }
            bfd[0x00] = 0.3;
            bfd[0xFF] = 0.1;
        }
        DataClass::Encrypted => {
            for i in 0..256 {
                bfd[i] = 1.0 / 256.0;
            }
        }
        DataClass::Empty => {
            bfd[0] = 1.0;
        }
        DataClass::Unknown => {}
    }

    let sum: f64 = bfd.iter().sum();
    if sum > 0.0 {
        for i in 0..256 {
            bfd[i] /= sum;
        }
    }
    bfd
}

/// Classify a data block by comparing its BFD against reference profiles.
pub fn classify_block(data: &[u8]) -> BfdResult {
    let bfd = compute_bfd(data);
    let entropy = entropy_from_bfd(&bfd);

    if entropy == 0.0 && data.iter().all(|&b| b == 0) {
        return BfdResult {
            class: DataClass::Empty,
            confidence: 1.0,
            entropy,
        };
    }

    if entropy > 7.95 {
        return BfdResult {
            class: DataClass::Encrypted,
            confidence: 0.95,
            entropy,
        };
    }

    let classes = [
        DataClass::Jpeg,
        DataClass::Png,
        DataClass::Pdf,
        DataClass::CompressedArchive,
        DataClass::PlainText,
        DataClass::Executable,
    ];

    let mut best_class = DataClass::Unknown;
    let mut max_sim = 0.0;

    for class in classes {
        let ref_bfd = get_reference_profile(&class);
        let sim = cosine_similarity(&bfd, &ref_bfd);
        if sim > max_sim {
            max_sim = sim;
            best_class = class;
        }
    }

    if max_sim < 0.5 {
        best_class = match entropy {
            e if e < 4.5 => DataClass::PlainText,
            e if e < 6.5 => DataClass::Executable,
            e if e < 7.0 => DataClass::Pdf,
            _ => DataClass::Unknown,
        };
        max_sim = 0.5;
    }

    BfdResult {
        class: best_class,
        confidence: max_sim,
        entropy,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_compute_bfd() {
        let data = vec![0, 1, 1, 2, 2, 2, 3, 3, 3, 3];
        let bfd = compute_bfd(&data);
        assert_eq!(bfd[0], 0.1);
        assert_eq!(bfd[1], 0.2);
        assert_eq!(bfd[2], 0.3);
        assert_eq!(bfd[3], 0.4);
    }

    #[test]
    fn test_empty_zeros() {
        let data = vec![0; 100];
        let result = classify_block(&data);
        assert_eq!(result.class, DataClass::Empty);
        assert_eq!(result.entropy, 0.0);
    }

    #[test]
    fn test_encrypted() {
        let mut data = Vec::with_capacity(256 * 10);
        for _ in 0..10 {
            for i in 0..=255 {
                data.push(i as u8);
            }
        }
        let result = classify_block(&data);
        assert_eq!(result.class, DataClass::Encrypted);
    }
}
