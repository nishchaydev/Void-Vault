/**
 * 11 — TEAM WORK PROGRESS: From research to prototype
 * Milestone progression showing the transition from initial forensic problem research to SIH 2026.
 */

export const timelineStages = [
  {
    step: "01",
    phase: "Problem Research",
    date: "July 2026",
    status: "Completed",
    title: "NTRO PS-26149 Triage Analysis",
    description: "Evaluated government and defense forensic bottlenecks: tool fragmentation (DBAN vs Autopsy), flash memory wear-leveling remanence, and Indian Evidence Act 65B obsolescence.",
    deliverables: "Problem definition document, threat model, and requirement matrix."
  },
  {
    step: "02",
    phase: "Literature Review",
    date: "August 2026",
    status: "Completed",
    title: "52 Peer-Reviewed Papers Survey",
    description: "Deep dive into Wei et al. (USENIX FAST '11), Garfinkel's BGC algorithm (DFRWS '07), Conti's BFD histograms (IEEE '10), and NIST SP 800-88 Rev. 1 sanitization standards.",
    deliverables: "Comprehensive 52-paper bibliography and algorithmic feasibility matrix."
  },
  {
    step: "03",
    phase: "Architecture Design",
    date: "Late August 2026",
    status: "Completed",
    title: "Zero-Driver Direct I/O Architecture",
    description: "Designed memory-safe Rust system pipeline utilizing Win32 unbuffered direct I/O, Crossbeam ring buffers, and local SHA-256 Merkle root chain without third-party kernel drivers.",
    deliverables: "System architecture SVG, REST endpoint specification, and data flow models."
  },
  {
    step: "04",
    phase: "Core Engine",
    date: "Early September 2026",
    status: "Completed",
    title: "Rust Core Implementation (ps149_core)",
    description: "Implemented Module 1 (17 sanitization algorithms + NVMe Sanitize), Module 2 (4-phase shredder + ADS wipe), and Module 3 (20+ format carver + BGC + SIMD BFD classifier).",
    deliverables: "15,000+ lines of pure Rust code and 18 REST dispatcher endpoints."
  },
  {
    step: "05",
    phase: "Prototype Development",
    date: "Mid September 2026",
    status: "Completed",
    title: "Desktop Workstation & CLI Cockpit",
    description: "Built the native Tauri v2 + React 19 forensic desktop interface with real-time sector telemetry, interactive drive geometry maps, and the standalone 7-option operator CLI.",
    deliverables: "Tauri v2 GUI (<45MB RAM footprint) and standalone ps149.exe executable."
  },
  {
    step: "06",
    phase: "Hardware Testing",
    date: "September 2026",
    status: "Completed",
    title: "Physical Media & Controller Benchmarks",
    description: "Benchmarked on physical WD SN740 Gen4 NVMe SSD (1,248 MB/s direct write) and physical SanDisk Cruzer Force 14.7GB USB drive with Smart Secure Wipe (67 seconds).",
    deliverables: "Physical hardware telemetry logs and IOCTL command verification."
  },
  {
    step: "07",
    phase: "Validation & QA",
    date: "September 2026",
    status: "Completed",
    title: "152/152 Tests & NIST CFTT Compliance",
    description: "Executed full test suite with 0 failures: 76 core domain tests + 76 binary integration tests, plus full validation across 13/13 NIST CFTT forensic scenarios.",
    deliverables: "100% green automated test build and empirical validation report."
  },
  {
    step: "08",
    phase: "SIH 2026 Grand Finale",
    date: "Present",
    status: "Active",
    title: "National Showcase for NTRO",
    description: "Presenting India's first sovereign, closed-loop forensic platform to the jury, featuring the live 60-second battle demo and BSA 2023 Section 63 certification.",
    deliverables: "Live demonstration, production release, and complete open-source documentation."
  }
];
