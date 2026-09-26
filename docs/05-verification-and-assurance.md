---
title: "Verification & Assurance Architecture"
version: "1.0.0"
date: "2026-09-26"
status: "Production Ready"
ps_clauses: ["ps-drive-eraser", "ps-verification"]
evidence: ["ps149/src/verify/readback.rs", "ps149/src/verify/entropy.rs", "ps149/src/verify/entropy_map.rs", "ps149/src/verify/cftt.rs"]
---

# 🔍 Verification & Assurance Architecture

## Executive Overview
In digital forensics and data sanitization, an overwrite or wipe operation cannot simply be assumed to have succeeded. Firmware translation layers, disk write-caches, bad sector reallocation tables, and drive controllers can silently drop or buffer write commands. 

**Void Vault** implements a multi-layered, mathematically verifiable assurance framework that transitions verification from a simple binary pass/fail to an empirical, forensic-grade certainty.

---

## 🔬 Multi-Layered Verification Engine

```
Physical Storage Media (Post-Sanitization)
                 │
                 ├──► Layer 1: Full Readback & Hash Verification (100% LBA Sweep)
                 │    • Sector-by-sector pattern match
                 │    • xxHash3 SIMD stream hashing & SHA-256 digest
                 │
                 ├──► Layer 2: Shannon Entropy & Chi-Square Uniformity Mapping
                 │    • Computes H = -Σ p_i log2(p_i) per sector block
                 │    • 5-Level sector classification (Zeroed to Max Entropy)
                 │
                 ├──► Layer 3: Stratified Statistical Sampling (High-Capacity Media)
                 │    • Sample size formula: n = ln(1 - C) / ln(1 - p)
                 │    • 99.999% statistical confidence with minimal time overhead
                 │
                 └──► Layer 4: Self-Adversarial Deep Carving (The Ultimate Test)
                      • Attacking its own wiped media using the internal BGC carver
                      • Mathematical proof: Zero recoverable files/fragments = Verified Purge
```

---

## 1. Layer 1: Full Readback & Stream Hash Verification
* **Sector-Aligned Buffers:** Utilizes Win32 Direct I/O (`FILE_FLAG_NO_BUFFERING` and `FILE_FLAG_WRITE_THROUGH`) to read directly from physical disk sectors into 64KB page-aligned memory buffers, bypassing OS file cache.
* **SIMD Zero Checking:** Employs AVX2/SSE4 vector instructions to verify that wiped buffers match the expected fill pattern (e.g., `0x00` or PRNG sequence) at multi-gigabyte throughput.
* **Cryptographic Checksum:** Computes a full SHA-256 cryptographic digest of the post-erasure physical media and seals it into the audit certificate.

---

## 2. Layer 2: Empirical Shannon Entropy Heatmap
To verify cryptographic erasure (random pattern overwrite) or detect localized residual data, Void Vault implements real-time entropy profiling in [`ps149/src/verify/entropy_map.rs`](../ps149/src/verify/entropy_map.rs):

$$\text{Shannon Entropy: } H = -\sum_{i=0}^{255} p_i \log_2(p_i)$$

Where $p_i$ is the empirical probability of byte value $i$ in a given sector.

### 5-Level Sector Classification Matrix:
| Sector Classification | Shannon Entropy ($H$) | Chi-Square ($\chi^2$) | Forensic Significance |
| :--- | :---: | :---: | :--- |
| **Zeroed** | $< 0.10$ | Minimal | Cleanly zero-filled sectors (NIST Clear). |
| **Low Entropy** | $0.10 - 3.00$ | Moderate | Plaintext remnants, logs, or sparse file tables. |
| **Medium Entropy** | $3.00 - 6.50$ | Elevated | Executable binaries, uncompressed structures, or code. |
| **High Entropy** | $6.50 - 7.80$ | High | Compressed archives, multimedia, or packed payloads. |
| **Max Entropy** | $7.80 - 8.00$ | Uniform ($\approx 256$) | True cryptographic random overwrite (NIST Purge). |

Auditors receive a sector-by-sector heatmap identifying the exact LBA coordinates of any residual anomaly.

---

## 3. Layer 3: Stratified Statistical Sampling
For high-capacity media (e.g., 8TB - 16TB enterprise drives) where a 100% readback sweep would take several hours, Void Vault offers stratified random sampling based on rigorous probability theory:

$$n = \frac{\ln(1 - C)}{\ln(1 - p)}$$

- $C$ = Required statistical confidence level (e.g., $99.999\%$).
- $p$ = Defect probability threshold (e.g., $0.01\%$).
- $n$ = Number of stratified random sectors sampled across head, body, and tail clusters.

This provides statistical certainty of sanitization compliance within seconds while avoiding unnecessary NAND wear.

---

## 4. Layer 4: Self-Adversarial Deep Carving Proof
The ultimate differentiator of Void Vault is its **self-adversarial closed loop**:
- The platform executes its own **Bifragment Gap Carving (BGC)** engine and 20+ signature parsers directly on the wiped logical space.
- If even a single orphaned file header, footer, or cluster chain is recovered, the sanitization status is immediately invalidated and reported.
- A **BSA 2023 Section 63 Certificate** is issued only when both the mathematical entropy check and the adversarial carving sweep return zero residual artifacts.

---

## 🔗 Related Standards & Files
- [Module 4: Post-Sanitization Verification Spec](./modules/MODULE_4_VERIFICATION_AND_CFTT.md)
- [NIST CFTT Verification Harness Source Code](../ps149/src/verify/cftt.rs)
- [Validation & Testing Full Report](./VALIDATION_AND_TESTING.md)
