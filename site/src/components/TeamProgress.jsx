import React from 'react';
import { timelineStages } from '../config/timeline';
import { GlowingEffect } from './ui/glowing-effect';
import { CheckCircle2, CircleDot, Clock, ArrowRight, Calendar } from 'lucide-react';

export default function TeamProgress() {
  return (
    <section className="py-20 md:py-28 border-t border-white/[0.04] bg-[#050505] relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-orange-500/5 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono font-semibold tracking-widest text-orange-500 uppercase">
            11 — ENGINEERING ROADMAP & TEAM PROGRESS
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mt-3 mb-4 tracking-tight">
            From Research to Working Appliance
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
            The systematic evolution of Void Vault from initial NTRO PS-26149 problem analysis to a fully verified, 152-test passing software appliance.
          </p>
        </div>

        {/* Timeline Grid */}
        <div className="relative border-l border-white/[0.08] ml-4 md:ml-32 space-y-8 pl-6 md:pl-10">
          {timelineStages.map((stage) => {
            const isCompleted = stage.status === "Completed";

            return (
              <div key={stage.step} className="relative group">
                {/* Timeline node icon */}
                <div className="absolute -left-[33px] md:-left-[49px] top-2 flex items-center justify-center">
                  {isCompleted ? (
                    <div className="w-6 h-6 rounded-full bg-[#050505] border-2 border-orange-500 flex items-center justify-center text-orange-500 shadow-md shadow-orange-500/20">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-orange-950 border-2 border-orange-500 flex items-center justify-center text-orange-200 shadow-lg shadow-orange-500/30 animate-pulse">
                      <CircleDot className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>

                {/* Date indicator on left for desktop */}
                <div className="hidden md:block absolute -left-36 top-2 w-24 text-right">
                  <span className="text-xs font-mono font-semibold text-neutral-400">
                    {stage.date}
                  </span>
                </div>

                {/* Milestone Content Box with Orbit GlowingEffect */}
                <div className="group relative p-5 sm:p-6 rounded-2xl border border-white/[0.06] bg-white/[0.01] hover:bg-white/[0.02] transition-all duration-300 shadow-xl">
                  <GlowingEffect hoverLiquid breathe spread={35} proximity={50} />

                  <div className="relative z-10">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-orange-500">
                          PHASE {stage.step}
                        </span>
                        <span className="text-neutral-600">•</span>
                        <h3 className="text-base font-bold text-white group-hover:text-orange-300 transition-colors">
                          {stage.title}
                        </h3>
                      </div>

                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase ${
                        isCompleted 
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60' 
                          : 'bg-orange-950/60 text-orange-500 border border-orange-800/60'
                      }`}>
                        {stage.status}
                      </span>
                    </div>

                    <p className="text-xs text-neutral-300 leading-relaxed font-light mb-4">
                      {stage.description}
                    </p>

                    <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-neutral-400">
                      <span>Deliverable: <strong className="text-neutral-200">{stage.deliverable}</strong></span>
                      <span className="md:hidden text-neutral-500">{stage.date}</span>
                    </div>
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
