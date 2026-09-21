# Void Vault — Validation Evidence Hub (Part C)

This directory contains the **reproducible experimental evidence, verification protocols, and sanitized outputs** for **Void Vault**, supporting all claims presented to the Smart India Hackathon 2026 evaluation panel (PS SIH26149 / NTRO).

## Traceability & Reproducibility Matrix

| ID | Experiment Title | Category | Controls | Status | Summary JSON |
|:---|:---|:---|:---:|:---:|:---|
| **E01** | Closed-Loop Carve-Back Verification | Sanitization | PASS / PASS | Certified | [`results/E01/summary.json`](./results/E01/summary.json) |
| **E02** | NIST CFTT Media Prep Alignment | Standards | PASS / PASS | Certified | [`results/E02/summary.json`](./results/E02/summary.json) |
| **E03** | Independent Carving Benchmark | Forensic Recovery | PASS / PASS | Certified | [`results/E03/summary.json`](./results/E03/summary.json) |
| **E04** | Ledger Tamper Resistance Matrix | Cryptography | PASS / PASS | Certified (7/7) | [`results/E04/summary.json`](./results/E04/summary.json) |
| **E05** | Real Storage Devices Hardware Runbook | Hardware | N/A / N/A | Human Runbook | [`results/E05/summary.json`](./results/E05/summary.json) |
| **E06** | System Performance & Resource Consumption | Performance | PASS / PASS | Certified | [`results/E06/summary.json`](./results/E06/summary.json) |
| **E07** | Classifier Confidence Calibration (ECE) | AI / Heuristics | PASS / PASS | Certified | [`results/E07/summary.json`](./results/E07/summary.json) |
| **E08** | File Type Classification Matrix | AI / Heuristics | PASS / PASS | Certified | [`results/E08/summary.json`](./results/E08/summary.json) |
| **E09** | Module 2 NTFS Slack & ADS Purge | Anti-Forensics | PASS / PASS | Certified | [`results/E09/summary.json`](./results/E09/summary.json) |
| **E10** | Supply Chain & Fault-Tolerance Audit | Security / CI | PASS / PASS | Certified | [`results/E10/summary.json`](./results/E10/summary.json) |
| **E11** | Usability & Operator Error Prevention | Usability | N/A / N/A | Human Runbook | [`results/E11/summary.json`](./results/E11/summary.json) |
| **E12** | External Forensic Auditor Verification Pack | Compliance | N/A / N/A | External Pack | [`results/E12/summary.json`](./results/E12/summary.json) |

## Protocol Documents

Detailed methodology, pre-conditions, adversary models, and pass criteria are documented in [`protocols/`](./protocols/):

- [`E01-closed-loop-carve-back.md`](./protocols/E01-closed-loop-carve-back.md)
- [`E02-nist-public-test-plans.md`](./protocols/E02-nist-public-test-plans.md)
- [`E03-carving-benchmark.md`](./protocols/E03-carving-benchmark.md)
- [`E04-ledger-tamper-matrix.md`](./protocols/E04-ledger-tamper-matrix.md)
- [`E05-real-devices-runbook.md`](./protocols/E05-real-devices-runbook.md)
- [`E06-performance-evaluation.md`](./protocols/E06-performance-evaluation.md)
- [`E07-confidence-calibration.md`](./protocols/E07-confidence-calibration.md)
- [`E08-classification-evaluation.md`](./protocols/E08-classification-evaluation.md)
- [`E09-module2-residual-traces.md`](./protocols/E09-module2-residual-traces.md)
- [`E10-robustness-supply-chain.md`](./protocols/E10-robustness-supply-chain.md)
- [`E11-usability-evaluation.md`](./protocols/E11-usability-evaluation.md)
- [`E12-external-review-pack.md`](./protocols/E12-external-review-pack.md)

## Schema Verification

All summaries conform to the official [`summary.schema.json`](../schemas/summary.schema.json) specification.
