# 👥 Team eMitra — Domain Research & Technical Background

> **Smart India Hackathon 2026 • Problem Statement ID: SIH26149**  
> **Organization: National Technical Research Organisation (NTRO)**  
> **Team ID: 146878 | Team Name: eMitra**

---

## 🏛️ 1. Background & Mission
Team eMitra was formed with a singular objective: **to engineer an indigenous, sovereign digital forensics and secure sanitization platform for Indian national security agencies, defense installations, and law enforcement.**

Recognizing that Indian defense entities currently spend crores annually on proprietary foreign licenses (Blancco, BitRaser, EnCase) that mandate internet connections and expose sensitive hardware telemetry, Team eMitra architected **Void Vault** from first principles in 100% memory-safe Rust.

---

## 🧠 2. Domain Research Pillars

### Pillar 1: Low-Level Storage Mechanics & Direct I/O
- Standard OS-level file operations (`write()`, `std::fs`) traverse the operating system cache manager and buffer pools. On Windows, file buffers are cached in RAM and flushed lazily, leaving residual data in system memory.
- Void Vault bypasses the OS file cache using raw Win32 Direct I/O flags: `FILE_FLAG_NO_BUFFERING` and `FILE_FLAG_WRITE_THROUGH`. All buffer allocations are sector-aligned (512e / 4Kn) to allow direct hardware DMA (Direct Memory Access).
- On Linux, the platform leverages asynchronous zero-copy `io_uring` ring buffers for maximum storage bus saturation.

### Pillar 2: Solid-State Anti-Forensics & NVMe Architecture
- Unlike magnetic hard disk drives where physical sectors map 1:1 to logical blocks (LBAs), modern Solid State Drives (SSDs) and NVMe media are managed by a Flash Translation Layer (FTL).
- Dynamic wear-leveling algorithms remap logical sectors to disparate physical NAND blocks. A software overwrite to LBA 0x1000 may write to a brand-new NAND page while leaving the old page in over-provisioned reserve space.
- Void Vault solves this by issuing native **NVMe Sanitize Block Erase** and **Crypto Erase** ASIC commands via low-level IOCTL passthroughs, commanding the onboard SSD controller to erase all NAND blocks and destroy media encryption keys.

### Pillar 3: Firmware-Level Hidden Storage (HPA & DCO)
- Host Protected Areas (HPA) and Device Configuration Overlays (DCO) allow drives to conceal sectors from the operating system.
- Malicious actors or sophisticated adversaries frequently configure HPA/DCO partitions to conceal exfiltrated data or stealth malware.
- Void Vault queries `IOCTL_ATA_PASS_THROUGH` and compares `native_max_sectors` against `reported_sectors` to detect, alert, and sanitize hidden firmware regions.

### Pillar 4: Advanced Bifragment Gap Carving (BGC)
- Traditional open-source carvers (PhotoRec, Scalpel) assume recovered files are contiguous on disk. On real-world NTFS and FAT32 filesystems, files larger than 64KB are frequently split across cluster boundaries with unrelated data in between.
- Void Vault implements **Bifragment Gap Carving (BGC)** in [`ps149/src/carver/fragment.rs`](../ps149/src/carver/fragment.rs), searching for valid headers and candidate footers, measuring candidate gap entropy, and reconstructing reassembled file structures with mathematical confidence scores.

### Pillar 5: Legal Evidence Admissibility (BSA 2023 §63)
- Under Section 63 of the Bharatiya Sakshya Adhiniyam, 2023, digital evidence must be certified by an authorized custodian and technical examiner.
- Void Vault outputs structured certificates compliant with the Schedule to BSA Section 63(4), binding operational hashes to an immutable append-only SHA-256 Merkle DAG ledger (`reports/audit_chain.json`).
