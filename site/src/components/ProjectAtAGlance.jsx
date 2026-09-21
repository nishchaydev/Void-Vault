import React, { useState } from 'react';
import { GlowingEffect } from './ui/glowing-effect';
import { Search, Shield, CheckCircle2, Lock, ArrowRight, HardDrive, Cpu, Terminal, FileCode2, Scale } from 'lucide-react';

export default function ProjectAtAGlance() {
  const [activeStage, setActiveStage] = useState(2); // Default to RECOVER / SANITIZE

  const cards = [
    {
      id: "forensics",
      title: "FORENSICS",
      tagline: "The Offense",
      summary: "Advanced file recovery and structural analysis.",
      description: "Recovers deleted, damaged, and fragmented files from unallocated clusters. Employs Bifragment Gap Carving (BGC) and 256-bin SIMD Byte Frequency Distribution (BFD) histogram classification for headerless fragments.",
      icon: Search,
      stat: "20+ Signatures • BGC Engine"
    },
    {
      id: "sanitization",
      title: "SANITIZATION",
      tagline: "The Defense",
      summary: "Device-aware secure data erasure.",
      description: "17 defense-grade algorithms plus hardware-level NVMe Sanitize Crypto Erase and Win32 DSM TRIM. Neutralizes over-provisioned NAND flash, NTFS Alternate Data Streams (ADS), and MFT records.",
      icon: Shield,
      stat: "17 Global Standards • NVMe Purge"
    },
    {
      id: "verification",
      title: "VERIFICATION",
      tagline: "The Proof",
      summary: "Independent verification of operation results.",
      description: "The carver serves as an adversarial proof engine: it immediately scans wiped sectors to confirm 0 recoverable files, supported by xxHash3-128 verification (28.5 GB/s) and Shannon entropy (>7.95).",
      icon: CheckCircle2,
      stat: "0 Files Recoverable • 28.5 GB/s"
    },
    {
      id: "trust",
      title: "TRUST",
      tagline: "The Admissibility",
      summary: "Cryptographically linked audit records.",
      description: "Append-only SHA-256 sequential hash chaining with a bottom-up Merkle root. Automatically produces court-admissible electronic evidence certificates under Section 63 of Bharatiya Sakshya Adhiniyam, 2023.",
      icon: Lock,
      stat: "BSA 2023 Sec 63 • Merkle Root"
    }
  ];

  const pipelineStages = [
    {
      step: "01",
      name: "DISCOVER",
      badge: "WMI Hardware Interlock",
      title: "Physical Media & Geometry Discovery",
      action: "Asynchronously scans physical storage via Win32 WMI and IOCTL_STORAGE_QUERY_PROPERTY. Detects NVMe, SATA, and USB buses while hard-locking the host OS boot disk (PhysicalDrive0).",
      hardwareDetail: "Win32_DiskDrive • DeviceIoControl • Boot Volume Lockout",
      outputs: "Physical drive handles, sector sizes, partition tables, SMART G-List health"
    },
    {
      step: "02",
      name: "ANALYZE",
      badge: "Structure & Entropy",
      title: "Filesystem & Artifact Assessment",
      action: "Parses master file tables ($MFT), partition tables (GPT/MBR), and cluster runs. Evaluates sector byte entropy and classifies suspect regions via 256-bin SIMD BFD histograms.",
      hardwareDetail: "Cluster run parsing • SIMD Byte Frequency Distribution • Shannon Entropy",
      outputs: "Identified cluster offsets, corrupted runs, and unallocated sector targets"
    },
    {
      step: "03",
      name: "RECOVER / SANITIZE",
      badge: "Dual Mandate Core",
      title: "Direct Unbuffered Hardware Execution",
      action: "Dual execution modes: Sanitizer executes 17 wiping standards, hardware NVMe Crypto Erase, and ADS/slack purging. Carver reassembles non-contiguous fragmented files using Bifragment Gap Carving.",
      hardwareDetail: "CreateFileW unbuffered direct I/O • NVMe Crypto Erase • BGC Heuristic Split",
      outputs: "Sanitized LBAs / Extracted and reassembled file artifacts with confidence scores"
    },
    {
      step: "04",
      name: "VERIFY",
      badge: "Adversarial Proof",
      title: "Closed-Loop Readback & Carver Scan",
      action: "The carver adversarial scanner immediately re-scans the sanitized sectors to confirm exactly 0 surviving files. Hardware SIMD xxHash3-128 verifies raw fill across sectors at 28.5 GB/s.",
      hardwareDetail: "xxHash3-128 SIMD • Reverse Magic Byte Verification • Entropy Check",
      outputs: "0 Residual files verified • 7.9998 Shannon entropy • Hash digest match"
    },
    {
      step: "05",
      name: "AUDIT",
      badge: "Legal Admissibility",
      title: "Cryptographic Merkle Sealing & BSA 2023 Certificate",
      action: "Appends the operation telemetry to the sequential SHA-256 hash chain and recalculates the Merkle root. Emits court-admissible electronic evidence certificates under BSA 2023 Section 63.",
      hardwareDetail: "Append-only Hash Chain • Bottom-Up Merkle Root • ISO/IEC 27037 Manifest",
      outputs: "Section 63 Part A & B Certificates • JSON/CSV Case Manifest • Merkle Root Digest"
    }
  ];

  return (
    <section id="glance" className="py-20 md:py-28 border-t border-white/[0.04] bg-[#050505] relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-cyan-500/5 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono font-semibold tracking-widest text-cyan-400 uppercase">
            02 — THE PROJECT AT A GLANCE
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mt-3 mb-4 tracking-tight">
            Integrated Forensic Architecture
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
            Void Vault bridges the historic divide between offensive digital forensics and defensive data sanitization through a single closed-loop verification pipeline.
          </p>
        </div>

        {/* 4 Interactive Feature Cards with Orbit GlowingEffect */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-20">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.id}
                className="group relative p-6 rounded-2xl border border-white/[0.06] bg-white/[0.01] hover:bg-white/[0.02] transition-all duration-300 flex flex-col justify-between shadow-2xl"
              >
                <GlowingEffect hoverLiquid breathe spread={40} proximity={55} />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 rounded-xl border border-white/10 bg-white/5 text-cyan-400 group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[11px] font-mono tracking-wider text-neutral-400 uppercase font-semibold">
                      {card.tagline}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white tracking-wide mb-1 group-hover:text-cyan-300 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-xs font-mono text-cyan-400/90 mb-3">
                    {card.summary}
                  </p>
                  <p className="text-xs text-neutral-300 leading-relaxed font-light">
                    {card.description}
                  </p>
                </div>

                <div className="pt-4 mt-6 border-t border-white/[0.06] flex items-center justify-between relative z-10">
                  <span className="text-[11px] font-mono text-neutral-400">
                    {card.stat}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Visual Interactive Pipeline with Orbit styling */}
        <div className="group relative rounded-2xl border border-white/[0.08] bg-[#070A10] p-6 sm:p-8 shadow-2xl overflow-hidden">
          <GlowingEffect hoverLiquid breathe spread={55} proximity={75} />

          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/[0.06]">
              <div>
                <span className="text-xs font-mono font-semibold tracking-wider text-cyan-400 uppercase">
                  CLOSED-LOOP WORKFLOW PIPELINE
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white mt-1">
                  Interactive Execution Sequence
                </h3>
              </div>
              <span className="text-xs font-mono text-neutral-400">
                Click any stage to inspect low-level hardware operations
              </span>
            </div>

            {/* Stepper Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 my-6">
              {pipelineStages.map((stage, idx) => {
                const isSelected = activeStage === idx;
                return (
                  <button
                    key={stage.step}
                    onClick={() => setActiveStage(idx)}
                    className={`relative text-left p-3.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-500/20 border-cyan-500/60 shadow-md shadow-cyan-500/10'
                        : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[10px] font-mono font-bold ${isSelected ? 'text-cyan-300' : 'text-neutral-400'}`}>
                        STAGE {stage.step}
                      </span>
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                      )}
                    </div>
                    <div className={`text-xs font-bold font-mono tracking-wider truncate ${isSelected ? 'text-white' : 'text-neutral-300'}`}>
                      {stage.name}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Stage Detail Panel */}
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-5 sm:p-6 transition-all">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                    STAGE {pipelineStages[activeStage].step}
                  </span>
                  <h4 className="text-base sm:text-lg font-bold text-white">
                    {pipelineStages[activeStage].title}
                  </h4>
                </div>
                <span className="text-xs font-mono text-neutral-400 bg-white/5 px-2.5 py-1 rounded-full border border-white/10">
                  {pipelineStages[activeStage].badge}
                </span>
              </div>

              <p className="text-sm text-neutral-300 leading-relaxed mb-5 font-light">
                {pipelineStages[activeStage].action}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/[0.06] font-mono text-xs">
                <div className="flex items-start gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-neutral-400 block text-[11px]">Hardware APIs & Algorithms:</span>
                    <span className="text-neutral-200">{pipelineStages[activeStage].hardwareDetail}</span>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-neutral-400 block text-[11px]">Verified Outputs:</span>
                    <span className="text-neutral-200">{pipelineStages[activeStage].outputs}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
