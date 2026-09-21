/**
 * Void Vault — SIH 2026 Showcase Site Configuration
 * Centralized configuration for all external URLs, prototype endpoints, and project metadata.
 * Update links, videos, and repo details here without modifying component code.
 */

export const siteConfig = {
  name: "Void Vault",
  tagline: "Secure Today. Recover Tomorrow.",
  subTagline: "An integrated digital-forensics and data-sanitization platform for secure erasure, advanced file recovery, verification, and tamper-evident audit.",
  quote: "Data has a longer memory. We do too.",
  
  // Hackathon Details
  hackathon: {
    name: "Smart India Hackathon 2026",
    edition: "SIH 2026",
    problemId: "PS-26149",
    organization: "National Technical Research Organisation (NTRO)",
    theme: "Blockchain & Cybersecurity",
    category: "Software",
    teamName: "Team eMitra",
    status: "Grand Finale Showcase",
  },

  // Primary External / Internal Links (Configurable)
  links: {
    // Repository
    github: "https://github.com/nishchaydev/sih2026",
    
    // Live Prototype / Web Assembly demo / Localhost Tauri daemon
    prototypeLiveUrl: "https://github.com/nishchaydev/sih2026/releases", // Team release or live web preview
    prototypeLocalApi: "http://127.0.0.1:5001",
    
    // Video Demo URL (Configurable: e.g. YouTube, Loom, or local MP4)
    demoVideoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", // Placeholder: replace with actual team video URL
    demoVideoEmbed: "", // Leave empty if using direct thumbnail modal
    
    // Documentation & Reports
    documentationPortal: "https://github.com/nishchaydev/sih2026/tree/main/docs",
    technicalSpec: "https://github.com/nishchaydev/sih2026/blob/main/docs/TECHNICAL_SPECIFICATION.md",
    userManual: "https://github.com/nishchaydev/sih2026/blob/main/docs/USER_MANUAL.md",
    researchReport: "https://github.com/nishchaydev/sih2026/blob/main/docs/RESEARCH_REPORT.md",
    bibliography: "https://github.com/nishchaydev/sih2026/blob/main/docs/RESEARCH_PAPERS_BIBLIOGRAPHY.md",
    validationReport: "https://github.com/nishchaydev/sih2026/blob/main/docs/VALIDATION_AND_TESTING.md",
    performanceReport: "https://github.com/nishchaydev/sih2026/blob/main/docs/PERFORMANCE_EVALUATION_REPORT.md",
    architectureSvg: "/voidvault-architecture.svg",
    slidesPdf: "/eMitra PPT 149 final.pdf",
  },

  // Judge Quick Access Jump Items (Speed Dial)
  judgeQuickMenu: [
    { id: "demo", label: "01 Demo", icon: "Play" },
    { id: "prototype", label: "02 Prototype", icon: "Monitor" },
    { id: "usps", label: "03 USPs", icon: "Sparkles" },
    { id: "architecture", label: "04 Architecture", icon: "Cpu" },
    { id: "research", label: "05 Research", icon: "BookOpen" },
    { id: "impact", label: "06 Impact", icon: "ShieldAlert" },
    { id: "team", label: "07 Team", icon: "Users" },
  ],

  // System Core Metrics
  metrics: {
    testCount: "152/152",
    testStatus: "Passing (0 Failures)",
    ramFootprint: "< 118 MB",
    cliFootprint: "< 12 MB",
    nvmeThroughput: "1,248 MB/s",
    verificationThroughput: "28.5 GB/s",
    smartWipeTime: "67 Seconds",
    standardsCount: "17 Global Standards",
    supportedFormats: "20+ File Formats",
  }
};
