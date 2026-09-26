use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Ord, PartialOrd, Eq, Serialize, Deserialize)]
pub enum SeverityLevel {
    Critical, // Encrypted, password-protected, steganography
    High,     // Documents, emails, databases, browser history
    Medium,   // Images, videos, office files
    Low,      // Text, logs, config
    Info,     // Unknown/unclassified
}

impl std::fmt::Display for SeverityLevel {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Critical => write!(f, "Critical"),
            Self::High => write!(f, "High"),
            Self::Medium => write!(f, "Medium"),
            Self::Low => write!(f, "Low"),
            Self::Info => write!(f, "Info"),
        }
    }
}

#[derive(Debug, Clone)]
pub struct ArtifactScore {
    pub severity: SeverityLevel,
    pub score: u32,
    pub reasons: Vec<String>,
    pub file_type: String,
    pub is_encrypted: bool,
    pub is_hidden: bool,
    pub has_metadata: bool,
}

pub fn score_artifact(filename: &str, extension: &str, entropy: f64, size: u64) -> ArtifactScore {
    let mut score = 0;
    let mut severity = SeverityLevel::Info;
    let mut reasons = Vec::new();
    let is_hidden = filename.starts_with(".");
    let mut is_encrypted = false;
    let ext_lower = extension.to_lowercase();

    if is_hidden {
        score += 20;
        reasons.push("Hidden file".to_string());
    }

    if entropy > 7.5
        && (ext_lower == "docx" || ext_lower == "xlsx" || ext_lower == "zip" || ext_lower == "pdf")
    {
        severity = SeverityLevel::Critical;
        is_encrypted = true;
        score += 80;
        reasons.push("High entropy known document type (likely encrypted)".to_string());
    } else if ext_lower == "db" || ext_lower == "sqlite" {
        if severity > SeverityLevel::High {
            severity = SeverityLevel::High;
        }
        score += 60;
        reasons.push("Database file".to_string());
    } else if filename.to_lowercase().contains("history")
        || filename.to_lowercase().contains("cookie")
    {
        if severity > SeverityLevel::High {
            severity = SeverityLevel::High;
        }
        score += 60;
        reasons.push("Browser artifact".to_string());
    } else if ext_lower == "jpg" || ext_lower == "png" {
        if severity > SeverityLevel::Medium {
            severity = SeverityLevel::Medium;
        }
        score += 40;
        reasons.push("Image file".to_string());
    } else if ext_lower == "txt" || ext_lower == "log" {
        if severity > SeverityLevel::Low {
            severity = SeverityLevel::Low;
        }
        score += 20;
        reasons.push("Text/log file".to_string());
    }

    if score > 100 {
        score = 100;
    }

    // Only allow severity bump if it's currently at Info and not yet identified, otherwise keep it
    if severity == SeverityLevel::Info && is_hidden {
        severity = SeverityLevel::Medium;
    }

    ArtifactScore {
        severity,
        score,
        reasons,
        file_type: ext_lower,
        is_encrypted,
        is_hidden,
        has_metadata: size > 0, // Simplified for this task
    }
}

pub fn prioritize_artifacts(artifacts: &mut [ArtifactScore]) {
    artifacts.sort_by(|a, b| a.severity.cmp(&b.severity).then(b.score.cmp(&a.score)));
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_score_artifact() {
        let art = score_artifact("test.docx", "docx", 7.8, 1024);
        assert_eq!(art.severity, SeverityLevel::Critical);
        assert!(art.is_encrypted);

        let art2 = score_artifact(".history", "db", 5.0, 1024);
        assert_eq!(art2.severity, SeverityLevel::High);
        assert!(art2.is_hidden);
    }

    #[test]
    fn test_prioritize() {
        let mut arts = vec![
            score_artifact("test.txt", "txt", 4.0, 1024),
            score_artifact("test.docx", "docx", 7.8, 1024),
            score_artifact("history.db", "db", 5.0, 1024),
        ];
        prioritize_artifacts(&mut arts);
        assert_eq!(arts[0].severity, SeverityLevel::Critical);
        assert_eq!(arts[1].severity, SeverityLevel::High);
        assert_eq!(arts[2].severity, SeverityLevel::Low);
    }
}
