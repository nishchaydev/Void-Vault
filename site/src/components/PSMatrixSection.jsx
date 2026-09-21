import React from 'react';
import { CheckCircle2, ExternalLink, ShieldCheck, FileText, ArrowUpRight } from 'lucide-react';
import { GlowingEffect } from './ui/glowing-effect';

const GITHUB_BASE = "https://github.com/nishchaydev/Void-Vault/blob/main";

const PS_CLAUSES = [
  {
    clause: "NTRO-REQ-01",
    title: "Secure Drive Erasure (Module 1)",
    features: "Direct I/O hardware controller overwriting, ATA Secure Erase, NVMe Sanitize, cryptographic erasure, HPA/DCO hidden sector zeroing.",
    standards: "17 Standards (NIST SP 800-88 R1, DoD 5220.22-M, CSEC)",
    evidenceDoc: "docs/04-sanitization-methods.md",
    testProtocol: "E01, E02, E09",
    status: "VERIFIED",
    limitation: "Flash wear-leveling / over-provisioned spare blocks addressed via firmware ATA/NVMe Sanitize."
  },
  {
    clause: "NTRO-REQ-02",
    title: "Granular File & Folder Shredding (Module 2)",
    features: "Cluster slack zeroing, NTFS Alternate Data Streams (ADS) discovery & purge, Master File Table (MFT) record zeroing and timestamp randomization.",
    standards: "DoD 5220.22-M 7-Pass, BSI TL-03423",
    evidenceDoc: "docs/03-technical-specification.md",
    testProtocol: "E03, E08, E11",
    status: "VERIFIED",
    limitation: "Operating system file lockouts strictly honored; elevation required for protected volumes."
  },
  {
    clause: "NTRO-REQ-03",
    title: "Deep Adversarial Carving & Recovery (Module 3)",
    features: "Bifragment Gap Carving (BGC) algorithm, SIMD-accelerated 256-bin Shannon entropy scoring, 9 structural AST validation parsers.",
    standards: "ISO/IEC 27037:2012, CFTT DSR-01",
    evidenceDoc: "docs/05-verification-and-assurance.md",
    testProtocol: "E05, E06, E07",
    status: "VERIFIED",
    limitation: "Heuristic fragment reassembly confidence scales with header-footer metadata completeness."
  },
  {
    clause: "NTRO-REQ-04",
    title: "Tamper-Resistant Cryptographic Audit Ledger",
    features: "Append-only SHA-256 hash chaining, session Merkle tree derivation, Ed25519 digital signing, BSA 2023 Sec 63 certificate generation.",
    standards: "BSA 2023 Section 63 Schedule, FIPS 180-4",
    evidenceDoc: "docs/07-audit-ledger.md",
    testProtocol: "E04 (Tamper Matrix)",
    status: "VERIFIED",
    limitation: "Requires offline root verification bundle for independent judicial air-gap audits."
  },
  {
    clause: "NTRO-REQ-05",
    title: "Forensic Command Cockpit & Headless CLI",
    features: "Live disk telemetry, physical controller locking, boot-disk lockout interlock, dual-mode operation (Tauri v2 GUI + zero-dependency CLI).",
    standards: "STRIDE Threat Model, ISO 9241-11",
    evidenceDoc: "docs/16-user-manual.md",
    testProtocol: "E10, E12",
    status: "VERIFIED",
    limitation: "Host OS must run in administrator context for raw physical device handle allocation."
  },
  {
    clause: "NTRO-REQ-06",
    title: "Automated Reproducibility & Test Harness",
    features: "152/152 automated verification test suite, 12 empirical test protocols (E01-E12), fault injection and mock disk corruption pipeline.",
    standards: "NIST CFTT Methodology, ISO/IEC 17025",
    evidenceDoc: "docs/09-validation-report.md",
    testProtocol: "12 / 12 Protocols",
    status: "VERIFIED",
    limitation: "Physical destructive hardware test execution isolated inside disposable virtual machine harness."
  },
  {
    clause: "NTRO-REQ-07",
    title: "High-Throughput I/O Performance & Scaling",
    features: "Unbuffered 128KB Win32 Direct I/O ring buffers, double-buffered asynchronous worker pool, <150MB memory footprint.",
    standards: "IEEE 2883-2022 Performance Spec",
    evidenceDoc: "docs/10-performance-evaluation.md",
    testProtocol: "Bench v1.0",
    status: "VERIFIED",
    limitation: "Bus-limited by underlying storage controller interface (SATA III 550MB/s vs NVMe Gen4 7000MB/s)."
  },
  {
    clause: "NTRO-REQ-08",
    title: "Anti-Forensics & Judicial Admissibility",
    features: "Closed-loop carve-back verification, 0 surviving markers guarantee, forensic admissibility documentation under Indian Evidence Law (BSA 2023).",
    standards: "Bharatiya Sakshya Adhiniyam 2023 Sec 63",
    evidenceDoc: "docs/06-evidence-and-legal.md",
    testProtocol: "E01, E04, E07",
    status: "VERIFIED",
    limitation: "Chain of custody requires operator certificate binding during initialization."
  }
];

export function PSMatrixSection() {
  return (
    <section id="ps-matrix" className="py-12 md:py-16 px-4 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <span className="text-xs font-mono font-semibold tracking-widest text-orange-500 uppercase">
          02 — NTRO REQUIREMENTS COMPLIANCE
        </span>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white mt-3 mb-4 tracking-tight">
          PS SIH26149 Traceability Matrix
        </h2>
        <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
          Full 100% compliance mapping of every clause in National Technical Research Organisation (NTRO) Problem Statement PS-26149 to implementation modules, test evidence, and verification documentation.
        </p>
      </div>

      {/* Summary Stat Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center">
          <div className="text-2xl font-black text-orange-400 font-mono">100%</div>
          <div className="text-[11px] font-mono text-neutral-400 uppercase mt-1">PS Coverage</div>
        </div>
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center">
          <div className="text-2xl font-black text-white font-mono">8 / 8</div>
          <div className="text-[11px] font-mono text-neutral-400 uppercase mt-1">Clauses Satisfied</div>
        </div>
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center">
          <div className="text-2xl font-black text-white font-mono">12 / 12</div>
          <div className="text-[11px] font-mono text-neutral-400 uppercase mt-1">Evidence Protocols</div>
        </div>
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-center">
          <div className="text-2xl font-black text-orange-400 font-mono">152 / 152</div>
          <div className="text-[11px] font-mono text-neutral-400 uppercase mt-1">Tests Passing</div>
        </div>
      </div>

      {/* Interactive Matrix Cards & Table */}
      <div className="space-y-4">
        {PS_CLAUSES.map((item, idx) => (
          <div
            key={idx}
            className="group relative p-6 rounded-2xl border border-white/[0.06] bg-[#0c0d0e]/80 hover:bg-[#121316] transition-all duration-300 shadow-xl"
          >
            <GlowingEffect hoverLiquid spread={30} proximity={45} />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              {/* Clause Info & Features */}
              <div className="space-y-2 lg:max-w-2xl">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20">
                    {item.clause}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                    <CheckCircle2 className="w-3 h-3" />
                    {item.status}
                  </span>
                  <span className="text-xs font-mono text-neutral-500 hidden sm:inline">
                    Protocols: {item.testProtocol}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-orange-300 transition-colors">
                  {item.title}
                </h3>

                <p className="text-xs text-neutral-300 font-light leading-relaxed">
                  {item.features}
                </p>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-[11px] font-mono text-neutral-400">
                  <span><strong>Standards:</strong> {item.standards}</span>
                </div>

                <div className="text-[11px] text-neutral-500 italic font-mono pt-1">
                  <strong>Scope Boundary:</strong> {item.limitation}
                </div>
              </div>

              {/* Action Links & Evidence Reference */}
              <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-3 shrink-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-white/[0.06]">
                <a
                  href={`${GITHUB_BASE}/${item.evidenceDoc}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 hover:text-orange-300 border border-orange-500/30 text-xs font-mono transition-all font-medium"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Specification Doc</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <span className="text-[10px] font-mono text-neutral-500">
                  Ref: {item.evidenceDoc.split('/')[1]}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default PSMatrixSection;
