---
title: "User Manual & Operator Guide"
version: "1.0.0"
date: "2026-09-26"
status: "Complete"
ps_clauses: ["ps-usability"]
evidence: ["docs/USER_MANUAL.md"]
---

# 📖 Void Vault — Operator User Manual

> **Comprehensive Field Manual:** For the complete 58KB operator handbook including step-by-step GUI screenshots, CLI reference flags, and emergency recovery runbooks, refer to [📘 Comprehensive User & Field Manual](./USER_MANUAL.md).

---

## 🚀 Quick Start Guide

### Option 1: Native Desktop GUI (Tauri Workstation)
1. Launch `VoidVault.exe` with Administrator privileges (required for physical raw storage access).
2. The interactive 7-tab dashboard initializes:
   - **Dashboard:** Real-time system telemetry, active drives, and quick actions.
   - **Devices:** Physical media discovery, bus types (NVMe/SATA/USB), and HPA/DCO audit.
   - **Drive Erasure:** 17 standards, Smart Secure Wipe, and NVMe Sanitize commands.
   - **File Shredder:** Selective folder/file shredding with ADS, slack space, and MFT zeroing.
   - **Deep Recovery:** Signature, structure, and fragmented file carving with confidence scoring.
   - **Reports & Certificates:** Tamper-evident Merkle chain viewer and BSA 2023 §63 certificates.
   - **Settings:** Audit log configuration, safety overrides, and local AI copilot settings.

### Option 2: High-Throughput Terminal CLI (`ps149-cli.exe`)
Run from an elevated PowerShell or Command Prompt:

```powershell
# 1. Discover all connected storage media
.\ps149-cli.exe --list-devices

# 2. Execute Smart Secure Wipe on targeted flash drive (e.g., Disk 2)
.\ps149-cli.exe --erase --disk 2 --method smart-secure --confirm

# 3. Perform NIST SP 800-88 Purge with entropy verification
.\ps149-cli.exe --erase --disk 2 --method nist-purge --verify-entropy

# 4. Deep carve and recover deleted files from formatted volume D:
.\ps149-cli.exe --carve --volume D: --output C:\Evidence\Recovered --fragment-recovery

# 5. Generate legal BSA 2023 Section 63 Evidence Certificate
.\ps149-cli.exe --report --latest --format bsa-cert --out C:\Evidence\Certificate.json
```

---

## 🛡️ Safety Protocols & Host Protection
- **Disk 0 Boot Protection:** The host operating system drive is permanently locked. Any destructive command targeting Disk 0 is blocked. An administrative emergency unlock requires typing the exact physical device serial number.
- **Evidence Drive Integrity:** During all carving and recovery operations, the source media is mounted in strictly **read-only mode** with OS-level write blocking to prevent spoliation of forensic evidence.
