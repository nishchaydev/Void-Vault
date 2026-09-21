---
title: "Technical Specification"
version: "0.1.0"
date: "2026-09-21"
build_of_record: "pending"
status: "Draft"
ps_clauses: ["ps-carver", "ps-file-eraser"]
evidence: ["docs/04-sanitization-methods.md"]
---

# Technical Specification

## Module 1: Secure Drive Eraser
Module 1 operates using highly privileged, low-level system APIs to ensure data is irretrievably overwritten at the physical medium level, strictly aligned with NIST SP 800-88 Rev. 2.
- **Supported Standards (17 total):** NIST Purge, NIST Clear, DoD 5220.22-M 3-pass, DoD 7-pass, Gutmann 35-pass, RCMP TSSIT OPS-II, HMG IS5 Baseline/Enhanced, VSITR, BSI/VSITR, Russian GOST R 50739-95, Schneier 7-pass, Pfitzner 33-pass, Random data, Write zero, ATA Secure Erase, NVMe Sanitize Block Erase, and NVMe Sanitize Crypto Erase.
- **I/O Operations:** Relies on Direct I/O via the Windows `CreateFileW` API utilizing `FILE_FLAG_NO_BUFFERING` and `FILE_FLAG_WRITE_THROUGH`. This strictly bypasses OS-level caching.
- **Memory Management:** Employs precise sector-aligned buffers to prevent I/O operational failure and maximize throughput. Includes granular, deterministic progress tracking.

## Module 2: Secure File & Folder Eraser
Module 2 is a surgical tool designed to shred targeted files while managing forensic residue across complex filesystems.
- **Phase 1:** NTFS MFT parsing and direct file record extraction.
- **Phase 2:** Comprehensive enumeration of Alternate Data Streams (ADS) via `NtQueryInformationFile` and slack space calculation utilizing the `$DATA` attribute.
- **Phase 3:** Multi-pass overwrite of exact physical file extents, followed by targeted journal cleanup and Update Sequence Number (USN) purging.
- **Phase 4:** Deep MFT entry zeroing and `$LogFile` cleanup to remove residual metadata pointers.
- **Special Operation - Quick Clear:** A unique operational mode that executes a fast, metadata-only wipe. *Note: Quick Clear is explicitly not standards-compliant, and no certificate is issued for this operation.*

## Module 3: Advanced File Carving and Recovery
Module 3 is the verification engine, designed to heavily scrutinize logical space using a trio of heuristic and mathematical models.
- **Signature Engine:** Standard magic byte matching supporting 20+ file types including JPEG, PNG, GIF, BMP, TIFF, PDF, DOCX, XLSX, PPTX, ZIP, RAR, 7Z, MP4, AVI, MP3, WAV, EXE, DLL, HTML, and TXT.
- **BGC Engine (Bi-Gram Cosine Similarity):** Evaluates bi-gram frequency vectors for statistical cosine similarity, specifically targeting fragment classification for files lacking headers/footers.
- **BFD Engine (Byte-Frequency Distribution):** Generates byte-frequency distribution histograms to identify file types based on entropy and structural signatures.
- **Classification Classes:** Data is rigorously sorted into 9 distinct classes: Document, Image, Audio, Video, Archive, Executable, Web, Database, and Unknown.
- **Confidence Scoring:** Outputs a probabilistic score ensuring reliable recovery analytics.
  - Formula: $C = w_s \times S + w_v \times V + w_b \times B$
  - Where $w_s=0.4$, $w_v=0.3$, $w_b=0.3$
  - $S$ = signature match score, $V$ = structural AST validation, $B$ = BFD cosine similarity.

## Hardware, OS, and Filesystem Matrix
- **Operating Systems:** Windows 10/11 (Implemented) | Linux (Planned).
- **Filesystems:** NTFS, FAT32, exFAT (Implemented) | ext4 (Planned).
- **Media / Interfaces:** NVMe, SATA, USB (Implemented) | SD/eMMC (Planned).

## Generative AI Posture
Void Vault includes an optional, tightly constrained Groq LLaMA 3.3 70B copilot module.
- **Default State:** Disabled by default.
- **Functionality:** When enabled, it strictly generates advisory narratives and plain-language summaries of technical reports for operators.
- **Evidence Integrity:** AI-generated content is *never* injected into hashed evidence, BSA certificates, or audit entries.
- **Sovereignty:** Designed to be seamlessly replaced with a local model (e.g., Ollama). A strictly sovereign build contains zero network calls.

## IPC (Inter-Process Communication)
Internal platform communications utilize a Localhost REST API bound to `127.0.0.1` on a dynamically assigned, random port. The Tauri command bridge facilitates GUI-to-backend operations. The system runs no external network listener of any kind.

---
Independent SIH 2026 submission. Standards are referenced for alignment; no endorsement by NTRO, NIST, IEEE, CERT-In or STQC is implied.
