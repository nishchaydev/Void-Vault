use chrono::Utc;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Ieee2883Certificate {
    pub certificate_id: String,
    pub date: String,
    pub device_serial: String,
    pub device_model: String,
    pub device_capacity: String,
    pub media_type: String,
    pub sanitization_method: String,
    pub sanitization_level: Ieee2883Level,
    pub verification_result: VerificationStatus,
    pub verification_hash: String,
    pub operator_name: String,
    pub organization: String,
    pub notes: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Ieee2883Level {
    Clear,
    Purge,
    Destroy,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum VerificationStatus {
    Passed,
    Failed(String),
    NotPerformed,
}

pub fn generate_certificate_id() -> String {
    Uuid::new_v4().to_string()
}

pub fn create_certificate(
    device_serial: &str,
    device_model: &str,
    device_capacity: &str,
    media_type: &str,
    method: &str,
    level: Ieee2883Level,
    verification: VerificationStatus,
    hash: &str,
    operator: &str,
    org: &str,
) -> Ieee2883Certificate {
    Ieee2883Certificate {
        certificate_id: generate_certificate_id(),
        date: Utc::now().to_rfc3339(),
        device_serial: device_serial.to_string(),
        device_model: device_model.to_string(),
        device_capacity: device_capacity.to_string(),
        media_type: media_type.to_string(),
        sanitization_method: method.to_string(),
        sanitization_level: level,
        verification_result: verification,
        verification_hash: hash.to_string(),
        operator_name: operator.to_string(),
        organization: org.to_string(),
        notes: String::new(),
    }
}

pub fn format_certificate(cert: &Ieee2883Certificate) -> String {
    format!(
        "IEEE 2883-2022 SANITIZATION CERTIFICATE\n\
        ========================================\n\
        ID: {}\n\
        Date: {}\n\
        \n\
        DEVICE INFORMATION\n\
        Model: {}\n\
        Serial: {}\n\
        Capacity: {}\n\
        Media Type: {}\n\
        \n\
        SANITIZATION DETAILS\n\
        Method: {}\n\
        Level: {:?}\n\
        \n\
        VERIFICATION\n\
        Result: {:?}\n\
        Hash: {}\n\
        \n\
        OPERATOR\n\
        Name: {}\n\
        Organization: {}\n",
        cert.certificate_id,
        cert.date,
        cert.device_model,
        cert.device_serial,
        cert.device_capacity,
        cert.media_type,
        cert.sanitization_method,
        cert.sanitization_level,
        cert.verification_result,
        cert.verification_hash,
        cert.operator_name,
        cert.organization
    )
}

pub fn format_certificate_json(cert: &Ieee2883Certificate) -> String {
    serde_json::to_string_pretty(cert).unwrap_or_default()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_certificate_generation() {
        let cert = create_certificate(
            "SN123",
            "ModelX",
            "1TB",
            "SSD",
            "Cryptographic Erase",
            Ieee2883Level::Purge,
            VerificationStatus::Passed,
            "abc123hash",
            "Admin",
            "Acme Corp",
        );
        assert!(!cert.certificate_id.is_empty());

        let text = format_certificate(&cert);
        assert!(text.contains("SN123"));

        let json = format_certificate_json(&cert);
        assert!(json.contains("SN123"));
    }
}
