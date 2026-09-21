/**
 * 16 — PROJECT RESOURCES & REPOSITORY LINK TREE
 * Complete index of all source repositories, technical manuals, empirical benchmarks,
 * legal compliance frameworks, and presentation assets.
 */

export const resourcesGrid = [
  {
    id: "prototype",
    title: "Interactive Prototype",
    category: "Software Cockpit",
    description: "Explore the native desktop forensic workstation interface with real-time telemetry and 6-tab forensic modules.",
    cta: "Explore Prototype",
    href: "#prototype",
    icon: "Monitor",
    isPrimary: true
  },
  {
    id: "video",
    title: "Video Demonstration",
    category: "Live Workflow",
    description: "Watch the end-to-end 60-second live battle demo: Device Discovery → Wipe → Deep Carve Proof → BSA Certificate.",
    cta: "Watch Demo",
    href: "#demo",
    icon: "Play",
    isPrimary: true
  },
  {
    id: "github",
    title: "GitHub Repository",
    category: "Source Code",
    description: "Inspect the 100% memory-safe pure Rust codebase, test suites, Win32 direct I/O bindings, and commit history.",
    cta: "Explore Source",
    href: "https://github.com/nishchaydev/sih2026",
    icon: "Github",
    isExternal: true
  },
  {
    id: "research",
    title: "Research Papers (52 Papers)",
    category: "Scientific Literature",
    description: "Access the curated 52-paper bibliography across 5 pillars + 24 deep research dossiers (800+ surveyed papers).",
    cta: "Read Research",
    href: "#research",
    icon: "BookOpen"
  },
  {
    id: "technical-docs",
    title: "Technical Documentation",
    category: "Specifications & Manuals",
    description: "Read the 49KB technical specification document and 58KB field investigator user manual.",
    cta: "Read Technical Specs",
    href: "https://github.com/nishchaydev/sih2026/tree/main/docs",
    icon: "FileText",
    isExternal: true
  },
  {
    id: "architecture",
    title: "System Architecture",
    category: "Engineering Blueprint",
    description: "Examine the low-level direct I/O pipeline, double-buffered Crossbeam channels, and Rayon parallel thread pool.",
    cta: "Explore Architecture",
    href: "#architecture",
    icon: "Cpu"
  },
  {
    id: "diagrams",
    title: "Technical Diagrams (7 Schematics)",
    category: "Visual Schematics",
    description: "Browse the 7 dedicated engineering schematics covering data flow, BGC pipelines, and hardware safety locks.",
    cta: "Browse Diagrams",
    href: "#diagrams",
    icon: "Layers"
  },
  {
    id: "benchmarks",
    title: "Benchmark Report",
    category: "Empirical Scorecard",
    description: "Review physical hardware testing results on NVMe Gen4 (1,248 MB/s) and USB flash drives (67s Smart Wipe).",
    cta: "Inspect Benchmarks",
    href: "#benchmarks",
    icon: "BarChart3"
  },
  {
    id: "team",
    title: "Team eMitra",
    category: "Engineering Roster",
    description: "Meet the engineers, systems architects, forensic developers, and cryptographers behind Void Vault.",
    cta: "Meet the Team",
    href: "#team",
    icon: "Users"
  }
];

export const repoLinkTree = [
  {
    category: "Core Source Code",
    items: [
      { name: "Rust Core Engine (ps149/)", desc: "100% pure Rust CLI, Win32 FFI, unbuffered direct I/O, carver, shredder", url: "https://github.com/nishchaydev/sih2026/tree/main/ps149" },
      { name: "Native Tauri Desktop GUI (gui/)", desc: "Tauri v2 + React 19 + Tailwind v4 hardware workstation cockpit", url: "https://github.com/nishchaydev/sih2026/tree/main/gui" },
      { name: "Showcase Landing Portal (showcase/)", desc: "High-end React 19 + Tailwind v4 interactive jury showcase", url: "https://github.com/nishchaydev/sih2026/tree/main/showcase" },
      { name: "Docker Containerization", desc: "Dockerfile & docker-compose.yml for reproducible Linux cross-builds", url: "https://github.com/nishchaydev/sih2026/blob/main/Dockerfile" },
      { name: "Automated Setup Scripts", desc: "setup.ps1, launch.bat, and launch.sh for one-click environment bootstrap", url: "https://github.com/nishchaydev/sih2026/blob/main/setup.ps1" }
    ]
  },
  {
    category: "Technical Specifications & Manuals",
    items: [
      { name: "Technical Specification (49KB)", desc: "In-depth kernel architecture, Win32 IOCTL calls, and crypto primitives", url: "https://github.com/nishchaydev/sih2026/blob/main/docs/TECHNICAL_SPECIFICATION.md" },
      { name: "User & Field Manual (58KB)", desc: "Operational guide for forensic examiners, law enforcement, and military custodians", url: "https://github.com/nishchaydev/sih2026/blob/main/docs/USER_MANUAL.md" },
      { name: "Validation & Testing Report (47KB)", desc: "152/152 unit/integration tests passing + 13 NIST CFTT reference test cases", url: "https://github.com/nishchaydev/sih2026/blob/main/docs/VALIDATION_AND_TESTING.md" },
      { name: "Performance Evaluation Report (18KB)", desc: "Physical testbed results on PCIe 4.0 NVMe, SATA SSD, and USB 3.2 media", url: "https://github.com/nishchaydev/sih2026/blob/main/docs/PERFORMANCE_EVALUATION_REPORT.md" },
      { name: "SIH Presentation Guide (18KB)", desc: "Jury presentation script, talking points, defense Q&A, and live demo script", url: "https://github.com/nishchaydev/sih2026/blob/main/docs/SIH_PRESENTATION_GUIDE.md" }
    ]
  },
  {
    category: "Research Dossiers & Bibliography",
    items: [
      { name: "52-Paper Research Bibliography", desc: "Comprehensive academic survey across USENIX, IEEE, ACM, and DFRWS", url: "https://github.com/nishchaydev/sih2026/blob/main/RESEARCH_PAPERS_BIBLIOGRAPHY.md" },
      { name: "24 Anti-Piracy & MATE Dossiers", desc: "800+ surveyed papers on code obfuscation, RASP, hardware tokens, SRAM PUFs", url: "https://github.com/nishchaydev/sih2026/tree/main/research/anti-piracy" },
      { name: "Castle Architecture Compendium", desc: "17KB executive compendium for air-gapped government defense-in-depth", url: "https://github.com/nishchaydev/sih2026/blob/main/research/anti-piracy/README.md" }
    ]
  },
  {
    category: "Official Slide Decks & Certificates",
    items: [
      { name: "Official SIH Presentation (PDF)", desc: "Complete 14-slide national jury deck for Team eMitra (PS-26149)", url: "/eMitra PPT 149 final.pdf" },
      { name: "Real Cryptographic Certificates", desc: "35 immutable JSON evidence certificates in audit_reports/ (BSA 2023 Sec 63)", url: "https://github.com/nishchaydev/sih2026/tree/main/audit_reports" },
      { name: "System Architecture Vector SVG", desc: "Full 1280x880 high-resolution architectural blueprint", url: "/voidvault-architecture.svg" }
    ]
  }
];
