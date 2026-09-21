---
experiment_id: "E08"
title: "MIME & Fragment File Type Classification"
version: "1.0.0"
date: "2026-09-21"
status: "Draft"
author: "Team eMitra"
category: "Machine Learning / Heuristics"
safety_classification: "Host / VM Analysis"
---

# E08 Protocol — MIME & Fragment File Type Classification

## 1. Claim & Hypothesis
- **Claim:** Void Vault's 256-bin SIMD Byte Frequency Distribution (BFD) classifier reliably categorizes headerless raw disk fragments into 9 forensic classes (Document, Image, Audio, Video, Archive, Executable, Web, Database, Unknown).
- **Dataset:** GovDocs1 curated subset (1,800 files, 200 per class, deterministic 70/30 train/test split). Ground-truth labels validated via `libmagic`.

## 2. Methodology
1. Fragment evaluation:
   - Chunk all test files into fixed blocks of 512 Bytes (sector level) and 4096 Bytes (cluster level).
   - Strip all headers and footers to evaluate purely headerless payload classification.
2. Classification execution:
   - Run Void Vault 256-bin BFD vectorizer against each fragment.
   - Measure cosine similarity against pre-computed class centroids.
   - Run ablation study: evaluate classification accuracy with vs. without local LLM copilot heuristics.
3. Compute metrics:
   - Per-class Precision, Recall, and F1-Score.
   - Full 9x9 confusion matrix.

## 3. Pass Criteria
- Macro-averaged F1-Score $\ge 0.82$ across the 9 classes on 4096-Byte fragments.
- Honest ablation reporting: if local model provides no statistically significant gain over BFD cosine similarity, explicitly record that heuristic BFD alone is sufficient.
