---
experiment_id: "E02"
title: "NIST CFTT Forensic Media Preparation Alignment"
version: "1.0.0"
date: "2026-09-21"
status: "Draft"
author: "Team eMitra"
category: "Standards"
safety_classification: "VM-Only"
---

# E02 Protocol — NIST Public Test Plans Alignment

## 1. Claim & Hypothesis
- **Claim:** Void Vault's disk sanitization behaviors map directly to NIST CFTT Forensic Media Preparation Test Plan requirements for unallocated/allocated block overwriting.
- **Disclaimer:** Self-run against public NIST test cases; NOT certified, reviewed, or published by NIST CFTT.

## 2. Test Cases Mapping (NIST Media Preparation v2.0)
| Test ID | Objective | Virtual Disk Feasibility | Expected Result |
|---------|-----------|--------------------------|-----------------|
| FMP-01 | Overwrite full addressable space with uniform pattern (0x00) | Executable | PASS: All addressable LBAs contain 0x00. |
| FMP-02 | Overwrite full addressable space with pseudorandom pattern | Executable | PASS: Shannon entropy $\ge 7.99$ across all sectors. |
| FMP-03 | Overwrite multi-pass pattern (DoD 5220.22-M 3-pass) | Executable | PASS: Final pass complement verified. |
| FMP-04 | Verify handling of Host Protected Area (HPA) | N/A (Virtual Disk) | N/A: Virtual controller lacks ATA SET MAX ADDRESS. |
| FMP-05 | Verify handling of Device Configuration Overlay (DCO) | N/A (Virtual Disk) | N/A: Virtual controller lacks DCO support. |
| FMP-06 | Verify boot disk lockout enforcement | Executable | PASS: Software refuses command targeting `C:\` / `PhysicalDrive0`. |
| FMP-07 | Interrupted sanitization state recovery | Executable | PASS: Process termination mid-wipe leaves target uncertified. |

## 3. Pass Criteria
- 100% of executable virtual disk scenarios pass.
- All non-executable hardware scenarios are formally documented as N/A with root cause.
