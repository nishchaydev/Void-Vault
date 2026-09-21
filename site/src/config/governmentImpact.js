/**
 * 13 — GOVERNMENT / NTRO IMPACT: Why Void Vault matters to Government
 * Serious, evidence-based public-sector and sovereign intelligence value analysis.
 * Phrases NTRO alignment strictly as "Potential applications" / "Designed for".
 */

export const governmentImpactConfig = {
  title: "Why Void Vault matters to Government",
  subtitle: "Sovereign cyber resilience, evidentiary rigor under BSA 2023, and public-sector IT asset protection built without foreign software dependencies.",

  // Critical NTRO Highlighted Box
  ntroHighlight: {
    badge: "Specialized Analysis: PS-26149",
    title: "Potential Relevance to NTRO (National Technical Research Organisation)",
    context: "Designed to directly address the operational imperatives outlined in Problem Statement PS-26149:",
    capabilities: [
      {
        title: "Sensitive Media Handling in Classified SCIFs",
        detail: "Provides fully air-gapped execution (<12MB standalone CLI) with zero network egress, eliminating external cloud dependency or telemetry leakage risks during classified media triage."
      },
      {
        title: "Verified Controller-Level Sanitization",
        detail: "Eliminates flash storage data remanence in wear-leveled NAND blocks using hardware NVMe Sanitize Crypto Erase and DSM TRIM, neutralizing hostile physical chip-off recovery."
      },
      {
        title: "Offensive Deep Artifact Extraction",
        detail: "Recovers fragmented, damaged, or intentionally deleted intelligence from seized adversary media through Bifragment Gap Carving and SIMD Byte Frequency Distribution analysis."
      },
      {
        title: "Tamper-Evident Chain of Custody",
        detail: "Embeds an append-only SHA-256 sequential Merkle ledger to prove that seized media has not been contaminated or altered during forensic extraction."
      },
      {
        title: "Consolidation of Fragmented Foreign Toolchains",
        detail: "Replaces reliance on 3 to 5 commercial foreign tools (e.g. Blancco, DBAN) with an auditable, sovereign Indian software platform."
      }
    ],
    disclaimer: "Note: Phrased strictly as potential sovereign applications aligned with Problem Statement PS-26149. Void Vault does not claim official adoption, endorsement, or deployment by NTRO."
  },

  // 5 Strategic Pillars
  pillars: [
    {
      id: "national-security",
      title: "National Security & Intelligence",
      subtitle: "Secure handling and sanitization of sensitive storage media.",
      description: "Decommissioned military and intelligence storage media must be purged beyond the reach of state-sponsored laboratory recovery techniques. Void Vault provides 17 defense-grade algorithms and hardware crypto-erase commands that ensure absolute data non-recoverability.",
      impactPoints: [
        "Neutralizes chip-off and raw controller bypass attacks",
        "Zero data survival across over-provisioned NAND flash pools",
        "Air-gapped operation in certified SCIF defense environments"
      ],
      icon: "ShieldAlert"
    },
    {
      id: "digital-forensics",
      title: "Digital Forensics & Law Enforcement",
      subtitle: "Recovery and analysis workflows for investigative cyber cells.",
      description: "State Police Cyber Cells and national investigative teams routinely encounter intentionally wiped, reformatted, or fragmented drives. Void Vault's BGC engine restores non-contiguous evidence that traditional file carvers miss.",
      impactPoints: [
        "82.4% measured recovery rate across fragmented files",
        "SIMD 256-bin classification of headerless artifacts",
        "Resilient I/O that bypasses hardware bad sectors without crashing"
      ],
      icon: "SearchCheck"
    },
    {
      id: "asset-disposal",
      title: "Government IT Asset Disposal (ITAD)",
      subtitle: "Verifiable sanitization before reuse, transfer, or disposal.",
      description: "Every year, government ministries and public sector undertakings (PSUs) retire thousands of laptops, servers, and drives. Without certifiable erasure, hardware is either physically shredded at massive cost or auctioned with residual data risk.",
      impactPoints: [
        "Enables safe public-sector hardware reuse, reducing e-waste",
        "Saves crores in recurring per-drive commercial licenses (₹4,000/drive)",
        "Instant post-erasure reformatting for immediate redeployment"
      ],
      icon: "Recycle"
    },
    {
      id: "critical-infrastructure",
      title: "Critical Infrastructure & PSU Protection",
      subtitle: "Secure handling of storage containing sensitive operational data.",
      description: "Power grids, financial banking cores, telecommunications switches, and defense networks require air-gapped maintenance utilities that do not introduce supply-chain vulnerabilities or malware trojans.",
      impactPoints: [
        "100% pure Rust binary with zero third-party kernel drivers",
        "Self-hashing startup integrity check prevents executable tampering",
        "Air-gapped micro-sandbox with zero network socket capabilities"
      ],
      icon: "Server"
    },
    {
      id: "evidence-integrity",
      title: "Evidence Integrity & Judicial Admissibility",
      subtitle: "Tamper-evident records supporting transparent forensic workflows.",
      description: "India's criminal justice modernization under the Bharatiya Sakshya Adhiniyam, 2023 mandates strict electronic evidence integrity. Void Vault automates Section 63 Part A (Custodian) and Part B (Examiner) certificates with cryptographic Merkle root proofs.",
      impactPoints: [
        "Direct statutory compliance with BSA 2023 Section 63",
        "ISO/IEC 27037:2012 JSON/CSV evidentiary case manifests",
        "Mathematically verifiable non-repudiation in courtrooms"
      ],
      icon: "Gavel"
    }
  ]
};
