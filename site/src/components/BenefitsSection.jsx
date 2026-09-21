import React from 'react';
import { Shield, Search, Layers, Lock, DollarSign, Leaf, CheckCircle2 } from 'lucide-react';

export default function BenefitsSection() {
  const benefits = [
    {
      category: "SECURITY",
      title: "Reduce Residual-Data Exposure",
      description: "Hardware-level NVMe Sanitize and DSM TRIM commands purge wear-leveled NAND flash and hidden over-provisioned sectors, eliminating physical chip-off data survivability.",
      icon: Shield,
      tag: "Zero-Remanence"
    },
    {
      category: "FORENSICS",
      title: "Improve Investigation Workflows",
      description: "Bifragment Gap Carving (BGC) reassembles split non-contiguous evidence while SIMD 256-bin BFD histograms classify headerless blocks with AST structure parsers.",
      icon: Search,
      tag: "82.4% Fragment Recovery"
    },
    {
      category: "OPERATIONAL",
      title: "Reduce Tool Fragmentation",
      description: "Consolidates 3–5 disconnected foreign tools into a single memory-safe Rust binary (<15MB) deployable on disconnected field laptops and bootable USB environments.",
      icon: Layers,
      tag: "Single Sovereign Binary"
    },
    {
      category: "AUDITABILITY",
      title: "Maintain Verifiable Operation History",
      description: "Local append-only SHA-256 Merkle ledger automatically emits Section 63 BSA 2023 evidence certificates with mathematical non-repudiation in judicial proceedings.",
      icon: Lock,
      tag: "BSA 2023 §63 Compliant"
    },
    {
      category: "ECONOMIC",
      title: "Reduce Dependency on Multiple Tools",
      description: "Eliminates recurring commercial license fees (e.g. ₹4,000 per drive charged by foreign vendors like Blancco), delivering massive fiscal savings for public sector agencies.",
      icon: DollarSign,
      tag: "₹0 Sovereign Licensing"
    },
    {
      category: "SUSTAINABILITY",
      title: "Support Secure Reuse of Hardware",
      description: "Enables certified storage reuse and redeployment across government departments rather than physical drive destruction, drastically curtailing toxic national e-waste.",
      icon: Leaf,
      tag: "E-Waste Reduction"
    }
  ];

  return (
    <section className="py-20 md:py-28 border-t border-white/5 bg-[#080C14] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono font-semibold tracking-widest text-cyan-400 uppercase">
            14 — MULTI-DIMENSIONAL IMPACT
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3 mb-4 tracking-tight">
            Strategic Benefits Matrix
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Evidence-based advantages across national security, investigative accuracy, public finance, and environmental sustainability.
          </p>
        </div>

        {/* 6 Category Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit, idx) => {
            const Icon = benefit.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-[#0C121D] border border-slate-800/90 hover:border-cyan-500/40 transition-colors flex flex-col justify-between shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 rounded-xl bg-slate-800 text-cyan-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                      {benefit.tag}
                    </span>
                  </div>

                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-1">
                    {benefit.category}
                  </span>
                  <h3 className="text-base font-bold text-white mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>

                <div className="pt-4 mt-6 border-t border-slate-800/80 flex items-center gap-1.5 text-xs font-mono text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Evidence-Backed Rationale</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
