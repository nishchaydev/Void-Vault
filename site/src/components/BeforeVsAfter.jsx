import React from 'react';
import { XCircle, CheckCircle, ArrowRight, ArrowDown } from 'lucide-react';

export default function BeforeVsAfter() {
  const comparisons = [
    {
      before: "Multiple Disjointed Tools",
      beforeDetail: "Juggling 3–5 foreign utilities (DBAN, Blancco, Autopsy, PhotoRec) with incompatible formats.",
      after: "Unified Sovereign Platform",
      afterDetail: "Single memory-safe Rust binary executing erasure, deep carving, and court export in one cockpit."
    },
    {
      before: "Manual or Unverified Sanitization",
      beforeDetail: "Relying on basic OS overwrites that leave up to 67% residual data on wear-leveled SSD NAND flash.",
      after: "Automated Hardware Controller Purge",
      afterDetail: "Native NVMe Sanitize Crypto Erase & DSM TRIM with immediate closed-loop carver verification."
    },
    {
      before: "Fragmented Logs & Repealed Acts",
      beforeDetail: "Text logs and fragile paper records still citing repealed Section 65B of the Indian Evidence Act.",
      after: "Tamper-Evident Merkle Ledger",
      afterDetail: "Append-only SHA-256 hash chaining producing Section 63 BSA 2023 court-admissible certificates."
    },
    {
      before: "Complex & Fragile Multi-Hour Workflow",
      beforeDetail: "Hours of manual scripting, risky drive selection, and high likelihood of operator error.",
      after: "Guided 5-Click Safe Workflow",
      afterDetail: "3-tier safety interlock auto-protects host boot drives; Smart Secure Wipe executes in 67 seconds."
    },
    {
      before: "Unclear Chain of Custody",
      beforeDetail: "Zero cryptographic link between media acquisition, forensic extraction, and eventual erasure.",
      after: "End-to-End Traceable Operations",
      afterDetail: "ISO/IEC 27037:2012 JSON/CSV case manifests sealed with immutable SHA-256 ground truth digests."
    }
  ];

  return (
    <section className="py-20 md:py-28 border-t border-white/5 bg-[#07090E] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono font-semibold tracking-widest text-orange-500 uppercase">
            15 — PARADIGM SHIFT
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3 mb-4 tracking-tight">
            Before vs. After Void Vault
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            A direct comparative analysis of traditional forensic operations versus Void Vault's integrated architecture.
          </p>
        </div>

        {/* Comparison Table / Cards */}
        <div className="space-y-4 max-w-5xl mx-auto">
          {comparisons.map((item, idx) => (
            <div
              key={idx}
              className="grid grid-cols-1 md:grid-cols-12 rounded-2xl border border-slate-800/90 overflow-hidden shadow-lg"
            >
              {/* BEFORE (Left) */}
              <div className="md:col-span-5 p-5 sm:p-6 bg-red-950/10 border-b md:border-b-0 md:border-r border-slate-800/80 flex items-start gap-3.5">
                <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-mono uppercase font-bold text-red-400 block mb-1">
                    BEFORE (LEGACY WORKFLOW)
                  </span>
                  <h4 className="text-sm font-bold text-slate-200 mb-1">{item.before}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.beforeDetail}</p>
                </div>
              </div>

              {/* TRANSITION INDICATOR (Center) */}
              <div className="md:col-span-2 p-2 bg-[#090D15] flex items-center justify-center border-b md:border-b-0 md:border-r border-slate-800/80">
                <span className="p-2 rounded-full bg-slate-900 border border-slate-700 text-orange-500 text-xs font-mono font-bold flex items-center gap-1">
                  <span className="hidden md:inline">→</span>
                  <span className="md:hidden">↓</span>
                </span>
              </div>

              {/* VOID VAULT (Right) */}
              <div className="md:col-span-5 p-5 sm:p-6 bg-orange-950/20 flex items-start gap-3.5">
                <CheckCircle className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] font-mono uppercase font-bold text-orange-300 block mb-1">
                    VOID VAULT UNIFIED WORKFLOW
                  </span>
                  <h4 className="text-sm font-bold text-white mb-1">{item.after}</h4>
                  <p className="text-xs text-slate-300 leading-relaxed">{item.afterDetail}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
