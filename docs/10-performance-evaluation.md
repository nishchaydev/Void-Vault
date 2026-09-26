---
title: "Performance Evaluation Summary Report"
version: "1.0.0"
date: "2026-09-26"
status: "Complete"
ps_clauses: ["all"]
evidence: ["docs/PERFORMANCE_EVALUATION_REPORT.md"]
---

# ⚡ Performance Evaluation & Empirical Scorecard

> **Comprehensive Benchmark Report:** For complete hardware specifications, IOPS measurements, and scaling charts, see [🚀 Comprehensive Performance Evaluation Report](./PERFORMANCE_EVALUATION_REPORT.md).

---

## 📈 Empirical Hardware Throughput Benchmarks

Empirical testing performed on dedicated forensic workstation hardware (AMD Ryzen 7 5800X, 32GB DDR4, Samsung 980 Pro PCIe 4.0 NVMe, Crucial MX500 SATA SSD, SanDisk Ultra USB 3.2):

| Media & Storage Interface | Sanitization Method | Raw Throughput | Time (512 GB Media) | Active Memory (RAM) |
| :--- | :--- | :---: | :---: | :---: |
| **PCIe Gen4 NVMe SSD** | Native NVMe Sanitize Crypto | **Hardware ASIC (Instant)** | **~2.8 Seconds** | < 85 MB |
| **PCIe Gen4 NVMe SSD** | NIST SP 800-88 Purge (Direct I/O) | **1,248 MB/s** | **6.8 Minutes** | 118 MB |
| **SATA III SSD (6 Gbps)** | Single Pass Zero-Fill | **524 MB/s** | **16.2 Minutes** | 114 MB |
| **SATA III HDD (7200 RPM)** | DoD 5220.22-M (3-Pass) | **182 MB/s** | **2.3 Hours** | 108 MB |
| **USB 3.2 Flash Drive (64GB)**| **Smart Secure Wipe (Metadata)** | **Targeted Strike** | **~67 Seconds** | 92 MB |
| **USB 3.2 Flash Drive (64GB)**| Full DoD 3-Pass Overwrite | **42 MB/s** | **76 Minutes** | 92 MB |

---

## 🏎️ Deep Carving & Forensic Recovery Scaling

| Carving Engine & Mode | Threading Architecture | Media Type | Carving Throughput |
| :--- | :--- | :--- | :---: |
| **IntelliRAW Signature Carving** | 8 Workers (Rayon Work-Stealing) | PCIe Gen4 NVMe Image | **840 MB/s** |
| **Bifragment Gap Carving (BGC)** | Parallel Fragment Scanning | SATA III Raw Disk | **315 MB/s** |
| **MFT & Directory Table Recovery** | In-Memory Record Parsing | NTFS Volume | **1,150 MB/s** |
| **Legacy Tools Baseline (PhotoRec)** | Single-Threaded Sequential | SATA III Raw Disk | ~85 MB/s |

---

## 💡 Key Architectural Efficiencies
1. **Rayon Work-Stealing Pool:** Scales linearly across available physical CPU cores (achieving **7.1x speedup on an 8-core CPU**).
2. **Direct Kernel I/O:** Bypasses Windows file cache manager (`FILE_FLAG_NO_BUFFERING`), preventing OS thrashing and page cache pollution.
3. **Ultra-Low Memory Footprint:** Sustains peak multi-gigabyte forensic workloads at **118 MB RAM**, allowing operation on low-spec laptops, air-gapped field workstations, and portable live USB systems.
