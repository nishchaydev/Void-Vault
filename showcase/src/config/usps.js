/**
 * 04 — USPs: What makes Void Vault different?
 * Technical, evidence-based value propositions with concrete engineering rationale.
 */

export const usps = [
  {
    id: "device-aware",
    tag: "Hardware Controller Layer",
    title: "Device-Aware Sanitization",
    subtitle: "Different storage media require fundamentally different handling strategies.",
    description: "Traditional software overwriting fails silently on solid-state drives where the Flash Translation Layer (FTL) remaps blocks; up to 67% of data survives (Wei et al., USENIX FAST '11). Void Vault commands NVMe Sanitize Crypto Erase and ATA Secure Erase directly at the hardware controller level, backed by advisory DSM TRIM and SMART 0x05 reallocated-sector audits.",
    specs: [
      { label: "NVMe Command", val: "IOCTL_STORAGE_REINITIALIZE_MEDIA" },
      { label: "Flash TRIM", val: "DEVICE_DSM_ACTION_TRIM" },
      { label: "SMART Audit", val: "Attribute 0x05 (G-List Monitor)" }
    ],
    icon: "HardDrive"
  },
  {
    id: "advanced-recovery",
    tag: "Forensic Carving Engine",
    title: "Advanced File Recovery",
    subtitle: "Signature-based, structural, and statistical analysis for fragmented files.",
    description: "Standard carvers rely solely on contiguous sectors. Void Vault features Bifragment Gap Carving (BGC) to reassemble files split across non-contiguous clusters across arbitrary gaps. Combined with a 256-bin SIMD Byte Frequency Distribution (BFD) histogram classifier, it classifies and recovers headerless file blocks with structural AST validators (JPEG, PNG, PDF, ZIP).",
    specs: [
      { label: "Carving Modes", val: "Magic Byte + Structural AST + BGC" },
      { label: "SIMD Classifier", val: "256-Bin Byte Frequency Histogram" },
      { label: "Formats Supported", val: "20+ Standard File Signatures" }
    ],
    icon: "Search"
  },
  {
    id: "safety-first",
    tag: "3-Tier Host Protection",
    title: "Safety-First Operations",
    subtitle: "Device discovery, OS-drive protection, privilege validation, and explicit safeguards.",
    description: "A catastrophic failure in forensic tools is accidental selection of the investigator's host operating system drive. Void Vault enforces a strict 3-tier safety interlock: automated WMI boot volume detection, persistent visual lockout banners, and mandatory alphanumeric typed confirmation before any raw drive handle can be opened.",
    specs: [
      { label: "Boot Protection", val: "Automatic PhysicalDrive0 Hard-Lock" },
      { label: "Execution Model", val: "Zero Kernel Drivers / Pure Win32 FFI" },
      { label: "Integrity Guard", val: "Self-Hashing Binary + Anti-Tamper" }
    ],
    icon: "ShieldCheck"
  },
  {
    id: "independent-verification",
    tag: "Dual Closed-Loop",
    title: "Independent Verification",
    subtitle: "Don't simply claim data was erased — actively attempt to recover it.",
    description: "In digital forensic science, you cannot legally attest to data sanitization without an adversarial attempt to recover residual artifacts. Void Vault executes an immediate post-erasure carve across target sectors, paired with xxHash3-128 accelerated full readback (28.5 GB/s) and Shannon entropy verification (7.9998 / 8.0000) to mathematically prove non-recoverability.",
    specs: [
      { label: "Verification Speed", val: "28.5 GB/s via xxHash3-128 SIMD" },
      { label: "Residual Target", val: "0 Files Recoverable (0.00%)" },
      { label: "Noise Metric", val: "Shannon Entropy > 7.95 / 8.00" }
    ],
    icon: "CheckCircle2"
  },
  {
    id: "tamper-evident",
    tag: "Evidence Integrity",
    title: "Tamper-Evident Audit",
    subtitle: "SHA-256 / Merkle-based audit records provide cryptographically linked operation history.",
    description: "Air-gapped military SCIF rooms and forensic laboratories cannot rely on public internet blockchain check-ins. Void Vault embeds a local append-only SHA-256 sequential hash chain with a bottom-up Merkle root. Any unauthorized retroactive tampering with historical records mathematically breaks root recomputation, guaranteeing non-repudiation.",
    specs: [
      { label: "Legal Format", val: "BSA 2023 Section 63 (Part A & B)" },
      { label: "Cryptographic Anchor", val: "Local Bottom-Up Merkle Tree" },
      { label: "Standards Compliance", val: "ISO/IEC 27037:2012 Evidentiary Manifest" }
    ],
    icon: "Link2"
  },
  {
    id: "unified-workflow",
    tag: "All-in-One Architecture",
    title: "Unified Workflow",
    subtitle: "Recovery, sanitization, verification, and reporting consolidated in one platform.",
    description: "Replaces the error-prone juggling of 3 to 5 disjointed foreign utilities (DBAN, Blancco, Autopsy, PhotoRec). From raw device discovery through hardware sanitization, closed-loop carving, and court-admissible certificate generation, Void Vault executes as a single 100% memory-safe Rust binary with a modern lightweight cockpit.",
    specs: [
      { label: "Architecture", val: "Single Standalone Binary (<15 MB)" },
      { label: "Tool Consolidation", val: "Replaces 3-5 Disconnected Utilities" },
      { label: "Licensing Cost", val: "₹0 Sovereign / Zero Per-Drive Royalty" }
    ],
    icon: "Layers"
  }
];
