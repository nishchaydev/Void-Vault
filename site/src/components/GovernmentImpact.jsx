import React from 'react';
import { governmentImpactConfig } from '../config/governmentImpact';
import { GlowingEffect } from './ui/glowing-effect';
import { ShieldAlert, Search, Recycle, Server, Gavel, CheckCircle2, AlertTriangle, Building2, Lock } from 'lucide-react';

const iconMap = {
  ShieldAlert,
  SearchCheck: Search,
  Recycle,
  Server,
  Gavel
};

export default function GovernmentImpact() {
  const { ntroHighlight, pillars } = governmentImpactConfig;

  return (
    <section id="impact" className="py-20 md:py-28 border-t border-white/[0.04] bg-[#050505] relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-orange-500/5 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono font-semibold tracking-widest text-orange-500 uppercase">
            13 — STRATEGIC NATIONAL RESILIENCE & DEFENSE USE CASES
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mt-3 mb-4 tracking-tight">
            {governmentImpactConfig.title}
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
            {governmentImpactConfig.subtitle}
          </p>
        </div>

        {/* Highlighted Critical Callout: Potential Relevance to NTRO */}
        <div className="group relative mb-16 p-6 sm:p-8 rounded-2xl border border-white/[0.08] bg-[#070A10] shadow-2xl overflow-hidden">
          <GlowingEffect hoverLiquid breathe spread={55} proximity={75} />

          <div className="relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-6 border-b border-white/[0.06]">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-orange-950/70 text-orange-500 border border-orange-800/50">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-orange-500 block">
                    {ntroHighlight.badge}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-white tracking-wide">
                    {ntroHighlight.title}
                  </h3>
                </div>
              </div>
              <span className="text-xs font-mono text-orange-300 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                Sovereign Cyber Tooling
              </span>
            </div>

            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed mb-6 font-light">
              {ntroHighlight.context}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {ntroHighlight.capabilities.map((cap, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-orange-200 mb-1.5 flex items-center gap-1.5 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                      {cap.title}
                    </h4>
                    <p className="text-[11px] text-neutral-300 leading-relaxed font-light">
                      {cap.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Crucial Disclaimer */}
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.08] flex items-start gap-2.5 text-xs text-neutral-400 font-mono">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed font-light">
                <strong className="text-neutral-300">Technical Context Disclaimer:</strong> {ntroHighlight.disclaimer}
              </p>
            </div>
          </div>
        </div>

        {/* 5 Strategic National Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pillars.map((pillar) => {
            const Icon = iconMap[pillar.icon] || ShieldAlert;
            return (
              <div
                key={pillar.id}
                className="group relative p-6 rounded-2xl border border-white/[0.06] bg-white/[0.01] hover:bg-white/[0.02] transition-all duration-300 flex flex-col justify-between shadow-2xl"
              >
                <GlowingEffect hoverLiquid breathe spread={40} proximity={55} />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 rounded-xl border border-white/10 bg-white/5 text-orange-300">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono text-neutral-500 uppercase">
                      Pillar 0{pillar.id}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-2 group-hover:text-orange-300 transition-colors">
                    {pillar.title}
                  </h3>

                  <p className="text-xs text-neutral-300 leading-relaxed mb-6 font-light">
                    {pillar.desc}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/[0.06] space-y-1 text-[11px] font-mono relative z-10">
                  <div className="flex items-center justify-between text-neutral-400">
                    <span>Target Entities:</span>
                    <span className="text-neutral-300 font-medium truncate max-w-[170px] text-right">
                      {pillar.entities}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-neutral-400">
                    <span>Outcome:</span>
                    <span className="text-orange-300 font-semibold truncate max-w-[170px] text-right">
                      {pillar.outcome}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
