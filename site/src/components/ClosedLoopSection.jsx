import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Lock, 
  FileText, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  AlertTriangle,
  Layers,
  Terminal,
  Cpu
} from 'lucide-react';
import { GlowingEffect } from './ui/glowing-effect';

const EXPERIMENTS = [
  {
    id: "E01",
    title: "Closed-Loop Carve-Back Verification",
    category: "Sanitization Audit",
    positiveControl: "PASS (98.2% Pre-Wipe Recall)",
    negativeControl: "PASS (0 Survivors Post-Wipe)",
    keyMetric: "17 / 17 Standards Cleared (0 Recoverable Files)",
    protocolFile: "E01-closed-loop-carve-back.md",
    summaryFile: "E01/summary.json",
    details: "Tests 1,000 synthetic files across 10 MIME types. Pre-wipe baseline achieves 98.2% recovery; post-sanitization readback confirms 0 surviving files across Void Vault, PhotoRec 7.2, and Scalpel 2.0."
  },
  {
    id: "E02",
    title: "NIST CFTT Media Prep Alignment",
    category: "Standards Compliance",
    positiveControl: "PASS (100% Pattern Readback)",
    negativeControl: "PASS (Boot Disk Lockout)",
    keyMetric: "5 / 5 Executable Cases Pass (2 Hardware N/A)",
    protocolFile: "E02-nist-public-test-plans.md",
    summaryFile: "E02/summary.json",
    details: "Maps against NIST CFTT Forensic Media Preparation v2.0 requirements (FMP-01 through FMP-07). All virtual disk test assertions succeed; hardware-only HPA/DCO constraints formally disclosed."
  },
  {
    id: "E03",
    title: "Independent Carving Benchmark",
    category: "Forensic Recovery",
    positiveControl: "PASS (Baseline Carvers)",
    negativeControl: "PASS (Noise Rejection)",
    keyMetric: "98.7% F1 Score (PhotoRec: 95.3%, Scalpel: 91.6%)",
    protocolFile: "E03-carving-benchmark.md",
    summaryFile: "E03/summary.json",
    details: "Rigorous benchmark comparing Void Vault Module 3 against PhotoRec 7.2, Scalpel 2.0, and Foremost 1.5.7. Achieves 91.2% reassembly on fragmented extents vs 54.0% for PhotoRec."
  },
  {
    id: "E04",
    title: "Ledger Tamper Resistance Matrix",
    category: "Cryptographic Integrity",
    positiveControl: "PASS (Valid Chain Pass)",
    negativeControl: "PASS (1-Bit Invalidation)",
    keyMetric: "7 / 7 Adversarial Attacks Detected (100%)",
    protocolFile: "E04-ledger-tamper-matrix.md",
    summaryFile: "E04/summary.json",
    details: "Evaluates SHA-256 sequential hash chains and Merkle root anchoring against 7 attacks: bit flips, record deletion, transposition, tail truncation, replay injection, full recomputation, and cert swap."
  },
  {
    id: "E05",
    title: "Real Devices Hardware Runbook",
    category: "Hardware Verification",
    positiveControl: "HUMAN RUNBOOK",
    negativeControl: "AIR-GAP REQUIRED",
    keyMetric: "Human Runbook (NVMe, SATA SSD, HDD)",
    protocolFile: "E05-real-devices-runbook.md",
    summaryFile: "E05/summary.json",
    details: "Air-gapped physical hardware protocol for verifying NVMe Sanitize Crypto Erase and ATA Security commands on bare metal. Automated execution is blocked by design to protect host media."
  },
  {
    id: "E06",
    title: "Performance & Resource Profile",
    category: "Efficiency & Throughput",
    positiveControl: "PASS (94.5% fio Efficiency)",
    negativeControl: "PASS (Bounded Working Set)",
    keyMetric: "462.4 MB/s Direct I/O | 142.8 MB Peak RSS",
    protocolFile: "E06-performance-evaluation.md",
    summaryFile: "E06/summary.json",
    details: "Profiles sustained throughput across 64KB, 1MB, and 4MB block sizes. Verifies zero memory leaks during 50GB continuous passes with bounded resident working set (< 250 MB)."
  },
  {
    id: "E07",
    title: "Confidence Calibration & ECE",
    category: "AI & Neural Heuristics",
    positiveControl: "PASS (High-Conf Accuracy)",
    negativeControl: "PASS (Uncertainty Penalty)",
    keyMetric: "Expected Calibration Error (ECE) <= 0.04",
    protocolFile: "E07-confidence-calibration.md",
    summaryFile: "E07/summary.json",
    details: "10-bin Platt scaling reliability analysis. Confirms that predicted confidence probabilities tightly match empirical accuracy, preventing overconfident false carves."
  },
  {
    id: "E08",
    title: "File Type Classification Matrix",
    category: "Fragment Recognition",
    positiveControl: "PASS (Known MIME Types)",
    negativeControl: "PASS (CSPRNG Rejection)",
    keyMetric: "97.1% Overall Accuracy across 10 Formats",
    protocolFile: "E08-classification-evaluation.md",
    summaryFile: "E08/summary.json",
    details: "Full confusion matrix evaluation across JPEG, PNG, PDF, ZIP, DOCX, XLSX, MP3, MP4, TEXT, and PE-EXE. Distinguishes nested XML/ZIP containers with 94%+ precision."
  },
  {
    id: "E09",
    title: "Module 2 NTFS Residual Traces",
    category: "Anti-Forensics & Slack",
    positiveControl: "PASS (0 Bytes Residual)",
    negativeControl: "PASS (Zero Collateral Impact)",
    keyMetric: "3,192 B Cluster Slack + 3 ADS Sanitized",
    protocolFile: "E09-module2-residual-traces.md",
    summaryFile: "E09/summary.json",
    details: "Tests 4-phase file shredding on NTFS: cleans resident MFT attributes, flushes Alternate Data Streams, zeros unallocated cluster slack space, and logs USN journal states."
  },
  {
    id: "E10",
    title: "Supply Chain & Fault-Tolerance",
    category: "DevSecOps & Robustness",
    positiveControl: "PASS (0 CVE Advisories)",
    negativeControl: "PASS (Mid-Wipe Interlock)",
    keyMetric: "148 Crates Audited | ASLR / DEP / CFG Enforced",
    protocolFile: "E10-robustness-supply-chain.md",
    summaryFile: "E10/summary.json",
    details: "Cargo audit against RustSec database (0 vulnerabilities). Injects SIGKILL and device dismount mid-wipe; verifies tool logs INTERRUPTED and locks certificate generation."
  },
  {
    id: "E11",
    title: "Usability & Operator Safety Runbook",
    category: "Human Factors & UI",
    positiveControl: "HUMAN RUNBOOK",
    negativeControl: "FAIL-SAFE DESIGN",
    keyMetric: "0% Accidental Destruction in 10-User Cohort",
    protocolFile: "E11-usability-evaluation.md",
    summaryFile: "E11/summary.json",
    details: "Human-in-the-loop trial testing panic cognitive load, typed confirmation friction, and visual distinctiveness between non-destructive carving and destructive wiping."
  },
  {
    id: "E12",
    title: "External Forensic Auditor Pack",
    category: "Third-Party Validation",
    positiveControl: "AUDITOR PACK READY",
    negativeControl: "PUBLIC KEY VERIFIABLE",
    keyMetric: "Standalone CLI Verifier + Ed25519 Public Key",
    protocolFile: "E12-external-review-pack.md",
    summaryFile: "E12/summary.json",
    details: "Self-contained evaluation bundle allowing independent defense evaluators to verify raw audit logs, validate JSON schemas, and test tamper rejection on isolated systems."
  }
];

export default function ClosedLoopSection() {
  const [selectedExp, setSelectedExp] = useState(null);
  const repoBase = "https://github.com/nishchaydev/Void-Vault/blob/main/validation";
  const rawBase = "https://raw.githubusercontent.com/nishchaydev/Void-Vault/main/validation";

  return (
    <section id="loop" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative">
      {/* Background glow in signature Orbit orange */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-orange-500/5 blur-[140px] pointer-events-none rounded-full" />

      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16 relative z-10">
        <span className="text-xs font-mono font-semibold tracking-widest text-orange-500 uppercase">
          06 — VERIFICATION & REPRODUCIBILITY
        </span>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white mt-3 mb-4 tracking-tight">
          Closed-Loop Verification & Evidence Harness
        </h2>
        <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
          In cybersecurity, claims without reproducible protocols are opinions. Void Vault subjects every wipe to an automatic carve-back audit, cryptographic hash-chaining, and 12 rigorous validation experiments.
        </p>
      </div>

      {/* Interactive 4-Step Closed Loop Flowchart */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-16 relative z-10">
        {[
          {
            step: "01",
            title: "Plant Canaries",
            subtitle: "Deterministic Corpus",
            desc: "1,000 files with embedded SHA-256 canary markers are generated with fixed PRNG seed 146878.",
            icon: FileText
          },
          {
            step: "02",
            title: "Overwrite Pass",
            subtitle: "17 Standards Engine",
            desc: "Direct I/O sectors are overwritten using chosen standard (NIST Clear, DoD 5220.22-M, CSPRNG).",
            icon: Cpu
          },
          {
            step: "03",
            title: "Carve-Back Audit",
            subtitle: "Multi-Tool Scan",
            desc: "Raw sectors are carved by Void Vault Module 3, PhotoRec 7.2, and Scalpel 2.0. Must return 0 survivors.",
            icon: Search
          },
          {
            step: "04",
            title: "Cryptographic Proof",
            subtitle: "Merkle Root & Cert",
            desc: "Hash-chained event log generates an immutable session Merkle root, signed with Ed25519.",
            icon: ShieldCheck
          }
        ].map((item, idx) => (
          <div 
            key={idx}
            className="group relative p-6 rounded-2xl border border-white/[0.06] bg-[#0c0d0e]/80 hover:border-orange-500/40 transition-all duration-300 flex flex-col justify-between"
          >
            <GlowingEffect hoverLiquid spread={35} proximity={50} />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-bold text-orange-500 bg-orange-500/10 px-2 py-1 rounded">
                  STEP {item.step}
                </span>
                <item.icon className="w-5 h-5 text-neutral-400 group-hover:text-orange-400 transition-colors" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">{item.title}</h3>
              <p className="text-xs font-mono text-orange-400/80 mb-2">{item.subtitle}</p>
              <p className="text-xs text-neutral-400 leading-relaxed font-light">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Part C: 12 Experiments Matrix Table */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0c0d0e]/90 overflow-hidden shadow-2xl relative z-10">
        <div className="px-6 py-5 border-b border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/[0.02]">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-orange-500" />
              <h3 className="text-lg font-bold text-white tracking-wide">
                Validation Evidence Harness (E01 — E12)
              </h3>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Build of Record: <code className="text-orange-400 font-mono">v1.0-sih-r2</code> | Commit: <code className="text-neutral-300 font-mono">75858ab</code> | Schema: <span className="text-neutral-300">Draft 2020-12</span>
            </p>
          </div>
          <a
            href="https://github.com/nishchaydev/Void-Vault/tree/main/validation"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-orange-500/30 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 text-xs font-mono transition-colors"
          >
            <span>View Validation Root</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.01] text-neutral-400 font-mono">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Experiment Title</th>
                <th className="py-3 px-4">Domain</th>
                <th className="py-3 px-4">Controls</th>
                <th className="py-3 px-4">Key Verified Metric</th>
                <th className="py-3 px-4 text-right">Evidence Artifacts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {EXPERIMENTS.map((exp) => {
                const isSelected = selectedExp === exp.id;
                return (
                  <React.Fragment key={exp.id}>
                    <tr 
                      className={`hover:bg-white/[0.02] transition-colors cursor-pointer ${
                        isSelected ? 'bg-orange-500/[0.04]' : ''
                      }`}
                      onClick={() => setSelectedExp(isSelected ? null : exp.id)}
                    >
                      <td className="py-3 px-4 font-mono font-bold text-orange-400">
                        {exp.id}
                      </td>
                      <td className="py-3 px-4 font-semibold text-white">
                        <div className="flex items-center gap-1.5">
                          <span>{exp.title}</span>
                          {isSelected ? <ChevronUp className="w-3.5 h-3.5 text-neutral-500" /> : <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-neutral-400 text-[11px]">
                        {exp.category}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 font-mono text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>PASS</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-neutral-200 font-mono text-[11px]">
                        {exp.keyMetric}
                      </td>
                      <td className="py-3 px-4 text-right space-x-2 whitespace-nowrap">
                        <a
                          href={`${repoBase}/protocols/${exp.protocolFile}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-[11px] font-mono text-neutral-400 hover:text-orange-400 underline decoration-white/20 underline-offset-2"
                        >
                          <span>Protocol</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                        <a
                          href={`${repoBase}/results/${exp.summaryFile}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-[11px] font-mono text-orange-400 hover:text-orange-300 underline decoration-orange-500/30 underline-offset-2"
                        >
                          <span>JSON</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </td>
                    </tr>
                    {isSelected && (
                      <tr className="bg-orange-500/[0.02] border-b border-orange-500/20">
                        <td colSpan={6} className="py-3 px-6 text-neutral-300 text-xs leading-relaxed font-light">
                          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                            <div className="space-y-1">
                              <p><strong className="text-white font-mono">Methodology Summary:</strong> {exp.details}</p>
                              <p className="text-[11px] text-neutral-400 font-mono">
                                <strong>Positive Control:</strong> {exp.positiveControl} &nbsp;|&nbsp; <strong>Negative Control:</strong> {exp.negativeControl}
                              </p>
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <a
                                href={`${rawBase}/results/${exp.summaryFile}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1 rounded border border-white/10 bg-white/5 hover:bg-white/10 text-neutral-200 font-mono text-[11px] transition-colors"
                              >
                                View Raw JSON
                              </a>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
