
import React from 'react';
import { SparklesCore } from './ui/sparkles';

export function Hero() {
  return (
    <section className="relative flex min-h-[70vh] flex-col items-center justify-center px-4 pt-20 pb-16 text-center">
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        <SparklesCore background="transparent" minSize={0.4} maxSize={1} particleDensity={20} className="w-full h-full opacity-30" particleColor="#38BDF8" />
      </div>
      <div className="relative z-10 flex flex-col items-center">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-mono text-cyan-400">
          <span>SIH 2026 • PS SIH26149 (NTRO) • Team eMitra (146878)</span>
        </div>
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-b from-[#0e1726] to-[#050911] border border-cyan-500/30 flex items-center justify-center shadow-2xl shadow-cyan-950/80 mx-auto">
            <svg className="w-11 h-11 text-cyan-400 drop-shadow-[0_0_12px_rgba(6,182,212,0.6)]" viewBox="0 0 40 40" fill="none"><path d="M6 8L20 34L34 8H26L20 22L14 8H6Z" fill="currentColor"/><path d="M13 8L20 20L27 8H22L20 12L18 8H13Z" fill="#38bdf8" opacity="0.9"/></svg>
          </div>
        </div>
        <h1 className="mb-4 text-5xl sm:text-7xl font-bold tracking-[0.2em] text-white">
          <span className="inline-block drop-shadow-[0_0_15px_rgba(56,189,248,0.3)]">VOID VAULT</span>
        </h1>
        <p className="mb-8 text-xl sm:text-2xl font-light text-cyan-400/90 tracking-wide">
          Secure Today. Recover Tomorrow.
        </p>
        <p className="mb-10 max-w-2xl text-base sm:text-lg text-neutral-400 font-light leading-relaxed">
          Evidence hub for PS SIH26149. Documentation, diagrams, sample artifacts, and validation evidence. No source code.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
          <a href="#demo" className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-400 text-black font-semibold tracking-wide hover:brightness-110 transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)]">
            Watch Demo
          </a>
          <a href="#ps-matrix" className="w-full sm:w-auto px-8 py-3.5 rounded-lg border border-white/10 bg-white/[0.02] text-neutral-300 font-medium hover:bg-white/[0.05] transition-all">
            PS Matrix
          </a>
          <a href="#pack" className="w-full sm:w-auto px-8 py-3.5 rounded-lg border border-white/10 bg-white/[0.02] text-neutral-300 font-medium hover:bg-white/[0.05] transition-all">
            Evaluator Pack
          </a>
        </div>
        
        <div className="flex flex-wrap justify-center gap-3 text-sm font-mono border-t border-white/10 pt-8 w-full max-w-3xl">
          <div className="px-4 py-2 bg-white/[0.02] rounded-md border border-white/5 text-neutral-400">
            <span className="text-cyan-400 mr-2">[Tests]</span>pending
          </div>
          <div className="px-4 py-2 bg-white/[0.02] rounded-md border border-white/5 text-neutral-400">
            <span className="text-cyan-400 mr-2">[Standards]</span>5 aligned
          </div>
          <div className="px-4 py-2 bg-white/[0.02] rounded-md border border-white/5 text-neutral-400">
            <span className="text-cyan-400 mr-2">[Modules]</span>3+2
          </div>
          <div className="px-4 py-2 bg-white/[0.02] rounded-md border border-white/5 text-neutral-400">
            <span className="text-cyan-400 mr-2">[Papers]</span>pending
          </div>
        </div>
      </div>
    </section>
  );
}
export default Hero;
