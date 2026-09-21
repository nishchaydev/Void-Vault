import React, { useState } from 'react';
import { GlowingEffect } from './ui/glowing-effect';
import { Eye, ExternalLink, Shield, HardDrive, Trash2, Search, FileCheck, Layers, X } from 'lucide-react';

const BASE = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');

const realScreenshots = [
  {
    title: "Forensic Command Cockpit (Dashboard)",
    module: "Core Dashboard",
    category: "System Overview",
    desc: "Real-time storage controller telemetry, active device enumeration, and quick-action module launchpad.",
    img: `${BASE}/screenshots/dashboard.png`,
    icon: HardDrive,
  },
  {
    title: "Module 1 — Secure Drive Eraser",
    module: "Module 1",
    category: "Drive Sanitization",
    desc: "Direct I/O hardware controller execution with 17 global sanitization standards and boot disk safety lockout.",
    img: `${BASE}/screenshots/erasure_live.png`,
    icon: Shield,
  },
  {
    title: "Module 2 — 4-Phase File Shredder",
    module: "Module 2",
    category: "File Shredding",
    desc: "Granular file extent shredding, NTFS Alternate Data Streams (ADS) enumeration, and MFT record zeroing.",
    img: `${BASE}/screenshots/shredder_live.png`,
    icon: Trash2,
  },
  {
    title: "Module 3 — Advanced File Carving & Recovery",
    module: "Module 3",
    category: "Carving & Forensics",
    desc: "Bifragment Gap Carving (BGC) engine, SIMD 256-bin Shannon entropy scoring, and structural AST validation.",
    img: `${BASE}/screenshots/recovery_live.png`,
    icon: Search,
  },
  {
    title: "Standards Compliance & Verification Matrix",
    module: "Assurance",
    category: "Compliance",
    desc: "Granular audit matrix for NIST SP 800-88 Rev. 2, IEEE 2883-2022, and ISO/IEC 27037:2012.",
    img: `${BASE}/screenshots/compliance_live.png`,
    icon: FileCheck,
  },
  {
    title: "Granular File & Folder Shredder (Cluster Slack Purge)",
    module: "Module 2",
    category: "Anti-Forensics",
    desc: "Target explorer selecting confidential directories, applying DoD 5220.22-M passes with MFT obfuscation.",
    img: `${BASE}/screenshots/shredder.png`,
    icon: Layers,
  },
];

export function ScreensGallery() {
  const [selectedImg, setSelectedImg] = useState(null);

  return (
    <section id="screens" className="py-20 md:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/[0.04]">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-xs font-mono font-semibold tracking-widest text-orange-500 uppercase">
          04 — INTERFACE & ARTIFACT EVIDENCE
        </span>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white mt-3 mb-4 tracking-tight">
          Live Operational Screenshots
        </h2>
        <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
          Captured directly from the running Void Vault desktop cockpit across all 3 core forensic modules and verification engines.
        </p>
      </div>

      {/* Grid of Real Screenshots */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {realScreenshots.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.01] hover:bg-white/[0.02] transition-all duration-300 overflow-hidden shadow-2xl flex flex-col justify-between"
            >
              <GlowingEffect hoverLiquid breathe spread={40} proximity={55} />

              <div className="relative z-10">
                {/* Screenshot Image Container */}
                <div
                  className="relative aspect-[16/10] bg-neutral-950 overflow-hidden cursor-pointer border-b border-white/[0.06]"
                  onClick={() => setSelectedImg(item)}
                >
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-4">
                    <span className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-white bg-black/70 px-3 py-1 rounded-full backdrop-blur-md border border-white/20">
                      <Eye className="w-3.5 h-3.5 text-orange-400" />
                      Click to Expand
                    </span>
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
                      {item.module}
                    </span>
                    <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-wider">
                      {item.category}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-2 group-hover:text-orange-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-neutral-400 font-light leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Lightbox Modal */}
      {selectedImg && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
          onClick={() => setSelectedImg(null)}
        >
          <div
            className="relative max-w-5xl w-full max-h-[90vh] bg-neutral-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-neutral-950/80 border-b border-white/10 flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-orange-400 mr-2">[{selectedImg.module}]</span>
                <span className="text-sm font-semibold text-white">{selectedImg.title}</span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedImg(null)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-2 overflow-auto bg-black flex items-center justify-center">
              <img
                src={selectedImg.img}
                alt={selectedImg.title}
                className="max-h-[75vh] w-auto object-contain rounded-lg"
              />
            </div>
            <div className="p-4 bg-neutral-950/90 border-t border-white/10 text-xs text-neutral-300 font-light">
              {selectedImg.desc}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
export default ScreensGallery;
