import React from 'react';
import { siteConfig } from '../config/siteConfig';
import { Play, Monitor, BookOpen, Github, Shield, ArrowUpRight } from 'lucide-react';

export default function FinalCTA() {
  return (
    <section className="py-24 md:py-36 border-t border-white/5 bg-[#05070B] relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-cyan-600/10 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        
        {/* Five Core Pillars Marquee / Banner */}
        <div className="inline-flex flex-wrap items-center justify-center gap-2 sm:gap-4 px-4 py-2 rounded-full bg-slate-900/90 border border-slate-700/80 mb-8 text-[11px] font-mono tracking-widest text-cyan-300 uppercase shadow-inner">
          <span>FORENSICS</span>
          <span className="text-slate-600">•</span>
          <span>SANITIZATION</span>
          <span className="text-slate-600">•</span>
          <span>RECOVERY</span>
          <span className="text-slate-600">•</span>
          <span>VERIFICATION</span>
          <span className="text-slate-600">•</span>
          <span>TRUST</span>
        </div>

        {/* Large Statement */}
        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-4xl mx-auto mb-6">
          Data doesn't simply disappear.
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-cyan-300 to-cyan-300 mt-2">
            Void Vault makes its lifecycle verifiable.
          </span>
        </h2>

        <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto mb-10 leading-relaxed">
          From defense-grade controller-level sanitization to deep adversarial carving and BSA 2023 Section 63 cryptographic certification.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 mb-12">
          <a
            href="#demo"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 shadow-xl shadow-cyan-950/60 border border-cyan-400/40 transition-all hover:scale-[1.02]"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Watch Demo</span>
          </a>

          <a
            href="#prototype"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700 transition-colors"
          >
            <Monitor className="w-4 h-4 text-cyan-400" />
            <span>Explore Prototype</span>
          </a>

          <a
            href="#research"
            className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors"
          >
            <BookOpen className="w-4 h-4 text-slate-400" />
            <span>View Research</span>
          </a>

          <a
            href={siteConfig.links.github}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl text-sm font-medium text-cyan-300 hover:text-cyan-200 bg-cyan-950/40 border border-cyan-800/60 hover:border-cyan-600 transition-colors"
          >
            <Github className="w-4 h-4" />
            <span>GitHub</span>
          </a>
        </div>

        {/* Closing Tag */}
        <div className="text-xs font-mono text-slate-400">
          Smart India Hackathon 2026 · Problem Statement PS-26149 (NTRO) · Team eMitra
        </div>

      </div>
    </section>
  );
}
