import React from 'react';
import { diagramsList } from '../config/diagrams';
import { GlowingEffect } from './ui/glowing-effect';
import { Eye, Download, Cpu, ExternalLink } from 'lucide-react';

export default function DiagramsLibrary({ onOpenLightbox }) {
  return (
    <section id="diagrams" className="py-20 md:py-28 border-t border-white/[0.04] bg-[#050505] relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-cyan-500/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-mono font-semibold tracking-widest text-cyan-400 uppercase">
            08 — TECHNICAL ARCHITECTURAL SCHEMATICS
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mt-3 mb-4 tracking-tight">
            System Schematics Library
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
            Examine the individual architectural subsystems, unbuffered direct I/O kernel boundaries, forensic carving pipelines, and hardware safety mechanisms. Genuine vector schematics with zero slide captures.
          </p>
        </div>

        {/* 7 Dedicated Diagram Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {diagramsList.map((diagram) => (
            <div
              key={diagram.id}
              className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.01] hover:bg-white/[0.02] transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-2xl"
            >
              <GlowingEffect hoverLiquid breathe spread={45} proximity={64} />

              <div className="relative z-10">
                {/* Diagram Preview Box */}
                <div
                  className="relative aspect-video w-full bg-[#070A10] overflow-hidden cursor-pointer border-b border-white/[0.06] flex items-center justify-center p-3 group/preview"
                  onClick={() => onOpenLightbox && onOpenLightbox(diagram.fullImage, diagram.title, diagram.details)}
                >
                  <img
                    src={diagram.thumbnail}
                    alt={diagram.title}
                    className="w-full h-full object-contain group-hover/preview:scale-[1.02] transition duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-[#050505]/40 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center pointer-events-none backdrop-blur-[2px]">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-900/90 border border-white/20 text-xs text-white font-medium shadow-xl">
                      <Eye className="w-3.5 h-3.5 text-cyan-400" />
                      <span>View Fullscreen Schematic</span>
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 sm:p-6">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white/5 text-cyan-300 border border-white/10">
                      {diagram.category}
                    </span>
                    <span className="text-[10px] font-mono text-neutral-500 uppercase">
                      {diagram.type}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                    {diagram.title}
                  </h3>
                  <p className="text-xs text-neutral-300 leading-relaxed mb-3">
                    {diagram.description}
                  </p>
                  <p className="text-[11px] text-neutral-400 leading-snug font-light">
                    {diagram.details}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 bg-white/[0.02] border-t border-white/[0.06] flex items-center justify-between gap-2 relative z-10">
                <button
                  onClick={() => onOpenLightbox && onOpenLightbox(diagram.fullImage, diagram.title, diagram.details)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-neutral-200 transition-colors cursor-pointer border border-white/10"
                >
                  <Eye className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Inspect</span>
                </button>

                <a
                  href={diagram.downloadUrl}
                  download
                  className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 text-xs font-medium text-cyan-300 border border-cyan-800/60 transition-colors"
                  title="Download Vector SVG"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>SVG</span>
                </a>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
