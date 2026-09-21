import React from 'react';
import { siteConfig } from '../config/siteConfig';
import { GlowingEffect } from './ui/glowing-effect';
import { Github, ArrowUpRight, GitBranch, Terminal, ShieldCheck, CheckCircle2, Code2 } from 'lucide-react';

export default function GitHubSection() {
  return (
    <section className="py-20 md:py-28 border-t border-white/[0.04] bg-[#050505] relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-cyan-500/5 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Card Container */}
        <div className="group relative p-8 sm:p-12 rounded-3xl border border-white/[0.08] bg-[#070A10] shadow-2xl overflow-hidden text-center">
          <GlowingEffect hoverLiquid breathe spread={55} proximity={75} />

          <div className="relative z-10 max-w-4xl mx-auto">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 mb-6">
              <Github className="w-3.5 h-3.5 text-neutral-300" />
              <span className="text-xs font-mono font-medium text-neutral-300 uppercase">
                SOVEREIGN OPEN-SOURCE CODEBASE
              </span>
            </div>

            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
              Open the Vault. Inspect the Work.
            </h2>

            <p className="text-sm sm:text-base text-neutral-300 max-w-2xl mx-auto leading-relaxed mb-8 font-light">
              Judicial forensics and sovereign defense software must be completely transparent, auditable, and verifiable. Zero closed-source binary blobs. Zero untrusted external network sockets.
            </p>

            {/* Repo Stats & Badges Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto mb-10 text-xs font-mono">
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <span className="text-neutral-500 block text-[10px] uppercase">Language</span>
                <span className="text-white font-bold text-sm">100% Rust 2021</span>
              </div>
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <span className="text-neutral-500 block text-[10px] uppercase">Automated Tests</span>
                <span className="text-emerald-400 font-bold text-sm">152/152 Passing</span>
              </div>
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <span className="text-neutral-500 block text-[10px] uppercase">Kernel Drivers</span>
                <span className="text-cyan-300 font-bold text-sm">0 (Pure Win32 FFI)</span>
              </div>
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <span className="text-neutral-500 block text-[10px] uppercase">SCIF Deployment</span>
                <span className="text-white font-bold text-sm">100% Air-Gapped</span>
              </div>
            </div>

            {/* Primary GitHub CTA with Orbit GlowingEffect buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <a
                href={siteConfig.links.github}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full text-xs sm:text-sm font-mono font-medium text-white bg-gradient-to-r from-cyan-500 to-cyan-500 hover:from-cyan-400 hover:to-cyan-400 shadow-xl shadow-cyan-500/25 transition-all duration-300 relative group overflow-hidden"
              >
                <GlowingEffect hoverLiquid breathe spread={30} borderWidth={1.5} proximity={40} glow />
                <Github className="w-4 h-4" />
                <span className="relative z-10">Open GitHub Repository</span>
              </a>

              <a
                href="https://github.com/nishchaydev/sih2026/tree/main/docs"
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-xs sm:text-sm font-mono font-medium text-neutral-300 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300 relative group overflow-hidden"
              >
                <GlowingEffect hoverLiquid breathe spread={30} borderWidth={1.5} proximity={40} />
                <span className="relative z-10">Read Documentation & Specs</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>

            <span className="text-[11px] font-mono text-neutral-500 block mt-5">
              Repository URL: {siteConfig.links.github}
            </span>

          </div>
        </div>

      </div>
    </section>
  );
}
