import React from 'react';
import { AlertTriangle, ArrowDown, ArrowRight, Check, X, Shield, RefreshCw, Scale, HardDrive } from 'lucide-react';

export default function WhyVoidVault() {
  const problems = [
    {
      title: "Multiple Disconnected Tools",
      desc: "Officers juggle 3–5 foreign tools (DBAN, Blancco, Autopsy, PhotoRec) with incompatible formats.",
      sub: "High license cost & zero interoperability"
    },
    {
      title: "Manual, Error-Prone Processes",
      desc: "Requires manual CLI scripting, separate hash tools, and disjointed spreadsheet logs prone to human error.",
      sub: "Triage takes hours instead of minutes"
    },
    {
      title: "Recoverable Residual Flash Data",
      desc: "Software wiping misses over-provisioned NAND blocks behind SSD Flash Translation Layers (FTL).",
      sub: "Up to 67% data survives (USENIX FAST '11)"
    },
    {
      title: "No Unified Audit Trail",
      desc: "Fragile paper records and unsigned text logs fail statutory non-repudiation in judicial proceedings.",
      sub: "Cites repealed Indian Evidence Act 65B"
    },
    {
      title: "Complex or Unverified Claims",
      desc: "Tools merely claim data was deleted without executing an adversarial carver to verify non-recoverability.",
      sub: "Zero mathematical proof of sanitization"
    }
  ];

  const solutions = [
    {
      title: "One Sovereign Platform",
      desc: "Single memory-safe Rust executable containing Drive Sanitizer, File Shredder, Deep Carver, and Audit Ledger.",
      sub: "Zero license fees · 100% air-gapped sovereign code"
    },
    {
      title: "Guided 5-Click Workflow",
      desc: "Integrated WMI device detection, automated boot drive locks, and live telemetry reduce triage by 90%.",
      sub: "Smart Secure Wipe executes in 67 seconds"
    },
    {
      title: "Hardware Controller Purge",
      desc: "Native NVMe Sanitize Crypto Erase (`IOCTL_STORAGE_REINITIALIZE_MEDIA`) and advisory DSM TRIM purge physical NAND.",
      sub: "Verified zero hardware-level flash survivability"
    },
    {
      title: "Tamper-Evident Merkle Ledger",
      desc: "SHA-256 sequential hash chain with bottom-up Merkle root automatically exports Section 63 BSA 2023 certificates.",
      sub: "Immediate judicial admissibility in Indian courts"
    },
    {
      title: "Closed-Loop Adversarial Verification",
      desc: "The offensive carver immediately scans target sectors post-wipe to mathematically prove 0 surviving files.",
      sub: "xxHash3-128 verified at 28.5 GB/s (1TB in 35s)"
    }
  ];

  return (
    <section className="py-20 md:py-28 border-t border-white/5 bg-[#07090E] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono font-semibold tracking-widest text-cyan-400 uppercase">
            03 — WHY VOID VAULT?
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3 mb-4 tracking-tight">
            From Fragmented Chaos to One Unified Workflow
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            In digital forensics and data destruction, operating in silos creates critical vulnerabilities. Void Vault consolidates the entire lifecycle into a verified, closed-loop system.
          </p>
        </div>

        {/* Problem vs Solution Side-by-Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          
          {/* Fragmented Current Workflow */}
          <div className="p-6 sm:p-8 rounded-2xl bg-red-950/10 border border-red-900/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-red-900/30 mb-6">
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 rounded-lg bg-red-900/30 text-red-400">
                    <X className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-wide">
                      FRAGMENTED CURRENT WORKFLOW
                    </h3>
                    <span className="text-xs font-mono text-red-300">Legacy Forensic Dilemma</span>
                  </div>
                </div>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800/60">
                  3-5 Tools
                </span>
              </div>

              <div className="space-y-4">
                {problems.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/40 border border-red-900/20">
                    <span className="w-5 h-5 rounded-full bg-red-950 text-red-400 border border-red-800/40 flex items-center justify-center shrink-0 text-xs font-mono font-bold mt-0.5">
                      ✕
                    </span>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-200">{item.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{item.desc}</p>
                      <span className="text-[11px] font-mono text-red-400/90 mt-1 inline-block">⚠ {item.sub}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-red-900/20 flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Status Quo: Expensive · Insecure · Inadmissible</span>
            </div>
          </div>

          {/* Void Vault Unified Workflow */}
          <div className="p-6 sm:p-8 rounded-2xl bg-cyan-950/20 border border-cyan-500/40 flex flex-col justify-between shadow-xl shadow-cyan-950/30">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-cyan-800/40 mb-6">
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 rounded-lg bg-cyan-900/40 text-cyan-300">
                    <Check className="w-5 h-5" />
                  </span>
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-wide">
                      ONE UNIFIED WORKFLOW
                    </h3>
                    <span className="text-xs font-mono text-cyan-300">Void Vault Closed-Loop Architecture</span>
                  </div>
                </div>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700/60 font-semibold">
                  1 Sovereign Binary
                </span>
              </div>

              <div className="space-y-4">
                {solutions.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-cyan-800/30">
                    <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700/60 flex items-center justify-center shrink-0 text-xs font-mono font-bold mt-0.5">
                      ✓
                    </span>
                    <div>
                      <h4 className="text-sm font-semibold text-white">{item.title}</h4>
                      <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{item.desc}</p>
                      <span className="text-[11px] font-mono text-cyan-300 font-medium mt-1 inline-block">★ {item.sub}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-cyan-800/40 flex items-center justify-between text-xs font-mono text-cyan-300 font-semibold">
              <span>Recovery + Sanitization + Verification + Audit</span>
            </div>
          </div>

        </div>

        {/* Workflow Summary Callout */}
        <div className="mt-12 p-5 rounded-xl bg-slate-900/60 border border-slate-800 text-center max-w-2xl mx-auto">
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            <strong className="text-white font-semibold">Why bring them together?</strong> In digital forensic science, you cannot legally certify that data was sanitized without attempting to recover it. The offensive carver IS the proof engine for defensive sanitization.
          </p>
        </div>

      </div>
    </section>
  );
}
