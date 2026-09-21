---
title: "Project Brief"
version: "0.1.0"
date: "2026-09-21"
build_of_record: "pending"
status: "Draft"
ps_clauses: ["all"]
evidence: ["docs/01-ps-traceability.md"]
---

# Project Brief

## Problem Statement
Government agencies, NCIIPC entities, and forensic laboratories frequently require verified data destruction for decommissioned or repurposed storage media. The fundamental gap in the current ecosystem is that existing tools generally fall into two isolated categories: erasure-only utilities or recovery-only forensic suites. This segregation creates a significant verification gap. When a drive is wiped, agencies lack immediate, integrated proof that the wiping was effective against modern forensic recovery techniques. There is a pressing need for a unified solution capable of erasing the storage device and seamlessly validating that sanitization.

## The Void Vault Approach
Void Vault is a comprehensive forensic data sanitization platform that bridges this gap using a closed-loop erase-carve-certify approach. The platform systematically wipes the targeted storage device or file, subsequently initiates an aggressive forensic carving operation on the sanitized logical space, and evaluates the output. If no recoverable data detected at the logical layer remains, the system issues a BSA s.63(4) Schedule-format certificate, sealing the entire workflow with a tamper-evident, signed hash chain to ensure subsequent integrity.

## Platform Capabilities (What's Built)
The core Void Vault platform is composed of three interconnected modules, driven by a robust Rust backend and a Tauri desktop dashboard.

- **Module 1 (M1): Secure Drive Eraser**
  Designed for full-disk sanitization, M1 is aligned with NIST SP 800-88 Rev. 2. It supports 17 global sanitization standards and directly interfaces with NVMe, ATA, and USB devices. It conducts multi-pass overwrites utilizing Direct I/O (Win32 unbuffered read/write) while aggressively detecting hidden regions such as Host Protected Areas (HPA) and Device Configuration Overlays (DCO), accompanied by SMART baseline analysis.
  
- **Module 2 (M2): Secure File & Folder Eraser**
  A targeted, 4-phase forensic file shredder pipeline that executes:
  1. NTFS metadata extraction.
  2. Alternate Data Stream (ADS) and slack space enumeration.
  3. Multi-pass overwrite of file data and associated metadata.
  4. MFT entry wiping, systematically handling anti-forensic residue.

- **Module 3 (M3): Advanced File Carving and Recovery**
  The verification engine built upon a 3-engine approach:
  - **Signature-based:** Traditional header/footer magic byte matching.
  - **Bi-gram Cosine Similarity (BGC):** For fragment classification.
  - **Byte-Frequency Distribution (BFD):** For robust file type identification.
  M3 categorizes fragments into 9 classification classes with a mathematically calibrated confidence scoring algorithm.

- **Audit Ledger & Dashboard**
  A centralized, append-only audit system securely records each operation using a cryptographic hash chain ($H_i = SHA-256(D_i || H_{i-1})$) and Merkle tree roots per session, ensuring the log is tamper-evident. The user interacts through a secure, localhost-driven Tauri desktop dashboard.

## Current Prototypes
- **BSA s.63(4) Certificate Generation:** The platform includes a working prototype capable of generating a BSA s.63(4) Schedule-format certificate. This provides a structured Part A (custodian) and Part B (technical examiner) layout aligned with the Bharatiya Sakshya Adhiniyam, 2023.

## Planned Features
- **Blockchain Anchoring:** Future integration with the MeitY National Blockchain Framework to permanently anchor session Merkle roots.
- **Linux Support:** Expanding the native execution environment beyond Windows.
- **Bootable USB Media:** A live OS environment to sanitize host storage natively without OS-level restrictions.

## Verification
Reviewers and operators can cryptographically verify system integrity:
1. Run `sha256sum` on generated operational samples.
2. Intentionally flip a single byte in the generated JSON audit chain to watch the Merkle root verification explicitly fail.
3. Inspect the architectural interactions mapped in the Mermaid diagrams within `diagrams/src/`.

---
Independent SIH 2026 submission. Standards are referenced for alignment; no endorsement by NTRO, NIST, IEEE, CERT-In or STQC is implied.
