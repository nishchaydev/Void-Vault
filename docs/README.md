# 🏛️ VOID VAULT (PS-26149) — Documentation & Deliverables Hub

> **National Technical Research Organisation (NTRO) • Smart India Hackathon 2026**  
> **Problem Statement ID: SIH26149**  
> **Theme: Blockchain & Cybersecurity | Category: Software**  
> **Team: eMitra**

---

Welcome to the official documentation repository for **VOID VAULT**, an integrated, sovereign digital forensics and data sanitization platform developed in pure Rust.

This folder contains all mandatory engineering, operational, and research deliverables specified under **NTRO Problem Statement 26149**.

---

## 📑 Core Deliverables Directory

| Deliverable # | Document Title | Description | Direct Link |
| :---: | :--- | :--- | :--- |
| **01** | **Technical Specification** | Low-level system topology, Rust core subsystems, Win32 direct I/O, IPC architecture, and memory-safety proofs. | [📖 View Technical Specification](./TECHNICAL_SPECIFICATION.md) |
| **02** | **Official User Manual** | End-to-end operation manual for both CLI and Tauri GUI, step-by-step investigator workflows, and safety overrides. | [📘 View User Manual](./USER_MANUAL.md) |
| **03** | **Validation & Testing Report** | 152/152 unit/integration test suites, NIST CFTT 13/13 scenarios, and 48-hour AddressSanitizer (ASan) memory audit. | [🧪 View Testing Report](./VALIDATION_AND_TESTING.md) |
| **04** | **Performance Evaluation Report** | Multi-threaded Rayon scaling (7.1x on 8 cores), double-buffered I/O bus saturation, and xxHash3 verification. | [⚡ View Performance Report](./PERFORMANCE_EVALUATION_REPORT.md) |
| **05** | **Research Report & Optimization** | Synthesis of state-of-the-art forensic research (FAST, IEEE, DFRWS), NVMe passthrough, and BFG algorithm. | [🔬 View Research Report](./RESEARCH_REPORT.md) |
| **06** | **50+ Research Papers Bibliography** | Curated catalog of 52 peer-reviewed academic papers with DOIs across sanitization, carving, file systems, and law. | [📚 View 52 Papers Bibliography](./RESEARCH_PAPERS_BIBLIOGRAPHY.md) |

---

## 🗺️ Architectural Diagrams & Internals

For visual blueprints, state transition flows, and pipeline schematics, explore our dedicated diagrams package:

* **[Closed-Loop Verification Flow](./diagrams/closed-loop-flow.md):** Proves how the forensic carver validates hardware sanitization in real time.
* **[5-Phase Shredder Pipeline](./diagrams/shredder-pipeline.md):** Explains MFT `$FILE_NAME`, `$I30` slack space, and ADS stream cleansing.
* **[System Topology & Architecture](./diagrams/system-architecture.md):** Complete UI-to-controller modular breakdown.
* **[Battle Demo & Internals](./diagrams/battle-demo-and-internals.md):** Comprehensive technical review for hackathon juries.

---

## 📜 Regulatory Standards Compliance Matrix

All modules within Void Vault strictly adhere to Indian and international standards:

1. **Bharatiya Sakshya Adhiniyam (BSA) 2023 §63:** Automated cryptographic certificate generation for electronic court evidence admissibility.
2. **NIST SP 800-88 Rev. 1:** Media sanitization standards (Clear, Purge & Cryptographic Erase).
3. **IEEE Std 2883-2022:** Modern storage sanitization guidelines across solid-state and NVMe media.
4. **ISO/IEC 27037:2012:** Digital evidence identification, collection, acquisition, and chain-of-custody preservation.
5. **NIST CFTT:** Conformance to Computer Forensic Tool Testing sanitization scenarios.
6. **DoD 5220.22-M:** National Industrial Security Program Operating Manual multi-pass wiping specifications.

---

*Repository maintained by **Team eMitra** for Smart India Hackathon 2026.*  
*Main Source Code Repository: [github.com/nishchaydev/Void-Vault](https://github.com/nishchaydev/Void-Vault)*
