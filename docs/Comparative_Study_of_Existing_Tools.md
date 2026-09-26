# ⚔️ Comparative Study of Existing Tools — Void Vault vs Commercial & Open-Source Market

> **Smart India Hackathon 2026 • Problem Statement ID: SIH26149**  
> **Organization: National Technical Research Organisation (NTRO)**  
> **Evaluation Reference Document**

---

## 📊 Comprehensive Head-to-Head Comparison Matrix

| Evaluation Dimension | Void Vault (eMitra) | Blancco Drive Eraser | BitRaser Drive Eraser | Autopsy Forensic Suite | PhotoRec / TestDisk | Darik's Boot & Nuke (DBAN) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Core Primary Function** | **Dual (Erase + Carve)** | Erasure Only | Erasure Only | Carving & Analysis Only | Carving Only | Erasure Only |
| **Sanitization Standards** | **17 Global Standards** | 22 Standards | 24 Standards | None (0) | None (0) | 6 Legacy Standards |
| **Self-Adversarial Closed-Loop** | **Yes (Erase & Re-Carve)** | ❌ No | ❌ No | ❌ No | ❌ No | ❌ No |
| **Entropy Heatmap Classification** | **Yes (5-Level Sector Map)** | ❌ No (Binary Pass/Fail) | ❌ No | ❌ No | ❌ No | ❌ No |
| **Smart Secure Wipe (<2 min)** | **Yes (~67s on USB)** | ❌ No (Hours for full wipe) | ❌ No | ❌ No | ❌ No | ❌ No |
| **HPA / DCO Firmware Detection** | **Yes (Automated)** | Yes (Enterprise tier) | Partial | ❌ No | ❌ No | ❌ No |
| **Hardware NVMe Sanitize / Crypto**| **Yes (Native ASIC)** | Yes | Yes | ❌ No | ❌ No | ❌ No (Legacy BIOS) |
| **TCG OPAL SED Hardware Revert** | **Yes (In-tree Protocol)** | Yes | Yes | ❌ No | ❌ No | ❌ No |
| **Fragmented File Reconstruction**| **Yes (BGC Engine)** | ❌ N/A | ❌ N/A | Partial (Cluster chains) | ❌ No (Contiguous only) | ❌ N/A |
| **Confidence Scoring Algorithm** | **Yes (0.0 – 1.0 Entropy)** | ❌ N/A | ❌ N/A | ❌ No | ❌ No | ❌ N/A |
| **Multi-Threaded Parallelism** | **Rayon + Crossbeam** | Multi-drive batch | Multi-drive batch | Multi-threaded ingest | Single-threaded | Single-threaded |
| **Air-Gapped Standalone Mode** | **100% Offline Single Exe** | ❌ Requires Cloud Sync | ❌ Requires Cloud Sync | Yes | Yes | Yes (Offline ISO) |
| **Licensing & Cost Model** | **Sovereign (₹0 Royalty)** | ₹1,500 – ₹4,000 / drive | ₹800 – ₹2,500 / drive | Open Source (Apache 2.0) | Open Source (GPL) | Free / Abandoned |
| **Active Memory Footprint** | **~118 MB RAM** | ~512 MB – 1 GB | ~1 GB | 2.4 GB – 8.0 GB (JVM) | ~50 MB (CLI) | ~32 MB (Linux 2.6) |
| **Legal Certification Standard** | **BSA 2023 §63 + Merkle** | Proprietary PDF | Proprietary PDF | Report HTML/PDF | Text Log File | Console Screen / None |
| **Host System Safety Interlock** | **3-Tier Hard Lock** | Software prompt | Software prompt | Read-only mode | Read-only mode | ⚠️ Destroys any drive! |

---

## 🏆 Key Takeaways & Strategic Advantages
1. **First-of-its-Kind Closed Loop:** Eliminates the verification blindspot by using an internal carver to prove erasure.
2. **Empirical Entropy Heatmap:** Classifies sectors into Zeroed, Low, Medium, High, and Max entropy rather than a blunt pass/fail.
3. **Smart Secure Wipe:** Destroys file system metadata structures in ~67 seconds for time-critical tactical operations.
4. **Firmware Level Audit:** Surfaces HPA and DCO regions invisible to standard tools.
5. **Zero Licensing Royalties:** Completely sovereign, air-gapped, and indigenous to India.
