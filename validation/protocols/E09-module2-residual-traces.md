---
experiment_id: "E09"
title: "Module 2 Granular Shredder Anti-Forensic Residual Traces"
version: "1.0.0"
date: "2026-09-21"
status: "Draft"
author: "Team eMitra"
category: "Anti-Forensics"
safety_classification: "VM-Only"
---

# E09 Protocol — Module 2 Granular Shredder Anti-Forensic Residual Traces

## 1. Claim & Hypothesis
- **Claim:** Void Vault's 4-Phase File Shredder eliminates not only primary file data extents, but also Alternate Data Streams (ADS), cluster slack space, resident MFT records ($DATA inside 1024-byte record), and directory index entries ($I30).
- **Environment:** Dedicated NTFS volume on a virtual disk inside disposable VM.

## 2. Methodology & Inoculated Test Artifacts
1. Populate test volume with specific anti-forensic test cases:
   - File A: 200-byte tiny resident file (stored entirely inside MFT record).
   - File B: Large file (50 MB) with 3 Alternate Data Streams (`FileB:hidden.txt`, `FileB:secret.bin`).
   - File C: File with non-cluster-aligned size (e.g. 5,000 bytes on 4096-byte cluster), leaving 3,192 bytes of cluster slack containing planted strings.
   - File D: Deeply nested directory tree ($I30 B-tree index test).
   - Volume Shadow Copy (VSS snapshot created via `vssadmin create shadow /for=V:`).
2. Execute Void Vault 4-Phase Shredder targeting Files A, B, C, D:
   - Phase 1: NTFS metadata extraction and extent mapping.
   - Phase 2: ADS enumeration and cluster slack identification.
   - Phase 3: Direct I/O multi-pass overwrite of all extents and slack space.
   - Phase 4: MFT record attribute zeroing and USN journal flush.
3. Post-shred audit using independent third-party tools:
   - Sleuth Kit (`fls`, `icat`): verify MFT records report zeroed/reallocated state.
   - Raw disk hex pattern search: grep raw disk image for planted canary markers.
   - PhotoRec free-space scan: carve unallocated space.
   - VSS audit: verify shadow copies are evaluated (if live VSS exists, record whether shadow snapshot retains old copy).

## 3. Pass Criteria
- Zero planted canary strings found in data clusters, cluster slack, or MFT record structures.
- Honest limitation recorded: if Volume Shadow Copies exist, files cannot be purged from read-only VSS snapshots without deleting the snapshot (`vssadmin delete shadows`).
