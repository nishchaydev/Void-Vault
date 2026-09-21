---
experiment_id: "E07"
title: "Carving Confidence Score Calibration"
version: "1.0.0"
date: "2026-09-21"
status: "Draft"
author: "Team eMitra"
category: "Forensics"
safety_classification: "Host / VM Analysis"
---

# E07 Protocol — Carving Confidence Score Calibration

## 1. Claim & Hypothesis
- **Claim:** The confidence score $C \in [0.0, 1.0]$ emitted by Module 3 (derived from $C = 0.4 S + 0.3 V + 0.3 B$, where $S$ = signature match, $V$ = structural AST validation, and $B$ = byte frequency distribution cosine similarity) accurately correlates with the probability that a recovered artifact is byte-identical to the original file.
- **Dataset:** Held-out test set from GovDocs1 (never used in heuristic profile tuning).

## 2. Methodology
1. Carve held-out forensic dataset containing 500 contiguous, 300 bifragment, and 200 corrupted planted files.
2. Group all carved artifacts into 10 confidence deciles: $[0.0, 0.1), [0.1, 0.2), \dots, [0.9, 1.0]$.
3. For each decile bin $k$:
   - Record total sample count $n_k$. If $n_k < 20$, flag as statistically uncalibrated / low-confidence.
   - Compute observed accuracy $A_k = \frac{\text{Count}(\text{SHA256}_{\text{carved}} == \text{SHA256}_{\text{ground\_truth}})}{n_k}$.
   - Compute Brier calibration score: $\text{BS} = \frac{1}{N} \sum_{i=1}^N (C_i - y_i)^2$, where $y_i \in \{0, 1\}$.

## 3. Pass Criteria
- Monotonic increase in ground-truth match accuracy across confidence deciles $k \ge 5$.
- Brier calibration score $\text{BS} \le 0.15$.
