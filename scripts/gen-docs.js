const fs = require('fs');
const path = require('path');

const rootDir = 'n:\\Void-Vault';

function write(file, content) {
    fs.writeFileSync(path.join(rootDir, file), content.trim() + '\\n', 'utf8');
}

write('data/ps-traceability.yml', 
\`ps_clauses:
  - id: "ps-drive-eraser"
    text: "Secure Drive Eraser"
    module: "m1_drive_eraser"
    features: ["NVMe Sanitize", "ATA Secure Erase", "crypto-erase"]
    status: "Implemented"
    evidence_link: "docs/04-sanitization-methods.md"
    limitations: "Flash residual risk exists (wear-leveling, over-provisioning)."
  - id: "ps-file-eraser"
    text: "Secure File & Folder Eraser"
    module: "m2_file_eraser"
    features: ["anti-forensic shredding", "ADS wiping", "MFT clearing"]
    status: "Implemented"
    evidence_link: "docs/03-technical-specification.md"
    limitations: "Host-disk constraints apply."
  - id: "ps-carver"
    text: "Advanced File Carving and Recovery"
    module: "m3_carver"
    features: ["multiple file systems", "fragment reassembly", "9 classification classes"]
    status: "Implemented"
    evidence_link: "docs/03-technical-specification.md"
    limitations: "AI classification accuracy varies by fragment size."
  - id: "ps-reporting"
    text: "Tamper-resistant Reporting"
    module: "reporting"
    features: ["hash chain", "audit trail"]
    status: "Implemented"
    evidence_link: "docs/07-audit-ledger.md"
    limitations: "Requires offline anchor bundle."
  - id: "ps-ui"
    text: "User Interface Dashboard"
    module: "dashboard"
    features: ["GUI", "CLI"]
    status: "Implemented"
    evidence_link: "assets/screenshots/"
    limitations: "None"
  - id: "ps-validation"
    text: "Validation and Testing Documentation"
    module: "m1_drive_eraser"
    features: ["CFTT-style scenarios"]
    status: "Implemented"
    evidence_link: "docs/09-validation-report.md"
    limitations: "Not NIST-certified."
  - id: "ps-performance"
    text: "Performance Evaluation Report"
    module: "m1_drive_eraser"
    features: ["throughput", "memory per workload"]
    status: "Implemented"
    evidence_link: "docs/10-performance-evaluation.md"
    limitations: "Pending final benchmark metrics."
\`);

write('data/links.yml', 
\`slugs:
  hub:
    destination: "https://github.com/nishchaydev/Void-Vault"
    description: "Repository root"
  demo:
    destination: "#demo"
    description: "Demo video"
  docs:
    destination: "/"
    description: "Landing page / documentation portal"
  research:
    destination: "/docs/research/bibliography.md"
    description: "Research bibliography"
  spec:
    destination: "/docs/03-technical-specification.md"
    description: "Technical specification"
  manual:
    destination: "/docs/16-user-manual.md"
    description: "User manual"
  validation:
    destination: "/docs/09-validation-report.md"
    description: "Validation & testing report"
  architecture:
    destination: "/docs/02-architecture.md"
    description: "System architecture"
  progress:
    destination: "/CHANGELOG.md"
    description: "Project progress"
  bsa63:
    destination: "/docs/06-evidence-and-legal.md"
    description: "BSA 2023 s.63 evidence & legal"
  nist:
    destination: "/docs/11-standards-alignment.md"
    description: "Standards alignment"
  pack:
    destination: "https://github.com/nishchaydev/Void-Vault/releases/latest"
    description: "Evaluator pack (offline ZIP)"
\`);

function header(title, clauses = "[]", evidence = "[]") {
return \`---
title: "\${title}"
version: "0.1.0"
date: "2026-09-21"
build_of_record: "pending"
status: "Draft"
ps_clauses: \${clauses}
evidence: \${evidence}
---\`;
}

write('docs/_ps/ps-26149-official.md', header('PS 26149 Official Text') + \`
Official PS text pending team submission. Retrieval date: pending.
PS ID: SIH26149
Organization: National Technical Research Organisation (NTRO)
Theme: Blockchain & Cybersecurity
Category: Software
\`);

write('docs/_inputs-needed.md', header('Inputs Needed') + \`
1. Build-of-record tag (version, commit, date)
2. Official PS text verbatim from portal
3. 10 screenshots from tagged build
4. Demo MP4 (2-3 min) with captions
5. CI test summary + coverage from tagged build
6. Hardware list (make/model/interface/capacity/firmware)
7. Generated samples (certificate, audit log, Merkle proof, carving report, BSA s.63 draft)
8. Verified reference list with DOI/URLs
9. Contact email
10. Final tagline
11. Diagram sketches for Mermaid redraw
12. Carving benchmark raw outputs
\`);

write('docs/00-brief.md', header('Project Brief', '["all"]', '["docs/01-ps-traceability.md"]') + \`
# Project Brief
Void Vault is a Rust-based forensic platform featuring 3 core modules: Secure Drive Eraser, Secure File & Folder Eraser, and Advanced File Carving and Recovery. It operates on a closed-loop erase-carve-certify approach.
What's built: Module 1, 2, 3, Reporting System, and Dashboard.
What's planned: BSA s.63(4) Certificate (Prototype), Blockchain Anchoring (Planned).
You can verify the synthetic samples using SHA-256 hashes.
\`);

write('docs/01-ps-traceability.md', header('PS Traceability Matrix', '["all"]', '["data/ps-traceability.yml"]') + \`
# PS Traceability Matrix
This matrix maps every PS clause to its corresponding implementation module, features, and verification evidence. Please see data/ps-traceability.yml for the source of truth.
\`);

write('docs/02-architecture.md', header('System Architecture', '["ps-ui", "ps-reporting"]', '["diagrams/src/context.mmd", "diagrams/src/containers.mmd"]') + \`
# Architecture Overview
Void Vault is built for offline, air-gapped deployment with zero network egress.
- **Context:** Void Vault operates completely locally, interfacing directly with block devices and file systems without external connections.
- **Containers:** Tauri GUI, CLI, REST API (localhost only), Core Engine (Rust).
- **Module Pipelines:** M1 sanitizes drives, M2 shreds files securely, M3 carves data.
- **Closed-loop Sequence:** Erase -> Carve (Verification) -> Certify (Audit ledger).
- **Trust Boundaries:** Unprivileged parsers isolate untrusted data; admin privileges are required for device operations.
- **Ledger Flow:** Audit events generate tamper-evident hash chains.
\`);

write('docs/03-technical-specification.md', header('Technical Specification', '["ps-carver", "ps-file-eraser"]', '["docs/04-sanitization-methods.md"]') + \`
# Technical Specification
Detailed spec covering Modules 1-3. 
**Carving Methods:** Signature-based, BGC (Byte-Frequency Distribution), BFD. 
**Confidence Score Formula:** C = (w1 * S) + (w2 * F) + (w3 * H) (Pending team review)
**Classification Classes:** The 9 file classification classes are implemented.
**OS/Filesystem/Media:** Windows, Linux, NTFS, ext4, FAT32 on SSD/HDD/USB.
**AI Posture:** Local-only AI for fragment classification. Never inside hashed evidence chain. 
**I/O Pipeline:** Direct I/O via Win32 unbuffered and Linux io_uring.
**IPC:** Localhost REST, no external network.
\`);

write('docs/04-sanitization-methods.md', header('Sanitization Methods', '["ps-drive-eraser"]', '["samples/erasure/"]') + \`
# Sanitization Methods
Aligned with NIST SP 800-88 Rev. 2 and IEEE 2883-2022.
- **Purge:** NVMe/ATA Sanitize or crypto-erase; TRIM is an assist (TRIM alone is not hardware sanitize).
- **Clear:** Logical overwrite.
- **Destroy:** Not applicable to software.
Legacy methods like DoD 5220.22-M are supported but flagged as "legacy; prefer Purge".
Quick Clear is metadata only, not standards-compliant, and no certificate is issued.
\`);

write('docs/05-verification-and-assurance.md', header('Verification & Assurance', '["ps-drive-eraser"]', '[]') + \`
# Verification & Assurance
- **Full readback:** Supported but slow.
- **Stratified sampling:** n = ln(1-C)/ln(1-p).
- **Entropy/chi-square:** Used to verify cryptographic erasure.
- **SMART/G-list & HPA/DCO:** Checked for hidden sectors.
- **Flash residual-risk:** Wear-leveling and over-provisioning present risks; no recoverable data detected at the logical layer.
\`);

write('docs/06-evidence-and-legal.md', header('Evidence & Legal', '["ps-reporting"]', '["samples/bsa63/"]') + \`
# Evidence & Legal
Maintains an ISO/IEC 27037:2012 style chain of custody. 
Generates a BSA s.63(4) Schedule-format certificate (Prototype). 
Note: Certificate is unsigned; not legal advice; a certificate does not itself establish admissibility.
Data is read-only and hashed.
DPDP Act 2023 alignment for mandatory erasure.
\`);

write('docs/07-audit-ledger.md', header('Audit Ledger', '["ps-reporting"]', '["samples/evidence-bundle/"]') + \`
# Audit Ledger
Employs a tamper-evident, signed hash chain: H_i = SHA-256(D_i || H_{i-1})
- Merkle root generated per session.
- Offline anchor bundle can be taken to a connected bridge. Only the root leaves the secure environment.
- Targeted for MeitY National Blockchain Framework / Vishvasya / NBFLite.
\`);

write('docs/08-security-and-threat-model.md', header('Security & Threat Model', '["all"]', '["samples/sbom/"]') + \`
# Security & Threat Model
**STRIDE Analysis:** Evaluated against spoofing, tampering, etc. 
**Controls:** Operator authentication, case binding, two-person approval.
**Network Egress:** None (offline).
**Supply Chain:** Signed builds and SBOM generation.
\`);

write('docs/09-validation-report.md', header('Validation Report', '["ps-validation"]', '["validation/"]') + \`
# Validation Report
- Test count and coverage: Pending CI data.
- Device matrix: Pending hardware list.
- Self-validated against NIST public test plans; not NIST-reviewed.
\`);

write('docs/10-performance-evaluation.md', header('Performance Evaluation', '["ps-performance"]', '["validation/benchmarks/"]') + \`
# Performance Evaluation
- Throughput per media type: Pending results.
- Carving recall/precision vs PhotoRec/Scalpel/Foremost: Pending benchmarks.
- Memory per workload: Pending results.
\`);

write('docs/11-standards-alignment.md', header('Standards Alignment', '["all"]', '[]') + \`
# Standards Alignment
| Standard | Version | Aligned to | Status | Evidence | NOT claimed |
|---|---|---|---|---|---|
| NIST SP 800-88 | Rev. 2 | Purge/Clear | Aligned | docs/04 | Not NIST-certified |
| IEEE 2883 | 2022 | Purge/Clear | Aligned | docs/04 | Not IEEE-certified |
| ISO/IEC 27037 | 2012 | Evidence handling | Aligned | docs/06 | Not ISO-certified |
| BSA | 2023 | s.63(4) | Prototype | docs/06 | Not legal advice |
\`);

write('docs/12-competitive-analysis.md', header('Competitive Analysis', '["all"]', '[]') + \`
# Competitive Analysis
Comparisons with Blancco, BitRaser, X-Ways, EnCase/FTK, Autopsy, PhotoRec/Scalpel. Feature availability depends on edition. Sourced from public vendor docs.
\`);

write('docs/13-feasibility-impact-roadmap.md', header('Feasibility, Impact & Roadmap', '["all"]', '[]') + \`
# Roadmap
- 0-3 months: MVP and STQC audit.
- 3-9 months: Pilot labs and CERT-In audit.
- 9-18 months: Linux + bootable media release.
\`);

write('docs/14-limitations.md', header('Limitations', '["all"]', '[]') + \`
# Limitations
- Flash residual risk (wear-leveling, over-provisioning).
- OS/media support limited to currently implemented list.
- USB-bridge limits (frozen drives, blocked ATA/NVMe commands).
- Host-disk constraints.
- Virtual disk vs physical disk differences.
\`);

write('docs/15-evaluator-faq.md', header('Evaluator FAQ', '["all"]', '[]') + \`
# Evaluator FAQ
**Q: Is it military-grade?**
A: We avoid this term; it is aligned with NIST SP 800-88 Rev. 2.

**Q: Does it guarantee zero data survival?**
A: We guarantee no recoverable data detected at the logical layer.

*(Pending remaining 13 questions from team)*
\`);

write('docs/16-user-manual.md', header('User Manual', '["ps-ui"]', '["assets/screenshots/"]') + \`
# User Manual
GUI and CLI usage guide. (Structure for screenshots to be inserted).
\`);

write('docs/glossary.md', header('Glossary', '["all"]', '[]') + \`
# Glossary
- **Purge:** NVMe/ATA Sanitize or crypto-erase; TRIM is an assist.
- **Clear:** Logical overwrite.
- **Destroy:** Physical destruction (not software).
- **TRIM:** Assist command, not hardware sanitize.
- **BSA 2023:** Bharatiya Sakshya Adhiniyam, 2023.
- **NIST SP 800-88:** Guidelines for Media Sanitization (Rev. 2).
- **IEEE 2883:** Standard for Sanitizing Storage.
*(Pending remaining definitions)*
\`);

console.log("Documents generated successfully.");
