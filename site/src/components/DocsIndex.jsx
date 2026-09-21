import React from 'react';
import { FileText, ExternalLink, Github, ArrowUpRight, BookOpen } from 'lucide-react';
import { GlowingEffect } from './ui/glowing-effect';

const GITHUB_DOCS_BASE = "https://github.com/nishchaydev/Void-Vault/blob/main/docs";

export const documentsList = [
  {
    file: "00-brief.md",
    num: "00",
    title: "Project Brief",
    desc: "Executive summary of closed-loop erase-carve-certify architecture and deployment model.",
    category: "Overview",
    version: "v1.0"
  },
  {
    file: "01-ps-traceability.md",
    num: "01",
    title: "PS Traceability Matrix",
    desc: "Full requirement-to-feature mapping for NTRO PS-26149.",
    category: "Compliance",
    version: "v1.0"
  },
  {
    file: "02-architecture.md",
    num: "02",
    title: "System Architecture",
    desc: "C4 container model, Win32 Direct I/O ring buffers, and trust boundaries.",
    category: "Architecture",
    version: "v1.0"
  },
  {
    file: "03-technical-specification.md",
    num: "03",
    title: "Technical Specification",
    desc: "M1/M2/M3 engine specs, confidence scoring formula, and classification classes.",
    category: "Specification",
    version: "v1.0"
  },
  {
    file: "04-sanitization-methods.md",
    num: "04",
    title: "Sanitization Methods",
    desc: "17 global standards matrix (NIST SP 800-88 Rev. 2, NVMe Sanitize, DSM TRIM assist).",
    category: "Sanitization",
    version: "v1.0"
  },
  {
    file: "05-verification-and-assurance.md",
    num: "05",
    title: "Verification & Assurance",
    desc: "Statistical sampling, full readback verification, and SIMD Shannon entropy measurement.",
    category: "Forensics",
    version: "v1.0"
  },
  {
    file: "06-evidence-and-legal.md",
    num: "06",
    title: "Evidence & Legal Admissibility",
    desc: "BSA 2023 Section 63 Schedule certificate format and chain-of-custody protocols.",
    category: "Legal",
    version: "v1.0"
  },
  {
    file: "07-audit-ledger.md",
    num: "07",
    title: "Cryptographic Audit Ledger",
    desc: "Append-only SHA-256 hash chaining, Merkle tree derivation, and tamper detection.",
    category: "Integrity",
    version: "v1.0"
  },
  {
    file: "08-security-and-threat-model.md",
    num: "08",
    title: "Security & Threat Model",
    desc: "STRIDE analysis, OS boot disk lockout, and air-gapped zero network egress guarantee.",
    category: "Security",
    version: "v1.0"
  },
  {
    file: "09-validation-report.md",
    num: "09",
    title: "Validation & Testing Report",
    desc: "NIST CFTT methodology test suite, fault injection, and 152/152 verification results.",
    category: "Testing",
    version: "v1.0"
  },
  {
    file: "10-performance-evaluation.md",
    num: "10",
    title: "Performance Evaluation",
    desc: "Carving recall/precision benchmarks, IOPS throughput, and memory consumption profiles.",
    category: "Benchmarks",
    version: "v1.0"
  },
  {
    file: "11-standards-alignment.md",
    num: "11",
    title: "Standards Alignment Matrix",
    desc: "Granular alignment with NIST, IEEE 2883-2022, ISO/IEC 27037, and DoD 5220.22-M.",
    category: "Standards",
    version: "v1.0"
  },
  {
    file: "12-competitive-analysis.md",
    num: "12",
    title: "Competitive Analysis",
    desc: "Feature-by-feature evaluation against Blancco, BitRaser, Autopsy, and PhotoRec.",
    category: "Analysis",
    version: "v1.0"
  },
  {
    file: "13-feasibility-impact-roadmap.md",
    num: "13",
    title: "Feasibility, Impact & Roadmap",
    desc: "TCO analysis, defense viability, STQC audit gating, and 18-month roadmap.",
    category: "Roadmap",
    version: "v1.0"
  },
  {
    file: "14-limitations.md",
    num: "14",
    title: "System Limitations",
    desc: "Honest technical disclosure: Flash wear-leveling nuances, USB bridge behaviors, and scope.",
    category: "Limitations",
    version: "v1.0"
  },
  {
    file: "15-evaluator-faq.md",
    num: "15",
    title: "Evaluator Technical FAQ",
    desc: "15 direct answers for SIH judges and defense evaluators.",
    category: "FAQ",
    version: "v1.0"
  },
  {
    file: "16-user-manual.md",
    num: "16",
    title: "Operator Manual",
    desc: "Comprehensive step-by-step field operations guide for GUI Cockpit and Headless CLI.",
    category: "Manual",
    version: "v1.0"
  },
  {
    file: "glossary.md",
    num: "G",
    title: "Technical Glossary",
    desc: "Formal definitions for BGC, BFD, DCO, HPA, TRIM, MFT, and forensic sanitization terms.",
    category: "Reference",
    version: "v1.0"
  }
];

export function DocsIndex() {
  return (
    <section id="docs" className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/[0.04]">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-xs font-mono font-semibold tracking-widest text-orange-500 uppercase">
          08 — OFFICIAL REPOSITORY DOCUMENTATION
        </span>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white mt-3 mb-4 tracking-tight">
          Complete Documentation Dossier
        </h2>
        <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
          17 formal specifications, technical audits, and forensic standards alignment papers. 
          Every document is hyperlinked directly to its source in the GitHub repository and served statically.
        </p>
      </div>

      {/* Grid of Documents */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {documentsList.map((doc, idx) => {
          const ghUrl = `${GITHUB_DOCS_BASE}/${doc.file}`;
          const localUrl = `/Void-Vault/docs/${doc.file}`;

          return (
            <div
              key={idx}
              className="group relative p-5 rounded-2xl border border-white/[0.06] bg-white/[0.01] hover:bg-white/[0.02] transition-all duration-300 flex flex-col justify-between shadow-xl"
            >
              <GlowingEffect hoverLiquid breathe spread={35} proximity={50} />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
                      DOC {doc.num}
                    </span>
                    <span className="text-[10px] font-mono text-neutral-400 uppercase">
                      {doc.category}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-500">
                    {doc.version}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">
                  {doc.title}
                </h3>
                <p className="text-xs text-neutral-400 font-light leading-relaxed mb-4">
                  {doc.desc}
                </p>
              </div>

              {/* Action Links */}
              <div className="relative z-10 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono">
                <a
                  href={ghUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-orange-400 hover:text-orange-300 transition-colors"
                  title="View on GitHub"
                >
                  <Github className="w-3.5 h-3.5" />
                  <span>View Source</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <a
                  href={localUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-neutral-400 hover:text-white transition-colors"
                  title="Read raw markdown"
                >
                  <span>Raw</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
export default DocsIndex;
