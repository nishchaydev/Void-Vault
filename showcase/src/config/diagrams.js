/**
 * 08 — DIAGRAMS LIBRARY: Authentic Technical Schematics
 * Dedicated vector diagram definitions for all 7 architectural subsystems.
 * STRICT POLICY: 100% genuine vector/SVG schematics. ZERO PPT slide images.
 */

export const diagramsList = [
  {
    id: "system-architecture",
    title: "System Architecture & Kernel FFI",
    category: "Core Engine",
    description: "Multi-tiered architecture spanning native GUI/CLI entry points, local loopback dispatcher, 3 core domain modules, and Win32 direct I/O kernel boundary.",
    thumbnail: "/voidvault-architecture.svg",
    fullImage: "/voidvault-architecture.svg",
    downloadUrl: "/voidvault-architecture.svg",
    type: "vector-svg",
    details: "Illustrates how the Tauri v2 GUI (React 19) and interactive CLI route commands through std::net::TcpListener (127.0.0.1:5001) into Module 1 (Sanitizer), Module 2 (Shredder), and Module 3 (Carver), enforcing strict administrative privilege separation before touching raw disk sectors."
  },
  {
    id: "closed-loop-flow",
    title: "Closed-Loop Forensic Verification Engine",
    category: "Verification Spine",
    description: "The mathematical proof cycle: Erase with 17 standards → Adversarially carve raw sectors → Issue tamper-evident BSA 2023 Sec 63 certificate.",
    thumbnail: "/diagrams/closed-loop-verification.svg",
    fullImage: "/diagrams/closed-loop-verification.svg",
    downloadUrl: "/diagrams/closed-loop-verification.svg",
    type: "vector-svg",
    details: "Demonstrates the scientific necessity of coupling data sanitization directly with deep adversarial carving. The carver acts as an automated forensic adversary, verifying 0 recoverable bytes and 7.9998 bits/byte residual Shannon entropy before issuing certification."
  },
  {
    id: "shredder-pipeline",
    title: "4-Phase Forensic File Shredder Pipeline",
    category: "Module 2 (Anti-Forensics)",
    description: "Neutralization of hidden Alternate Data Streams (ADS), cluster slack space, and Master File Table (MFT) chronological metadata records.",
    thumbnail: "/diagrams/shredder-pipeline.svg",
    fullImage: "/diagrams/shredder-pipeline.svg",
    downloadUrl: "/diagrams/shredder-pipeline.svg",
    type: "vector-svg",
    details: "Exposes why standard file deletion and naive overwriting fail: residual data survives in NTFS Alternate Data Streams, cluster slack padding, and $STANDARD_INFO timestamp records. Void Vault executes a 4-phase neutralization sequence bypassing OS dirty-page buffers."
  },
  {
    id: "battle-demo-flow",
    title: "60-Second Live Battle Demo Sequence",
    category: "Adversarial Testbed",
    description: "Step-by-step forensic showdown: OS Shift+Delete failure vs Smart Secure Wipe™ surgical neutralization in 67 seconds on NVMe media.",
    thumbnail: "/diagrams/battle-demo-flow.svg",
    fullImage: "/diagrams/battle-demo-flow.svg",
    downloadUrl: "/diagrams/battle-demo-flow.svg",
    type: "vector-svg",
    details: "Chronicles the live judge evaluation flow: evidence injection → standard Shift+Delete → Carver 1 recovers 100% of target files → Smart Wipe executes in 67s → Carver 2 scans unallocated space and finds 0 files (0 bytes) → BSA 2023 Section 63 certificate generated."
  },
  {
    id: "batched-carver",
    title: "Batched-Read Carver Architecture",
    category: "Module 3 (Forensics)",
    description: "4MB unbuffered direct I/O streaming, RAM Zero-Skip SIMD engine, 20+ signature matching, and Bifragment Gap Carving (BGC).",
    thumbnail: "/diagrams/batched-carver.svg",
    fullImage: "/diagrams/batched-carver.svg",
    downloadUrl: "/diagrams/batched-carver.svg",
    type: "vector-svg",
    details: "Details the performance engineering powering Void Vault's carver: 1,248 MB/s sustained throughput on PCIe 4.0 NVMe, 28.5 GB/s memory zero-skipping via 64-bit word comparisons, reverse linear footer boundaries, and Rust AST image parser validation."
  },
  {
    id: "hardware-interlock",
    title: "3-Tier Hardware Safety Interlock",
    category: "Safety & Integrity",
    description: "Fail-safe host protection preventing accidental sanitization of forensic workstation boot drives across 11 storage device classes.",
    thumbnail: "/diagrams/hardware-interlock.svg",
    fullImage: "/diagrams/hardware-interlock.svg",
    downloadUrl: "/diagrams/hardware-interlock.svg",
    type: "vector-svg",
    details: "Breaks down the 3 safety tiers: (1) Kernel WMI and Win32 geometry parsing tagging host OS partitions as non-writable, (2) UI lockout banners with state mutexes disabling erase triggers, and (3) Mandatory alphanumeric confirmation matching physical drive serial numbers."
  },
  {
    id: "castle-defense",
    title: "Castle Shield Defense-in-Depth Model",
    category: "Government Hardening",
    description: "Air-gapped and MATE attack resistance: micro-sandboxing, code-in-dongle hardware root of trust, intrinsic SRAM PUF, and White-Box cryptography.",
    thumbnail: "/diagrams/castle-defense.svg",
    fullImage: "/diagrams/castle-defense.svg",
    downloadUrl: "/diagrams/castle-defense.svg",
    type: "vector-svg",
    details: "Synthesizes literature from 800+ academic papers across 24 research dossiers into a 6-layer defense model: outer cryptographic code signing (The Moat), AppContainer isolation (The Wall), hardware tokens (The Gates), RASP guards (The Patrol), White-Box VM (The Vault), and Merkle audit chains (The Ledger)."
  }
];
