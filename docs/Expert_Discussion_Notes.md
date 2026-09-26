# 🎓 Expert Discussion Notes & Technical Mentorship Record

> **Project:** VOID VAULT (PS-26149)  
> **Session Topic:** Forensic Data Sanitization, Deep Carving Integrity, and BSA 2023 §63 Compliance  
> **Date:** September 2026 | **Location:** Department of Computer Science & Cybersecurity  
> **Participants:** Faculty Mentor / Subject Matter Expert & Team eMitra (PS ID: SIH26149)

---

## 📋 1. Meeting Agenda & Scope of Discussion
The mentorship session focused on four critical engineering and operational dimensions for the **NTRO Smart India Hackathon 2026** submission:
1. **Low-Level Storage Architecture:** Assessing write-caching, Flash Translation Layers (FTL), and wear-leveling risks on modern NVMe and SSD storage.
2. **Statutory Legal Compliance:** Transitioning from the legacy Indian Evidence Act (IEA §65B) to the newly enacted **Bharatiya Sakshya Adhiniyam (BSA) 2023 Section 63**.
3. **Forensic Carving Rigor:** Validating carving heuristics, cluster-gap reassembly (BGC), and confidence scoring.
4. **National Security & Societal Alignment:** Air-gapped defense readiness, Atmanirbhar Bharat self-reliance, and sustainable electronic hardware lifecycle management (UN SDGs 9, 12, and 16).

---

## 💡 2. Key Technical Findings & Guidance Received

### A. Solid-State Sanitization & Controller Boundaries
* **Faculty Observation:** Logical LBA overwrites (e.g., standard DoD 5220.22-M 3-pass) are insufficient for modern flash media because internal controller wear-leveling and over-provisioning reserve blocks remain untouched.
* **Engineering Recommendation:** 
  - Ensure the tool issues native **NVMe Sanitize (Block Erase / Crypto Erase)** commands directly to the drive controller ASIC via `IOCTL_STORAGE_MANAGE_DATA_SET_ATTRIBUTES` and firmware passthrough.
  - Implement firmware checks for Host Protected Areas (HPA) and Device Configuration Overlays (DCO) to prevent stealth data concealment.
* **Team eMitra Implementation:** Fully implemented in [`ps149/src/sanitize/nvme.rs`](../ps149/src/sanitize/nvme.rs) and [`ps149/src/forensic/hpa_dco.rs`](../ps149/src/forensic/hpa_dco.rs).

### B. Legal Admissibility under Bharatiya Sakshya Adhiniyam (BSA) 2023 §63
* **Faculty Observation:** Many student forensic tools generate generic PDFs that fail judicial scrutiny in Indian courts. With the replacement of IEA Section 65B on July 1, 2024, certificates must adhere strictly to the **Schedule under BSA Section 63(4)**.
* **Engineering Recommendation:**
  - Structure certificates into distinct Part A (Authorized Custodian) and Part B (Technical Forensic Examiner) sections.
  - Anchor certificates to an append-only cryptographic hash chain ($H_i = \text{SHA-256}(D_i \parallel H_{i-1})$) to prevent post-hoc tampering.
* **Team eMitra Implementation:** Automated in [`ps149/src/report/certificate.rs`](../ps149/src/report/certificate.rs) with 35 real certificates archived in [`audit_reports/`](../audit_reports/).

### C. Carving Heuristics & Confidence Calibration
* **Faculty Observation:** File carving cannot rely solely on magic bytes; fragmented files (especially JPEG and PDF) across fragmented NTFS volumes result in high false-positive rates.
* **Engineering Recommendation:**
  - Implement a structural validator (AST parsing) to verify internal chunk headers and end-of-file markers.
  - Formulate an empirical confidence score ($0.0 \le C \le 1.0$) combining signature match, structural validity, and entropy profiling.
* **Team eMitra Implementation:** Implemented in [`ps149/src/carver/fragment.rs`](../ps149/src/carver/fragment.rs) and [`ps149/src/carver/validators.rs`](../ps149/src/carver/validators.rs).

---

## 🌍 3. Societal, National & UN SDG Alignment

| UN Sustainable Development Goal | Project Alignment | Concrete Operational Impact |
| :--- | :--- | :--- |
| **SDG 16: Peace, Justice & Strong Institutions** | Rule of Law & Court Admissibility | Accelerates digital evidence discovery and ensures tamper-proof evidentiary custody under BSA 2023 §63, reducing criminal trial pendency. |
| **SDG 12: Responsible Consumption & Production** | Circular Economy in Government ITAD | Certified NIST SP 800-88 sanitization allows government and bank drives to be safely redeployed across departments instead of being shredded and dumped as toxic e-waste. |
| **SDG 9: Industry, Innovation & Infrastructure** | Sovereign Indigenous Cyber Capability | 100% pure Rust architecture eliminates reliance on expensive foreign commercial tools (saving ₹1.5 Cr per 10k drives), strengthening national technological self-reliance. |

---

## ✍️ Mentorship Verification
The guidance and recommendations recorded above have been fully incorporated into the production build of Void Vault for the SIH 2026 evaluation.
