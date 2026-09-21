---
experiment_id: "E10"
title: "Robustness, Fault-Tolerance & Supply Chain Security"
version: "1.0.0"
date: "2026-09-21"
status: "Draft"
author: "Team eMitra"
category: "Security"
safety_classification: "Host / VM Analysis"
---

# E10 Protocol — Robustness, Fault-Tolerance & Supply Chain Security

## 1. Claim & Hypothesis
- **Claim:** The Void Vault codebase is free from known CVE supply chain vulnerabilities, adheres to memory-safety standards, generates a verifiable CycloneDX SBOM, and gracefully handles fault injection (mid-wipe process termination, device dismount, boot-drive lockout).

## 2. Supply Chain Audit Methodology
1. **Dependency Vulnerability Scan:**
   - Execute `cargo audit` against RustSec Advisory Database.
   - Requirement: 0 unmitigated high/critical advisories.
2. **License & Dependency Policy Verification:**
   - Execute `cargo deny check advisories bans licenses sources`.
   - Requirement: All crates comply with permissive or dual-license requirements.
3. **Unsafe Code Audit:**
   - Execute `cargo geiger` to quantify unsafe blocks in workspace crates.
   - Requirement: Unsafe blocks restricted strictly to Win32 FFI (`CreateFileW`, `DeviceIoControl`).
4. **Software Bill of Materials (SBOM):**
   - Execute `cargo cyclonedx --format json` to generate CycloneDX v1.5 SBOM.

## 3. Fault-Injection Testing (Inside Disposable VM)
1. **Mid-Wipe Process Kill:**
   - Terminate `void-vault.exe` at 50% wipe progress via `taskkill /F`.
   - Verify: Audit ledger marks operation `INTERRUPTED`; no valid completion certificate is generated; drive remains marked dirty.
2. **Mid-Wipe Device Dismount:**
   - Forcefully detach virtual disk during active I/O.
   - Verify: Tool detects I/O error (`ERROR_DEVICE_NOT_CONNECTED`), logs error record with SHA-256 chain integrity maintained, and cleanly terminates.
3. **Boot-Drive Lockout Interlock:**
   - Attempt to execute sanitize command targeting host drive (`PhysicalDrive0` / `C:\`).
   - Verify: Hardware interlock hard-refuses execution; typed confirmation dialog rejects input; exit code 1.
