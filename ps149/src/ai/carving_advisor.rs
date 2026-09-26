/// AI-Assisted Carving Classification
///
/// When the carving engine produces a low-confidence result (< 0.6),
/// this module sends a compact artifact profile to Groq LLaMA for
/// intelligent classification.
use crate::ai::groq::GroqClient;
use anyhow::Result;
use serde::Serialize;

#[derive(Debug, Clone, Serialize)]
pub struct CarvingClassification {
    pub likely_type: String,
    pub confidence_adjustment: f64,
    pub is_valid: bool,
    pub reasoning: String,
}

pub fn classify_ambiguous_artifact(
    groq: &GroqClient,
    file_data: &[u8],
    detected_type: &str,
    entropy: f64,
    size: u64,
) -> Result<CarvingClassification> {
    let head_len = file_data.len().min(64);
    let head_hex = hex::encode(&file_data[..head_len]);

    let tail_len = file_data.len().min(32);
    let tail_hex = hex::encode(&file_data[file_data.len() - tail_len..]);

    let prompt = format!(
        "Analyze carved file artifact:\nType: {}\nSize: {}\nEntropy: {:.3}\nHeader Hex: {}\nFooter Hex: {}\nIs this a valid file?",
        detected_type, size, entropy, head_hex, tail_hex
    );

    let system_prompt = "You are an expert digital forensics AI. Evaluate the file artifact details and decide if it is valid. Keep response brief.";

    match groq.chat(system_prompt, &prompt) {
        Ok(res) => {
            let is_valid =
                res.to_lowercase().contains("valid") && !res.to_lowercase().contains("invalid");
            Ok(CarvingClassification {
                likely_type: detected_type.to_string(),
                confidence_adjustment: if is_valid { 0.1 } else { -0.1 },
                is_valid,
                reasoning: res,
            })
        }
        Err(_) => Ok(CarvingClassification {
            likely_type: "unknown".to_string(),
            confidence_adjustment: 0.0,
            is_valid: false,
            reasoning: "API failure, defaulting to uncertain".to_string(),
        }),
    }
}
