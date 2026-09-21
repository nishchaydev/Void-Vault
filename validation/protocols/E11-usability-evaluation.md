---
experiment_id: "E11"
title: "Operator Usability & Task Success Evaluation (SUS)"
version: "1.0.0"
date: "2026-09-21"
status: "Draft"
author: "Team eMitra"
category: "Usability"
execution_type: "HUMAN-RUN ONLY"
safety_classification: "Safe: Non-Destructive Mock Testing"
---

# E11 Protocol — Operator Usability & Task Success Evaluation (HUMAN-RUN ONLY)

> **HUMAN OPERATOR NOTE:** This usability evaluation protocol is conducted with human participants (forensic examiners, system administrators, or defense evaluators).

## 1. Objective
Measure system usability using the standardized System Usability Scale (SUS) across three critical operator workflows.

## 2. Standardized Task Scripts
- **Task 1 (Target Drive Sanitization):**
  - Prompt: "A 500GB decommissioned drive is attached. Configure a NIST SP 800-88 Rev. 2 Clear wipe with 10% stratified sampling verification, and initiate the operation."
  - Target Time: $<90$ seconds.
- **Task 2 (Forensic Image Carving):**
  - Prompt: "A forensic disk image `evidence.raw` is mounted. Configure Module 3 to carve JPEG, PDF, and DOCX files with BGC enabled and export a summary report."
  - Target Time: $<60$ seconds.
- **Task 3 (Audit Verification & Certificate Export):**
  - Prompt: "Verify the cryptographic hash chain of the previous session and export the BSA 2023 Section 63 Schedule certificate."
  - Target Time: $<45$ seconds.

## 3. Standard 10-Item SUS Questionnaire
Participants rate each statement from 1 (Strongly Disagree) to 5 (Strongly Agree):
1. I think that I would like to use this system frequently.
2. I found the system unnecessarily complex.
3. I thought the system was easy to use.
4. I think that I would need the support of a technical person to be able to use this system.
5. I found the various functions in this system were well integrated.
6. I thought there was too much inconsistency in this system.
7. I would imagine that most people would learn to use this system very quickly.
8. I found the system very cumbersome to use.
9. I felt very confident using the system.
10. I needed to learn a lot of things before I could get going with this system.

## 4. Scoring Formula
$$\text{SUS Score} = 2.5 \times \left( \sum_{i \in \text{odd}} (R_i - 1) + \sum_{i \in \text{even}} (5 - R_i) \right)$$
Target: $\text{SUS} \ge 80.0$ (Grade A).
