import React from 'react';
import { usps } from '../config/usps';
import { GlowingEffect } from './ui/glowing-effect';
import { HardDrive, Search, ShieldCheck, CheckCircle2, Link2, Layers, ArrowRight } from 'lucide-react';

const iconMap = {
  HardDrive,
  Search,
  ShieldCheck,
  CheckCircle2,
  Link2,
  Layers
};

export default function USPs() {
  return (
    <section id="usps" className="py-20 md:py-28 border-t border-white/[0.04] bg-[#050505] relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-orange-500/5 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono font-semibold tracking-widest text-orange-500 uppercase">
            04 — TECHNICAL DIFFERENTIATORS & USPs
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mt-3 mb-4 tracking-tight">
            What makes Void Vault different?
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
            Engineered from first principles in memory-safe Rust to solve the deep hardware controller and evidentiary challenges where standard software falls short.
          </p>
        </div>

        {/* 6 Prominent USP Cards with Orbit GlowingEffect */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {usps.map((usp) => {
            const Icon = iconMap[usp.icon] || HardDrive;
            return (
              <div
                key={usp.id}
                className="group relative p-6 sm:p-7 rounded-2xl border border-white/[0.06] bg-white/[0.01] hover:bg-white/[0.02] transition-all duration-300 flex flex-col justify-between shadow-2xl"
              >
                <GlowingEffect hoverLiquid breathe spread={45} proximity={60} />

                <div className="relative z-10">
                  {/* Card Header: Icon & Tag */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="p-3 rounded-xl border border-white/10 bg-white/5 text-orange-500 group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono font-semibold uppercase px-2.5 py-1 rounded bg-white/5 text-orange-300 border border-white/10">
                      {usp.tag}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="text-lg font-bold text-white tracking-wide mb-1.5 group-hover:text-orange-300 transition-colors">
                    {usp.title}
                  </h3>
                  <p className="text-xs font-medium text-orange-500/90 mb-3 font-mono">
                    {usp.subtitle}
                  </p>

                  {/* Body Description */}
                  <p className="text-xs text-neutral-300 leading-relaxed mb-6 font-light">
                    {usp.description}
                  </p>
                </div>

                {/* Technical Specs List */}
                <div className="pt-4 border-t border-white/[0.06] space-y-2 relative z-10">
                  {usp.specs.map((spec, sIdx) => (
                    <div key={sIdx} className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-neutral-400">{spec.label}</span>
                      <span className="text-neutral-200 font-medium truncate max-w-[170px] text-right">
                        {spec.val}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
