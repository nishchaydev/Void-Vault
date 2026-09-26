# 🛡️ NTRO Problem Statement 26149 — Full Analysis & Solution Architecture

> **National Technical Research Organisation (NTRO) • Smart India Hackathon 2026**  
> **Problem Statement ID: SIH26149**  
> **Theme: Blockchain & Cybersecurity | Category: Software**  
> **Team Name: eMitra | Platform: Void Vault**

---

## 📋 1. Official Problem Statement Overview

| Field | Official Value |
| :--- | :--- |
| **Problem Statement ID** | **26149** |
| **Problem Statement Title** | **Design and Development of an Integrated Secure Data Erasure and Advanced File Recovery Tool for Digital Forensics and Data Sanitization** |
| **Organization / Ministry** | **National Technical Research Organisation (NTRO)** |
| **Theme** | **Blockchain & Cybersecurity** |
| **Category** | **Software** |

### 📖 Official Background
> With the rapid growth of digital storage technologies, organizations, government agencies, law enforcement units, enterprises, and individual users face two major challenges: **securely destroying sensitive data** to prevent unauthorized recovery and **recovering deleted digital evidence** during forensic investigations.
> 
> Existing solutions generally focus on either secure data deletion or file recovery and often support limited storage technologies and file systems. This forces investigators and cybersecurity professionals to use multiple tools, increasing complexity, cost, and operational inefficiencies. Therefore, there is a need for a **unified platform** that integrates secure data sanitization with advanced forensic-grade file recovery and carving capabilities.

---

## 🎯 2. Core Requirements & Engineering Scope

The official problem statement mandates three foundational modules unified under an integrated platform:

### Module 1: Secure Drive Eraser
- **Hardware Sanitization:** Securely sanitize HDDs, SSDs, NVMe drives, USB drives, memory cards, and external storage devices.
- **Standards Conformance:** Implement international and government data destruction standards (NIST SP 800-88 Rev. 1, DoD 5220.22-M, IEEE Std 2883-2022).
- **Verification Mechanisms:** Full readback verification, statistical sampling, and Shannon entropy analysis.
- **Audit & Reporting:** Immutable audit logging and tamper-resistant cryptographic reporting.
- **Hidden Storage Areas:** Detection and sanitization of firmware-level Host Protected Areas (HPA) and Device Configuration Overlays (DCO).

### Module 2: Secure File & Folder Eraser
- **Targeted Deletion:** Surgical selective deletion of files and folders across multiple file systems (NTFS, FAT32, exFAT, ext4).
- **Metadata Cleansing:** Complete destruction of metadata traces, NTFS Master File Table (MFT) record numbers, Alternate Data Streams (ADS), and `$LogFile` / `$UsnJrnl` residue.
- **Cluster Slack Wiping:** Zeroing unallocated slack space within allocated clusters to prevent residual leakage.
- **Batch Processing & Automation:** High-throughput batch sanitization queues for high-volume evidence triage.

### Module 3: Advanced File Carving & Recovery
- **Metadata-Free Recovery:** Reconstruct and recover deleted or concealed files from formatted, damaged, or raw media without file system tables.
- **Signature & Structure Carving:** Magic byte header/footer matching combined with syntactic AST parsing for structural integrity.
- **Fragmented File Reconstruction:** Bifragment Gap Carving (BGC) engine to reassemble non-contiguous file segments separated by cluster gaps.
- **Automated Classification:** Statistical categorization of recovered files into semantic types (Documents, Images, Executables, Databases, Media).
- **Calibrated Confidence Scoring:** Assign probabilistic integrity scores (0.0 to 1.0) to every carved artifact.
- **Evidential Integrity:** Maintain strict read-only access and write blocking on evidence disks to preserve court admissibility.

---

## 🏛️ 3. The Void Vault Architectural Solution

Void Vault fulfills all mandated requirements in a single, memory-safe Rust binary:
1. **Dual-Capability Workflow:** Integrates sanitization defense and forensic recovery offense into a single cockpit.
2. **Self-Adversarial Closed-Loop:** Automatically turns its carving engine onto sanitized media to mathematically prove zero data reconstructibility.
3. **Court-Admissible Legal Certification:** Generates structured Bharatiya Sakshya Adhiniyam (BSA) 2023 Section 63 Schedule certificates sealed by an append-only SHA-256 Merkle hash chain.
4. **Air-Gapped Sovereignty:** 100% offline, zero external cloud dependencies, and zero per-drive recurring licensing royalties.
