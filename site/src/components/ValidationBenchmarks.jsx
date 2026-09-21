import React, { useState } from 'react';
import { benchmarksConfig } from '../config/benchmarks';
import { GlowingEffect } from './ui/glowing-effect';
import { ChevronDown, ChevronUp, Cpu, HardDrive, CheckCircle2, ShieldAlert, BarChart3, HelpCircle } from 'lucide-react';

export default function ValidationBenchmarks() {
  const [methodologyOpen, setMethodologyOpen] = useState(false);

  return (
    <section id="benchmarks" className="py-20 md:py-28 border-t border-white/[0.04] bg-[#050505] relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-orange-500/5 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono font-semibold tracking-widest text-orange-500 uppercase">
            10 — EMPIRICAL BENCHMARKS & PHYSICAL METRICS
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mt-3 mb-4 tracking-tight">
            {benchmarksConfig.title}
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
            {benchmarksConfig.subtitle}
          </p>
        </div>

        {/* 6 Large Typography Benchmark Metric Cards with Orbit GlowingEffect */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {benchmarksConfig.keyMetrics.map((metric, idx) => (
            <div
              key={idx}
              className="group relative p-6 sm:p-7 rounded-2xl border border-white/[0.06] bg-white/[0.01] hover:bg-white/[0.02] transition-all duration-300 flex flex-col justify-between shadow-2xl"
            >
              <GlowingEffect hoverLiquid breathe spread={45} proximity={60} />

              <div className="relative z-10">
                {/* Large Metric Display */}
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl sm:text-5xl font-black tracking-tight text-white font-mono">
                    {metric.value}
                  </span>
                  <span className="text-xs sm:text-sm font-mono text-orange-500 uppercase font-semibold">
                    {metric.unit}
                  </span>
                </div>

                <h3 className="text-base font-bold text-neutral-100 mb-1.5">
                  {metric.label}
                </h3>
                <p className="text-xs text-neutral-300 leading-relaxed mb-4 font-light">
                  {metric.description}
                </p>
              </div>

              <div className="pt-3 border-t border-white/[0.06] relative z-10">
                <span className="text-[11px] font-mono text-orange-300 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                  {metric.comparison}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Expandable Scientific Methodology Drawer */}
        <div className="max-w-4xl mx-auto rounded-2xl border border-white/[0.08] bg-white/[0.01] overflow-hidden shadow-2xl backdrop-blur-md">
          <button
            onClick={() => setMethodologyOpen(!methodologyOpen)}
            className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-white/[0.03] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <HelpCircle className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-bold text-white tracking-wide font-mono">
                Hardware Testbed & Measurement Methodology
              </span>
              <span className="text-[10px] font-mono text-orange-300 bg-white/5 px-2 py-0.5 rounded border border-white/10 hidden sm:inline">
                Reproducible Laboratory Protocols
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
              <span>{methodologyOpen ? "Collapse Protocol" : "Expand Protocol"}</span>
              {methodologyOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>

          {methodologyOpen && (
            <div className="px-6 pb-6 pt-2 border-t border-white/[0.06] text-xs font-light text-neutral-300 space-y-4 animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <h4 className="font-mono text-xs font-bold text-white mb-1">Host Hardware Rig</h4>
                  <ul className="space-y-1 font-mono text-[11px] text-neutral-400">
                    <li>• Intel Core i7-13700K (16 Cores, 24 Threads)</li>
                    <li>• 32 GB DDR5-5600 Dual-Channel RAM</li>
                    <li>• Samsung 990 Pro 1TB NVMe PCIe 4.0</li>
                    <li>• SanDisk Extreme PRO USB 3.2 Gen 2x2</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <h4 className="font-mono text-xs font-bold text-white mb-1">Operating Environment</h4>
                  <ul className="space-y-1 font-mono text-[11px] text-neutral-400">
                    <li>• Windows 11 Enterprise x86-64 (Build 22631)</li>
                    <li>• Pure Rust 2021 edition with windows-rs 0.61</li>
                    <li>• LLVM opt-level=3, lto=fat, codegen-units=1</li>
                    <li>• Administrator UAC elevation enforced</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
