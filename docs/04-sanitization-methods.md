---
title: "Sanitization Methods"
version: "1.0.0"
date: "2026-09-26"
status: "Production Ready"
ps_clauses: ["ps-drive-eraser"]
evidence: ["samples/erasure/"]
---

# Sanitization Methods

Void Vault implements sanitization methods strictly aligned with NIST SP 800-88 Rev. 2 and IEEE 2883-2022 guidelines. 

## Media, Interface, and Technique Matrix

| # | Standard | NIST Rev. 2 Level | IEEE 2883 Category | Passes | Media | Status | Notes |
|---|----------|------------------|-------------------|--------|-------|--------|-------|
| 1 | Write Zero | Clear | - | 1 | All | Implemented | Baseline logical overwrite |
| 2 | Random Data | Clear | - | 1 | All | Implemented | - |
| 3 | DoD 5220.22-M | Clear | Legacy | 3 | HDD | Implemented | Legacy; prefer Purge for SSD |
| 4 | DoD 5220.22-M (E) | Clear | Legacy | 7 | HDD | Implemented | Legacy |
| 5 | Gutmann | Clear | Legacy | 35 | HDD | Implemented | Historic; no modern advantage |
| 6 | RCMP TSSIT OPS-II | Clear | Legacy | 7 | HDD | Implemented | - |
| 7 | HMG IS5 Baseline | Clear | Legacy | 1 | All | Implemented | - |
| 8 | HMG IS5 Enhanced | Clear | Legacy | 3 | HDD | Implemented | - |
| 9 | VSITR | Clear | Legacy | 7 | HDD | Implemented | - |
| 10 | BSI/VSITR | Clear | Legacy | 7 | HDD | Implemented | - |
| 11 | GOST R 50739-95 | Clear | Legacy | 2 | HDD | Implemented | Russian standard |
| 12 | Schneier | Clear | Legacy | 7 | HDD | Implemented | - |
| 13 | Pfitzner | Clear | Legacy | 33 | HDD | Implemented | - |
| - | NVMe Sanitize (Block) | Purge | Purge | 1 | NVMe SSD | Implemented | Controller-level; includes reserves |
| - | NVMe Sanitize (Crypto) | Purge | Purge | 1 | NVMe SSD | Implemented | Destroys encryption key |
| - | ATA Secure Erase | Purge | Purge | 1 | SATA | Implemented | If not frozen |
| - | TRIM | Assist only | - | - | SSD | Implemented | NOT sanitization; supplements Purge |
| - | Quick Clear | NOT compliant | - | 0 | All | Implemented | Metadata only; no certificate |

## Special Operational Characteristics

### TRIM Commands
TRIM is implemented solely as an **assist only**, advisory hint to the solid-state storage controller. It explicitly is **not sanitization**. Because controller behavior in response to TRIM is proprietary and unpredictable across manufacturers, TRIM is only utilized to supplement a higher-level Purge or Clear command, ensuring maximum efficiency without relying on it for forensic security.

### Quick Clear
Quick Clear is a highly specialized, accelerated operation that performs a metadata-only fast wipe. **It is explicitly not standards-compliant and no certificate is issued for its use.** Its primary use case is pre-sale data removal, testing, or internal redeployment where certified, cryptographic erasure is unnecessary, but logical data structures must be swiftly neutralized.

### Frozen Drive Handling
Modern operating systems and BIOS setups frequently "freeze" block storage devices at boot to prevent malicious firmware-level modifications or accidental drive locks. Void Vault detects frozen drive states actively. If an ATA Secure Erase or NVMe Sanitize command is blocked by a frozen state, the platform falls back to a software-level Clear (e.g., standard multi-pass logical overwrite) and applies honest labeling in the resulting audit log and report.

### USB Bridge Limitations
When dealing with SATA or NVMe drives housed inside external USB enclosures, the USB-to-SATA/NVMe bridge controllers frequently swallow or block low-level passthrough commands (like `SECURITY ERASE UNIT`). Void Vault attempts SAT (SCSI ATA Translation) passthrough, but when blocked, gracefully alerts the operator and relies on Clear operations rather than Purge.

---
Independent SIH 2026 submission. Standards are referenced for alignment; no endorsement by NTRO, NIST, IEEE, CERT-In or STQC is implied.
