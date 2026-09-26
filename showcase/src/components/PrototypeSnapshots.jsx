import React, { useState } from 'react';
import { screenshotsList } from '../config/screenshots';
import { GlowingEffect } from './ui/glowing-effect';
import { Maximize2, Shield, HardDrive, Terminal, CheckCircle2, ChevronRight, Eye } from 'lucide-react';

export default function PrototypeSnapshots({ onOpenLightbox }) {
  const [activeTab, setActiveTab] = useState("sanitization");

  const currentSnapshot = screenshotsList.find(s => s.id === activeTab) || screenshotsList[0];

  return (
    <section id="prototype" className="py-20 md:py-28 border-t border-white/[0.04] bg-[#050505] relative overflow-hidden">
      {/* Ambient center glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[320px] bg-cyan-500/5 blur-[130px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-mono font-semibold tracking-widest text-cyan-400 uppercase">
            05 — PRODUCTION DESKTOP PROTOTYPE
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mt-3 mb-4 tracking-tight">
            See Void Vault in Action
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
            Real software cockpit running as a native Tauri v2 desktop application on Windows 11 with zero-mock Win32 direct sector I/O and real-time telemetry.
          </p>
        </div>

        {/* Categories / Tabs */}
        <div className="flex items-center justify-start sm:justify-center overflow-x-auto pb-4 mb-8 gap-2 no-scrollbar">
          {screenshotsList.map((item) => {
            const isSelected = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-4 py-2 rounded-full text-xs font-mono font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-md shadow-cyan-500/10'
                    : 'bg-white/[0.03] text-neutral-400 border border-white/[0.08] hover:text-white hover:bg-white/[0.06]'
                }`}
              >
                {item.tab}
              </button>
            );
          })}
        </div>

        {/* Active Snapshot Viewer */}
        <div className="group relative rounded-2xl border border-white/[0.08] bg-[#070A10] overflow-hidden shadow-2xl">
          <GlowingEffect hoverLiquid breathe spread={50} proximity={70} />

          {/* Top Window Bar */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/[0.06] bg-white/[0.02] relative z-10">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-xs font-mono text-neutral-400 truncate max-w-[200px] sm:max-w-none">
                Void Vault Cockpit — {currentSnapshot.title}
              </span>
            </div>

            <button
              onClick={() => onOpenLightbox && onOpenLightbox(currentSnapshot.image, currentSnapshot.title, currentSnapshot.subtitle)}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono text-cyan-300 hover:text-cyan-200 bg-cyan-950/40 hover:bg-cyan-900/40 border border-cyan-800/60 rounded-full transition-colors cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Fullscreen</span>
            </button>
          </div>

          {/* Screenshot Display & Info Grid */}
          <div className="p-4 sm:p-6 lg:p-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Left: High-Res Screenshot with Click-to-Zoom */}
              <div 
                className="lg:col-span-8 relative group/screen rounded-xl overflow-hidden border border-white/10 bg-black/60 shadow-2xl cursor-pointer"
                onClick={() => onOpenLightbox && onOpenLightbox(currentSnapshot.image, currentSnapshot.title, currentSnapshot.subtitle)}
              >
                <img
                  src={currentSnapshot.image}
                  alt={currentSnapshot.title}
                  className="w-full h-auto object-contain transition duration-300 group-hover/screen:scale-[1.01]"
                  loading="lazy"
                />
                
                {/* Hover overlay hint */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/screen:opacity-100 transition-opacity flex items-center justify-center pointer-events-none backdrop-blur-[2px]">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-900/95 border border-white/20 text-xs font-medium text-white shadow-xl">
                    <Eye className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Click to Expand High-Resolution View</span>
                  </div>
                </div>

                {/* Real Asset Badge */}
                {currentSnapshot.isRealAsset && (
                  <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-md bg-[#050505]/90 border border-white/15 text-[10px] font-mono text-emerald-400 font-semibold shadow">
                    ✓ Verified Prototype Capture
                  </div>
                )}
              </div>

              {/* Right: Technical Feature Breakdown */}
              <div className="lg:col-span-4 flex flex-col justify-between">
                <div>
                  <div className="inline-block px-2.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800/60 mb-3">
                    MODULE DEEP DIVE
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2">
                    {currentSnapshot.title}
                  </h3>
                  <p className="text-xs text-neutral-300 mb-6 leading-relaxed font-light">
                    {currentSnapshot.subtitle}
                  </p>

                  <h4 className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-bold mb-3">
                    Engine Capabilities
                  </h4>
                  <ul className="space-y-2.5 mb-6">
                    {currentSnapshot.highlights.map((highlight, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-neutral-300 font-light">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Hardware/API Metadata Footer */}
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-[11px] font-mono text-neutral-400">
                  <span className="text-neutral-300 block mb-1 font-semibold">Low-Level Metadata:</span>
                  <span className="text-cyan-300/90 break-all">{currentSnapshot.technicalMetadata}</span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
