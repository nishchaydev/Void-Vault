---
title: "Security Architecture & STRIDE Threat Model"
version: "1.0.0"
date: "2026-09-26"
status: "Production Ready"
ps_clauses: ["all"]
evidence: ["ps149/src/safety/confirmation.rs", "ps149/src/safety/ssd_guard.rs", "ps149/src/report/blockchain.rs"]
---

# 🛡️ Security Architecture & STRIDE Threat Model

## Executive Summary
Void Vault is engineered for high-threat national security environments (NTRO SCIFs, Armed Forces, Defense Laboratories, and State Cyber Crime Cells). In these deployments, the tool itself must be resilient against adversarial tampering, accidental operator error, insider threats, and supply-chain attacks.

---

## 🎯 1. STRIDE Threat Model & Defense Matrix

| Threat Category | Potential Attack Vector | Void Vault Architectural Defense | Code Reference |
| :--- | :--- | :--- | :--- |
| **Spoofing (Identity)** | Adversary claims an unverified technician wiped a drive or forged an examiner identity. | Two-person authorization gates; mandatory examiner identity tokens embedded into signed SHA-256 certificates. | `report/certificate.rs`<br>`safety/confirmation.rs` |
| **Tampering (Data)** | Attacker alters past audit logs to conceal evidence destruction or fake an erasure pass. | Append-only SHA-256 Merkle hash chain. Modifying one byte breaks all subsequent block hashes and Merkle roots. | `report/blockchain.rs` |
| **Repudiation** | Operator denies executing a destructive wipe or carving sensitive files. | Automated BSA 2023 Section 63 Schedule certificate capturing exact device serials, timestamps, and operator IDs. | `report/certificate.rs` |
| **Information Disclosure** | Residual classified data leaks through telemetry, crash dumps, or memory leaks. | **100% Air-Gapped:** Zero external network listeners, zero telemetry. Temporary sector buffers zeroed with `Zeroize` traits. | `sanitize/pass.rs`<br>`server.rs` |
| **Denial of Service** | Corrupted disk image triggers buffer overflow or infinite loop, crashing forensic workstation. | **100% Pure Rust:** Compile-time memory safety eliminates buffer overflows, use-after-free, and dangling pointers. | `ps149/src/lib.rs` |
| **Elevation of Privilege** | Malicious USB triggers kernel-level exploit via vulnerable custom device driver. | **Zero-Driver Architecture:** Runs entirely in user space utilizing standard, hardened Win32 and Linux kernel APIs. | `discovery/ioctl.rs` |

---

## 🛑 2. Host Operating System Safety Interlock (Disk 0 Lock)
*The most catastrophic hazard in low-level disk sanitization is the accidental destruction of the examiner's workstation operating system.*

Void Vault enforces a **3-Tier Hardware Safety Interlock**:
1. **WMI Boot Volume Identification:** System identifies the physical drive hosting `C:\Windows` and marks it with an immutable `PROTECTED` status flag.
2. **UI Safety Lockout:** In the GUI cockpit, the system boot drive is permanently greyed out with an active hazard badge, preventing accidental selection.
3. **Serial Number Confirmation:** If an elevated administrative override is attempted, the CLI and GUI mandate that the operator physically read and type the exact drive serial number and the word `ERASE` before raw I/O handle creation.

---

## 🔌 3. Air-Gap & Zero-Egress Enforcement
- **Localhost Loopback Only:** Internal communication between the Tauri desktop frontend and the core Rust dispatcher is strictly bound to `127.0.0.1` on an unexposed internal port.
- **Zero Cloud Dependencies:** The application contains zero network telemetry, analytics, or remote license checks. It operates with 100% fidelity in completely air-gapped SCIF environments.
- **Generative AI Isolation:** The optional forensic copilot (Groq LLaMA 3.3) is disabled by default. When enabled, it only receives sanitized metadata (sector counts and file types), never raw file contents or sensitive disk sectors.

---

## 🔗 Related Resources
- [Technical Specification](./TECHNICAL_SPECIFICATION.md)
- [Audit Ledger Architecture](./07-audit-ledger.md)
- [Validation & Testing Report](./VALIDATION_AND_TESTING.md)
