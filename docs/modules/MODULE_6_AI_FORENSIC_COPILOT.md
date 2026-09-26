# Module 6: AI Forensic Copilot & Fragment Classifier
## Machine Learning-Assisted Data Classification, Entropy Profiling & Sanitization Optimization

---

## 1. Overview & Machine Learning Architecture
Module 6 (`ps149::ai`) provides automated machine learning intelligence to assist both sanitization (defense) and carving (offense).

In digital forensics, raw disk sectors frequently contain ambiguous fragments of data where headers and footers have been obliterated. In sanitization, selecting suboptimal buffer sizes or overwrite patterns for specific drive controllers drastically degrades throughput.

Module 6 resolves both bottlenecks through lightweight, zero-latency inference running in native Rust.

---

## 2. Byte Frequency Distribution (BFD) Centroid Classifier (`bfd.rs`)

### Concept & Feature Vector
Every computer file format exhibits a distinctive frequency distribution across the 256 possible byte values ($0\text{x}00$ through $0\text{xFF}$):
*   **Plaintext / Source Code / JSON:** Highly concentrated around ASCII printable ranges ($0\text{x}20$ to $0\text{x}7E$) with high frequencies of space, lowercase letters, and newlines.
*   **Compiled Executables (PE / ELF):** Bimodal distribution with spikes at $0\text{x}00$ (padding, alignment) and $0\text{x}CC$ (`INT 3` debug traps), alongside dispersed machine code opcodes.
*   **Compressed / Encrypted Media (JPEG, MP4, ZIP, AES):** Near-uniform distribution across all 256 byte bins with Shannon entropy $\approx 7.9$ bits/byte.
*   **Zero-Filled / Wiped Sectors:** 100% concentration at bin 0 ($0\text{x}00$).

### Centroid Distance Formula:
$$\text{Distance}(B, C_k) = \sum_{i=0}^{255} |B_i - C_{k,i}|$$

Where $B$ is the normalized 256-element byte histogram of the unknown sector block, and $C_k$ is the precomputed centroid vector for file category $k$.

---

## 3. Ambiguous Fragment Classification (`carving_advisor.rs`)

When the carver encounters an orphaned data cluster without a header:
1. Calculates 256-byte frequency histogram and Shannon entropy.
2. Evaluates Manhattan distance against known format centroids (JPEG, PNG, PDF, ZIP, Executable, Text).
3. If distance is below classification threshold, outputs category label and confidence score (e.g. `DataClass::Jpeg`, `confidence: 0.82`).
4. Supplies the prediction to Module 3 (BGC Engine) to select the appropriate reassembly validator.

---

## 4. Adaptive Buffer & Sanitization Advisor (`adaptive_buffer.rs`)

Flash memory controllers have distinct internal page and block boundaries (e.g., 4KB page, 512KB SLC cache block, 4MB erase block).
*   Writing with misaligned buffer sizes causes **write amplification** and degrades transfer speeds by up to 60%.
*   Module 6 queries drive hardware descriptors (rotational vs solid state, transfer bus USB 2.0 / USB 3.2 / SATA / NVMe PCIe).
*   Selects the optimal direct I/O chunk size:
    *   **USB 2.0 Flash:** 512 KB to 1 MB chunks (minimizes USB Bulk-Only Transport overhead).
    *   **USB 3.2 Gen 2 / UASP External SSD:** 4 MB chunks.
    *   **PCIe NVMe SSD:** 8 MB to 16 MB chunks aligned to controller stripe sizes.
