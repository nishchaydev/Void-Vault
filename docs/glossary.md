---
title: "Glossary"
version: "0.1.0"
date: "2026-09-21"
build_of_record: "pending"
status: "Draft"
ps_clauses: ["all"]
evidence: []
---

# Glossary

This glossary standardizes the terminology used across all Void Vault documentation, aligned with forensic industry norms.

- **Air-gapped:** A system physically isolated from unsecured networks, including the internet.
- **ATA Secure Erase:** A firmware-level command for SATA drives instructing the controller to wipe all user-accessible sectors.
- **BFD (Byte-Frequency Distribution):** An analytical engine measuring the statistical entropy and distribution of bytes within a file fragment to infer file type.
- **BGC (Bi-Gram Cosine Similarity):** A machine-learning heuristic that evaluates fragments by comparing adjacent byte-pair frequencies against known statistical models.
- **BSA 2023:** Bharatiya Sakshya Adhiniyam, 2023, modernizing rules for electronic evidence admissibility.
- **Clear:** A sanitization logical overwrite operation designed to protect against robust keyboard recovery attacks.
- **Closed-Loop:** The workflow of sanitizing a drive (Erase), immediately checking it (Carve), and sealing the result (Certify).
- **Direct I/O:** Bypassing the operating system's file caching (e.g., via `FILE_FLAG_NO_BUFFERING`) to write directly to hardware blocks.
- **DCO (Device Configuration Overlay):** A hidden area on a storage drive that the host OS normally cannot access or view.
- **Destroy:** Physical destruction of the media (e.g., shredding, incineration), not applicable to Void Vault software.
- **HPA (Host Protected Area):** A designated region on a hard drive reserved by the BIOS/manufacturer, potentially hiding data.
- **IEEE 2883:** The IEEE standard providing guidelines for sanitizing logical and physical storage.
- **Ledger:** The append-only JSON-based log securing operational integrity.
- **Merkle Tree:** A cryptographic tree where every node is labeled with the cryptographic hash of the labels of its child nodes.
- **MFT (Master File Table):** The central index used by the NTFS filesystem to manage file locations and metadata.
- **NIST SP 800-88 Rev. 2:** The U.S. government's primary framework and guidelines for media sanitization.
- **NVMe Sanitize:** A controller-level block or cryptographic erase standard for non-volatile memory express solid-state drives.
- **Over-provisioning:** Extra flash memory space kept hidden by the SSD controller to manage wear-leveling and write amplification.
- **Purge:** Sanitization applying physical or cryptographic techniques that render target data recovery infeasible using state-of-the-art laboratory techniques.
- **Quick Clear (metadata only; not standards-compliant; no certificate):** A rapid, non-certified logical wiping of file system pointers without full sector overwrites.
- **Slack Space:** The residual physical space between the logical end of a file and the end of the data cluster housing it.
- **Tauri:** A framework for building desktop applications utilizing web frontends and a Rust backend.
- **TRIM:** An assist command that tells an SSD which data blocks are no longer in use; it is strictly an assist, not sanitization.
- **USN Journal:** The Update Sequence Number journal, a feature of NTFS that maintains a log of file changes.
- **Wear-leveling:** An algorithm utilized by flash controllers to distribute P/E (Program/Erase) cycles evenly across memory blocks, obscuring direct logical-to-physical block mapping.

---
Independent SIH 2026 submission. Standards are referenced for alignment; no endorsement by NTRO, NIST, IEEE, CERT-In or STQC is implied.
