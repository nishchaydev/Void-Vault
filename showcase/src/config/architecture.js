/**
 * 07 — ARCHITECTURE: Inside Void Vault
 * System architecture layers, hardware pipeline, and technology stack.
 */

export const architectureConfig = {
  title: "Inside Void Vault",
  subtitle: "A low-level direct I/O pipeline in pure memory-safe Rust, designed for deterministic hardware control without third-party kernel drivers.",
  
  diagramUrl: "/voidvault-architecture.svg",

  layers: [
    {
      step: "01",
      layer: "Storage Media & Physical Interconnects",
      title: "Physical Storage Layer",
      description: "Direct block-level communication with NVMe Gen4, SATA SSD, legacy HDD, USB 3.2, SD/microSD cards, and raw forensic disk images (.raw, .dd, .img).",
      tags: ["NVMe PCIe", "SATA", "USB 3.2", "Raw Disk Images"]
    },
    {
      step: "02",
      layer: "Hardware Safety & Discovery Interlock",
      title: "Device Discovery & Safety Layer",
      description: "Asynchronous WMI physical disk enumeration with mandatory 3-tier interlock: auto-detects host OS boot drive (PhysicalDrive0), locks it behind UI warning badges, and enforces typed safety confirmations.",
      tags: ["Win32 WMI", "PhysicalDrive Lock", "Privilege Gate (UAC)", "Zero Kernel Drivers"]
    },
    {
      step: "03",
      layer: "Core Engine & Low-Level Pipeline",
      title: "Direct I/O Hardware Engine",
      description: "Bypasses the Windows dirty-page cache using unbuffered CreateFileW with FILE_FLAG_NO_BUFFERING and FILE_FLAG_WRITE_THROUGH. Double-buffered Crossbeam channels decouple sector generation from physical writing.",
      tags: ["Unbuffered Direct I/O", "Crossbeam Ring Buffers", "Rayon Concurrency", "Sector Alignment"]
    },
    {
      step: "04",
      layer: "Dual Domain Operations",
      title: "Forensic Recovery & Sanitization Core",
      description: "Module 1 executes 17 wiping standards + hardware NVMe Sanitize Crypto Erase and DSM TRIM. Module 2 shreds files with ADS purge and 5-pass MFT obfuscation. Module 3 deep carves fragmented files via BGC and SIMD BFD classifiers.",
      tags: ["17 Sanitization Standards", "Bifragment Gap Carving", "ADS Purge", "256-Bin SIMD BFD"]
    },
    {
      step: "05",
      layer: "Adversarial Closed-Loop Proof",
      title: "Verification Layer",
      description: "Immediately carves wiped sectors post-erasure to prove 0 residual artifacts. Hardware-accelerated xxHash3-128 verifies physical block fills at 28.5 GB/s with Shannon entropy monitoring (>7.95/8.00).",
      tags: ["xxHash3-128 (28.5 GB/s)", "Shannon Entropy Check", "Adversarial Carving", "0 Residual Files"]
    },
    {
      step: "06",
      layer: "Immutable Chain of Custody",
      title: "Cryptographic Audit Ledger",
      description: "Append-only SHA-256 sequential hash chaining where each entry encapsulates the previous digest (H_i = SHA256(D_i || H_i-1)). A bottom-up Merkle tree root seals the ledger for instant offline SPV tamper detection.",
      tags: ["SHA-256 Hash Chain", "Bottom-Up Merkle Root", "Local SPV Proof", "SCIF Air-Gap Ready"]
    },
    {
      step: "07",
      layer: "Legal Admissibility",
      title: "Statutory Certificates & Evidence",
      description: "Automated generation of electronic evidence certificates compliant with Section 63 of Bharatiya Sakshya Adhiniyam, 2023 (BSA 2023, repealing IEA 65B) and ISO/IEC 27037:2012 evidentiary manifests.",
      tags: ["BSA 2023 Sec 63 Part A & B", "ISO/IEC 27037 Manifest", "SHA-256 Digests", "Court-Admissible"]
    }
  ],

  techStack: [
    { name: "Rust 2021", role: "Core Engine & Direct I/O", badge: "Memory Safe", icon: "Code2" },
    { name: "Tauri v2", role: "Lightweight Desktop Shell (<45MB RAM)", badge: "Desktop GUI", icon: "AppWindow" },
    { name: "React 19", role: "Modern Responsive Forensic Cockpit", badge: "Frontend", icon: "Layers" },
    { name: "Win32 / IOCTL", role: "Hardware Controller NVMe / TRIM Commands", badge: "Kernel FFI", icon: "Cpu" },
    { name: "SHA-256 / Merkle", role: "Append-Only Tamper-Evident Ledger", badge: "Cryptography", icon: "Lock" },
    { name: "SIMD Rayon", role: "256-Bin BFD Parallel Histogram Classifier", badge: "Acceleration", icon: "Zap" },
    { name: "Groq LLaMA 3.3", role: "AI Forensic Copilot (Offline Fallback)", badge: "Advisory AI", icon: "Sparkles" },
    { name: "Tailwind CSS v4", role: "CSS-Native Cyber-Forensic Design System", badge: "Styling", icon: "Palette" }
  ]
};
