import React, { useState } from 'react';
import { siteConfig } from '../config/siteConfig';
import { GlowingEffect } from './ui/glowing-effect';
import { Play, Monitor, ExternalLink, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

export default function LiveDemo() {
  const [isPlaying, setIsPlaying] = useState(false);

  const workflowSteps = [
    { step: "1", title: "Device Discovery", desc: "WMI detects NVMe, SATA, USB media and locks host boot drive (PhysicalDrive0)" },
    { step: "2", title: "Safety Validation", desc: "3-tier hardware interlock verifies UAC elevation & typed alphanumeric confirmation" },
    { step: "3", title: "Direct Operation", desc: "Unbuffered writes stream 17 wiping standards or BGC forensic file carving" },
    { step: "4", title: "Adversarial Verify", desc: "Deep carver re-scans sanitized sectors confirming exactly 0 residual files" },
    { step: "5", title: "BSA 2023 Audit", desc: "Append-only SHA-256 Merkle chain seals court-admissible electronic evidence" }
  ];

  return (
    <section id="demo" className="py-20 md:py-28 border-t border-white/[0.04] bg-[#050505] relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-cyan-500/5 blur-[130px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-mono font-semibold tracking-widest text-cyan-400 uppercase">
            06 — LIVE EVALUATION DEMONSTRATION
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mt-3 mb-4 tracking-tight">
            The Prototype is Not a Concept.
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
            Watch the complete 60-second live battle demonstration executed on physical flash storage media with direct unbuffered Win32 I/O.
          </p>
        </div>

        {/* Video Player / Interactive Demonstration Showcase */}
        <div className="max-w-5xl mx-auto mb-12">
          <div className="group relative rounded-2xl bg-[#070A10] border border-white/[0.08] shadow-2xl overflow-hidden">
            <GlowingEffect hoverLiquid breathe spread={45} proximity={65} />

            {/* Top Frame Header */}
            <div className="px-4 py-3 bg-white/[0.02] border-b border-white/[0.06] flex items-center justify-between text-xs font-mono relative z-10">
              <div className="flex items-center gap-2 text-neutral-300">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span>CLI Option 7: 60-Second Automated Evaluator Battle Demo</span>
              </div>
              <span className="text-neutral-500 hidden sm:inline">127.0.0.1:5001 Direct IPC</span>
            </div>

            {/* Video Thumbnail / Active Embed */}
            <div className="relative aspect-video w-full bg-[#04060A] flex items-center justify-center overflow-hidden relative z-10">
              {!isPlaying ? (
                <>
                  {/* High Quality Background Graphic using Real Interface / Architecture */}
                  <img
                    src="/screenshots/erasure.png"
                    alt="Void Vault Live Demonstration"
                    className="w-full h-full object-cover opacity-30 group-hover:opacity-45 transition duration-500 filter blur-[2px] group-hover:blur-none scale-105"
                  />
                  
                  {/* Subtle Gradient Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-black/70" />

                  {/* Centered Play Button & Prompt */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center z-10">
                    <button
                      onClick={() => {
                        if (siteConfig.links.demoVideoEmbed) {
                          setIsPlaying(true);
                        } else {
                          window.open(siteConfig.links.demoVideoUrl, '_blank');
                        }
                      }}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center shadow-2xl shadow-cyan-500/40 hover:scale-110 active:scale-95 transition-all duration-300 border-2 border-white/20 cursor-pointer"
                      aria-label="Play demonstration video"
                    >
                      <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-white ml-1" />
                    </button>

                    <h3 className="text-lg sm:text-2xl font-bold text-white mt-5 mb-1.5">
                      Watch the Complete Forensic Workflow
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-300 max-w-lg font-light leading-relaxed">
                      See classified test file injection, standard OS Shift+Delete failure, adversarial deep carving proof, Smart Secure Wipe™ (67s), and court-admissible BSA 2023 certification.
                    </p>

                    <div className="mt-5 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-cyan-300 backdrop-blur-md">
                      <span>Video Demonstration:</span>
                      <span className="text-neutral-400 truncate max-w-[220px]">{siteConfig.links.demoVideoUrl}</span>
                    </div>
                  </div>
                </>
              ) : (
                <iframe
                  src={siteConfig.links.demoVideoEmbed || siteConfig.links.demoVideoUrl}
                  title="Void Vault Live Demonstration"
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>

            {/* Bottom Actions Bar */}
            <div className="p-4 sm:p-5 bg-white/[0.01] border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono relative z-10">
              <div className="flex items-center gap-2 text-neutral-400">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>152/152 Test Scenarios Passing • 0 Failures</span>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={siteConfig.links.demoVideoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-200 transition-colors border border-white/10"
                >
                  <span>Open Video in New Tab</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <a
                  href="https://github.com/nishchaydev/sih2026"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/40 transition-colors"
                >
                  <span>Run CLI Option 7</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

          </div>
        </div>

        {/* 5-Step Evaluation Sequence Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {workflowSteps.map((ws) => (
            <div
              key={ws.step}
              className="group relative p-5 rounded-2xl bg-white/[0.01] border border-white/[0.06] hover:bg-white/[0.02] transition-all duration-300"
            >
              <GlowingEffect hoverLiquid breathe spread={30} proximity={45} />
              <div className="relative z-10">
                <div className="w-7 h-7 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 font-mono text-xs font-bold flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  {ws.step}
                </div>
                <h4 className="text-sm font-bold text-white mb-1 group-hover:text-cyan-300 transition-colors">
                  {ws.title}
                </h4>
                <p className="text-xs text-neutral-400 font-light leading-relaxed">
                  {ws.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
