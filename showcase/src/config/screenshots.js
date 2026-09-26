/**
 * 05 — PROTOTYPE SNAPSHOTS & RECOVERY WORKFLOW
 * Real software cockpit captures running as a native Tauri v2 desktop application on Windows 11.
 * ZERO PPT SLIDES.
 */

export const screenshotsList = [
  {
    id: "sanitization",
    tab: "Drive Sanitizer (Module 1)",
    title: "Module 1: Secure Drive Erasure",
    subtitle: "Hardware-level sanitization conforming to NIST SP 800-88 Rev. 1 & IEEE 2883-2022 standards.",
    image: "/screenshots/erasure.png",
    aspectRatio: "16/9",
    isRealAsset: true,
    highlights: [
      "17 global wiping algorithms (NIST Clear/Purge, DoD 5220.22-M, Gutmann 35-Pass)",
      "Native NVMe Sanitize Crypto Erase & Win32 DSM TRIM IOCTL execution",
      "Direct sector unbuffered streaming reaching 1,248 MB/s on Gen4 NVMe",
      "Automated post-wipe filesystem reinitialization (FAT32, exFAT, NTFS)"
    ],
    technicalMetadata: "Target: \\\\.\\PHYSICALDRIVE1 · Mode: Win32 Direct I/O · Verification: xxHash3 + SHA-256"
  },
  {
    id: "shredder",
    tab: "File Shredder (Module 2)",
    title: "Module 2: File & Folder Forensic Shredder",
    subtitle: "Selective deep data sanitization neutralizing NTFS Alternate Data Streams (ADS) & cluster slack.",
    image: "/screenshots/shredder.png",
    aspectRatio: "16/9",
    isRealAsset: true,
    highlights: [
      "4-phase pipeline: ADS stream discovery via FindFirstStreamW → Multi-pass overwrite",
      "Cluster slack space zeroing between logical EOF and sector boundary",
      "5-pass MFT obfuscation (AAAAAA.AAA → A) with epoch 1601 timestamp zeroing",
      "Volume-wide unallocated free space sanitization without touching active files"
    ],
    technicalMetadata: "Scope: Cluster Slack + NTFS Streams + MFT Record · Overwrite: DoD 5220.22-M 3-Pass"
  },
  {
    id: "discovery",
    tab: "Device Discovery & Safety",
    title: "Device Discovery & 3-Tier Safety Lock",
    subtitle: "Real-time WMI storage enumeration with host OS boot-disk protection.",
    image: "/screenshots/erasure.png",
    aspectRatio: "16/9",
    isRealAsset: true,
    highlights: [
      "Auto-detects physical disks, bus types (NVMe, SATA, USB), and partition layouts",
      "Persistent 3-Tier Safety Lock: Host OS boot drive (PhysicalDrive0) hard-locked",
      "SMART health telemetry and 0x05 Reallocated Sector Count monitoring",
      "Dynamic hot-plug listener detecting inserted and removed media in real-time"
    ],
    technicalMetadata: "Detection Engine: Win32_DiskDrive + IOCTL_STORAGE_QUERY_PROPERTY"
  },
  {
    id: "recovery",
    tab: "Deep Carver (Module 3)",
    title: "Module 3: Advanced Deep File Recovery Carver",
    subtitle: "Offensive carver scanning unallocated clusters with Bifragment Gap Carving (BGC).",
    image: "/diagrams/batched-carver.svg",
    aspectRatio: "16/9",
    isRealAsset: true,
    highlights: [
      "20+ file format magic byte signatures with reverse footer parsers",
      "Bifragment Gap Carving (BGC) reassembling non-contiguous split file fragments",
      "256-bin SIMD Byte Frequency Distribution (BFD) histogram classification",
      "Fault-tolerant bad sector handling: zero-pads 512-byte defect LBAs without crashing"
    ],
    technicalMetadata: "Carver Engine: 4MB Batched Direct Reads + RAM Zero-Skip + Rayon Multi-Threading"
  },
  {
    id: "verification",
    tab: "Closed-Loop Proof",
    title: "Closed-Loop Forensic Verification Engine",
    subtitle: "Adversarial verification proving zero residual files survived the operation.",
    image: "/diagrams/closed-loop-verification.svg",
    aspectRatio: "16/9",
    isRealAsset: true,
    highlights: [
      "Immediate post-wipe carver re-scan confirming exactly 0 files found (0.00%)",
      "xxHash3-128 SIMD readback throughput reaching 28.5 GB/s (1TB verified in 35s)",
      "Shannon entropy analysis verifying random fill indistinguishable from noise (7.9998 bits/B)",
      "NIST CFTT automated test harness passing 13 of 13 benchmark scenarios"
    ],
    technicalMetadata: "Entropy Target: 7.9998 / 8.0000 · Verification Throughput: 28,520 MB/s"
  },
  {
    id: "audit",
    tab: "Audit & BSA 2023",
    title: "Tamper-Evident Audit & BSA 2023 Certification",
    subtitle: "Append-only SHA-256 Merkle chain generating court-admissible electronic evidence.",
    image: "/diagrams/castle-defense.svg",
    aspectRatio: "16/9",
    isRealAsset: true,
    highlights: [
      "Section 63 Bharatiya Sakshya Adhiniyam, 2023 compliant certificates (Part A & B)",
      "Local append-only SHA-256 sequential hash chain with bottom-up Merkle root",
      "ISO/IEC 27037:2012 exportable evidentiary case manifests in JSON and CSV",
      "Instant offline SPV tamper detection without requiring external network connectivity"
    ],
    technicalMetadata: "Statutory Law: BSA 2023 Section 63 · Root Derivation: Bottom-Up SHA-256 Merkle Tree"
  }
];
