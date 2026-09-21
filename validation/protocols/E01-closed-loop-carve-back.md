---
experiment_id: "E01"
title: "Closed-Loop Carve-Back Verification"
version: "1.0.0"
date: "2026-09-21"
status: "Draft"
author: "Team eMitra"
category: "Verification"
safety_classification: "VM-Only (Virtual Disks Only)"
---

# E01 Protocol — Closed-Loop Carve-Back Verification

## 1. Claim & Hypothesis
- **Claim:** Void Vault executes data sanitization across all 17 supported overwrite standards such that no recoverable planted files remain at the logical layer, while independent tools (PhotoRec, Scalpel) confirm eradication.
- **Hypothesis:** Planted files on a freshly formatted virtual disk are recoverable before sanitization (positive control $\ge 90\%$). Following a full sanitization pass (e.g. NIST Clear 1-pass zero or DoD 3-pass), zero recoverable planted files are detected by Void Vault, PhotoRec, or Scalpel.
- **Scope Limitation:** Logical Layer Only. Controller-level flash remapping (FTL) on virtual disks is unobservable; hardware purge commands (NVMe Crypto Erase, ATA Secure Erase) will report `UNSUPPORTED_ON_VIRTUAL_DISK`.

## 2. Dataset & Environment
- **Dataset:** `synthetic-corpus-e01` (1,000 files, 10 MIME types, deterministic seed `146878`, 50 KB to 5 MB, unique SHA-256 canary embedded).
- **Environment:** Windows 11 VM on Hyper-V / VirtualBox. Attached secondary target: fixed-size 20 GB VHDX (`\\.\PhysicalDrive1`).

## 3. Controls
- **Positive Control:** Target disk written with 1,000 files $\rightarrow$ quick format $\rightarrow$ raw image carved. Must achieve $\ge 90\%$ recovery of planted files by at least one carver (PhotoRec, Scalpel, or Void Vault). If $<90\%$, test environment is invalid; halt run.
- **Negative Control:** Scan of an untouched, never-written 1 GB extent of the virtual disk. Must yield 0 artifacts.

## 4. Procedure
1. Create fixed 20 GB VHDX and mount inside VM as clean NTFS volume `V:`.
2. Execute `corpus_generator.py --seed 146878 --count 1000 --out V:\corpus`.
3. Generate manifest `synthetic_manifest.json` with SHA-256 hashes of all 1,000 files.
4. Unmount `V:`, execute Windows `format V: /Q /Y`.
5. Export un-sanitized raw disk image `pre_wipe.raw`.
6. Run positive control: carve `pre_wipe.raw` using PhotoRec, Scalpel, and Void Vault Module 3. Record baseline detection count.
7. For each sanitization method $M \in \{ \text{Write Zero, Random, DoD 5220.22-M, Gutmann, Quick Clear} \}$:
   a. Apply method $M$ targeting `\\.\PhysicalDrive1`.
   b. Export post-sanitization raw disk image `post_wipe_M.raw`.
   c. Carve `post_wipe_M.raw` using Void Vault, PhotoRec, and Scalpel.
   d. Compute full readback SHA-256 across all sectors.
8. For hardware purge commands (NVMe Sanitize, ATA Secure Erase):
   a. Issue command against virtual disk.
   b. Confirm expected response: command rejected with code `UNSUPPORTED_VIRTUAL_CONTROLLER`; verify tool refuses to issue a "Purge" certificate.

## 5. Metric Definitions
- **Planted File Recall (Pre-Wipe):** $R_{\text{pre}} = \frac{N_{\text{recovered}}}{1000}$
- **Planted File Survival (Post-Wipe):** $S_{\text{post}} = N_{\text{surviving files}}$ (must be exactly 0 for compliant methods).
- **Entropy Post-Wipe:** 8-bit Shannon entropy $H = -\sum_{i=0}^{255} p_i \log_2(p_i)$ per sector. Expected: $H = 0.0$ (zero fill) or $H \ge 7.99$ (random fill).

## 6. Pass Criteria
- Positive control passes ($R_{\text{pre}} \ge 0.90$).
- Negative control passes ($0$ artifacts in unwritten extent).
- For all compliant overwrite methods: $S_{\text{post}} = 0$ across all three carving tools.
- Quick Clear (metadata-only): retains recoverable payload data in data clusters; certificate generation is hard-blocked.
- Full readback sector hash matches expected mathematical pattern.

## 7. Expected N/A Cases & Disclosures
- NVMe Sanitize Crypto Erase and ATA Enhanced Secure Erase return `N/A: Hardware command unsupported on Hyper-V virtual disk controller`.
