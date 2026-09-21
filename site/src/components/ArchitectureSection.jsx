import React, { useState } from 'react';
import { architectureConfig } from '../config/architecture';
import { Download, ExternalLink, Cpu, HardDrive, Shield, CheckCircle2, Lock, ArrowDown, FileText, Code2, Sparkles } from 'lucide-react';

export default function ArchitectureSection({ onOpenLightbox }) {
  const [selectedLayer, setSelectedLayer] = useState(0);

  return (
    <section id="architecture" className="py-20 md:py-28 border-t border-white/5 bg-[#07090E] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-mono font-semibold tracking-widest text-orange-500 uppercase">
            07 — SYSTEM ARCHITECTURE
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3 mb-4 tracking-tight">
            Inside Void Vault
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            {architectureConfig.subtitle}
          </p>
        </div>

        {/* Interactive Architecture Blueprint & Layer Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16 items-start">
          
          {/* Left Column: Interactive Layer Flow */}
          <div className="lg:col-span-5 space-y-2.5">
            <div className="flex items-center justify-between pb-2 mb-1 border-b border-slate-800">
              <span className="text-xs font-mono text-orange-500 uppercase font-semibold">
                SYSTEM EXECUTION SPINE
              </span>
              <span className="text-[11px] font-mono text-slate-400">7 Connected Layers</span>
            </div>

            {architectureConfig.layers.map((layer, idx) => {
              const isSelected = selectedLayer === idx;
              return (
                <div key={layer.step} className="relative">
                  <button
                    onClick={() => setSelectedLayer(idx)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'bg-orange-950/50 border-orange-500/70 shadow-lg shadow-orange-950/40'
                        : 'bg-slate-900/40 border-slate-800/80 hover:bg-slate-850 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${isSelected ? 'bg-orange-900 text-orange-200' : 'bg-slate-800 text-slate-400'}`}>
                          {layer.step}
                        </span>
                        <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                          {layer.title}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        {layer.layer}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {layer.description}
                    </p>
                  </button>

                  {idx < architectureConfig.layers.length - 1 && (
                    <div className="flex justify-center my-0.5">
                      <ArrowDown className="w-3 h-3 text-slate-600" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right Column: Layer Detailed Breakdown & Visual Diagram Box */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            
            {/* Active Selected Layer Deep Dive */}
            <div className="p-6 rounded-2xl bg-[#0C121E] border border-slate-800 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                  <span className="text-xs font-mono text-orange-300 font-semibold uppercase">
                    Layer {architectureConfig.layers[selectedLayer].step} Focus
                  </span>
                </div>
                <span className="text-xs font-mono text-slate-400">
                  {architectureConfig.layers[selectedLayer].layer}
                </span>
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                {architectureConfig.layers[selectedLayer].title}
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-6">
                {architectureConfig.layers[selectedLayer].description}
              </p>

              <h4 className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold mb-2">
                Key Primitives & Direct APIs
              </h4>
              <div className="flex flex-wrap gap-2">
                {architectureConfig.layers[selectedLayer].tags.map((tag, tIdx) => (
                  <span
                    key={tIdx}
                    className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-700/80 text-xs font-mono text-orange-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Architectural SVG Preview & Download Card */}
            <div className="p-6 rounded-2xl bg-[#090D15] border border-slate-800/90 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-sm font-bold text-white">Full System Architecture Diagram</h4>
                  <p className="text-xs text-slate-400 font-mono">PS-26149 · Rust 2021 + Tauri v2 · Windows x86-64 Win32 FFI</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenLightbox && onOpenLightbox(architectureConfig.diagramUrl, "Void Vault — System Architecture", "Low-level direct I/O pipeline")}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-200 border border-slate-700 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-orange-500" />
                    <span>View Diagram</span>
                  </button>

                  <a
                    href={architectureConfig.diagramUrl}
                    download="voidvault-architecture.svg"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-950/60 hover:bg-orange-900/60 text-xs font-mono text-orange-300 border border-orange-700/60 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download SVG</span>
                  </a>
                </div>
              </div>

              {/* Diagram Thumbnail */}
              <div 
                className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950/80 p-2 cursor-pointer group"
                onClick={() => onOpenLightbox && onOpenLightbox(architectureConfig.diagramUrl, "Void Vault — System Architecture", "Low-level direct I/O pipeline")}
              >
                <img
                  src={architectureConfig.diagramUrl}
                  alt="Void Vault Architecture Schematic"
                  className="w-full h-48 sm:h-64 object-contain bg-[#14202B] rounded-lg group-hover:scale-[1.01] transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                  <span className="px-3 py-1.5 rounded-full bg-slate-900/90 border border-white/20 text-xs font-medium text-white shadow-lg">
                    Click to Open Full Diagram Viewer
                  </span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Technology Stack Grid */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#090E17] border border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 border-b border-slate-800 mb-6">
            <div>
              <span className="text-xs font-mono font-semibold tracking-wider text-orange-500 uppercase">
                ENGINEERED WITH MODERN TOOLS
              </span>
              <h3 className="text-xl font-bold text-white mt-1">Core Technology Stack</h3>
            </div>
            <span className="text-xs font-mono text-slate-400">Zero Third-Party Kernel Drivers</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {architectureConfig.techStack.map((tech) => (
              <div
                key={tech.name}
                className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 hover:border-orange-500/40 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-semibold text-orange-300 px-2 py-0.5 rounded bg-orange-950/70 border border-orange-800/60">
                    {tech.badge}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white mb-0.5">{tech.name}</h4>
                <p className="text-[11px] text-slate-400 leading-snug">{tech.role}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
