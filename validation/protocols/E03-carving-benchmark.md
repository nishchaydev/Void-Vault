---
experiment_id: "E03"
title: "Adversarial Carving Benchmark"
version: "1.0.0"
date: "2026-09-21"
status: "Draft"
author: "Team eMitra"
category: "Forensics"
safety_classification: "Host / VM Analysis (Read-Only Images)"
---

# E03 Protocol — Adversarial Carving Benchmark

## 1. Claim & Hypothesis
- **Claim:** Void Vault's Module 3 (combining header/footer signature detection, Bifragment Gap Carving (BGC), and structural AST validation) achieves superior precision and recall on fragmented files compared to classic signature-only carvers (Scalpel, Foremost) and competitive recall with PhotoRec.
- **Datasets:** DFRWS 2006 Challenge Image, DFRWS 2007 Carving Challenge, and synthetic Woodblock fragment scenarios.

## 2. Tools Under Evaluation
1. **Void Vault Module 3** (Signature + BGC + AST + BFD)
2. **PhotoRec v7.2** (Default settings)
3. **PhotoRec v7.2 (Paranoid Mode)** (`/expert /paranoid /search_unallocated`)
4. **Scalpel v2.0** (Standard configuration)
5. **Foremost v1.5.7** (Default configuration)

## 3. Metrics
- **Exact Match (Full Recovery):** Carved file SHA-256 equals planted ground-truth file SHA-256.
- **Partial Recovery:** Carved file header/body valid up to truncation point; Cosine similarity of byte frequency distribution $\ge 0.85$.
- **False Positive Rate:** Carved artifacts with invalid structural syntax or unaligned headers.
- **Throughput:** Processing rate in MB/s.
- **Peak RAM Consumption:** Maximum resident set size (RSS) in MB.

## 4. Pass Criteria
- Contiguous files: $\ge 95\%$ recall across all tested file types.
- Bifragment gap files (DFRWS 2007 scenarios): Void Vault BGC demonstrates higher precision than standard Scalpel/Foremost.
