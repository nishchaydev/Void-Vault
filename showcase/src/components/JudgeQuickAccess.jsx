import React, { useState } from 'react';
import { siteConfig } from '../config/siteConfig';
import { Compass, X, ChevronUp, Play, Monitor, Sparkles, Cpu, BookOpen, ShieldAlert, Users, FolderGit2 } from 'lucide-react';

const iconMap = {
  Play,
  Monitor,
  Sparkles,
  Cpu,
  BookOpen,
  ShieldAlert,
  Users,
  FolderGit2
};

export default function JudgeQuickAccess() {
  const [isOpen, setIsOpen] = useState(false);

  const judgeLinks = [
    { id: "demo", label: "Live Prototype Demo", icon: "Play" },
    { id: "prototype", label: "Module Screenshots", icon: "Monitor" },
    { id: "diagrams", label: "Technical Schematics", icon: "Cpu" },
    { id: "research", label: "52 Research Papers", icon: "BookOpen" },
    { id: "benchmarks", label: "Physical Benchmarks", icon: "Sparkles" },
    { id: "impact", label: "Govt & NTRO Value", icon: "ShieldAlert" },
    { id: "resources", label: "Full Repo Link Tree", icon: "FolderGit2" },
    { id: "team", label: "Team eMitra", icon: "Users" }
  ];

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40">
      {/* Expanded Quick Access Menu */}
      {isOpen && (
        <div className="mb-3 p-4 rounded-2xl bg-[#050505]/95 backdrop-blur-xl border border-cyan-500/40 shadow-2xl shadow-black w-64 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-white/[0.08]">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Judge Quick Triage
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-white/5 cursor-pointer"
              aria-label="Close judge menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1">
            {judgeLinks.map((item) => {
              const Icon = iconMap[item.icon] || Compass;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-mono font-medium text-neutral-300 hover:text-cyan-300 hover:bg-white/5 transition-colors"
                >
                  <Icon className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{item.label}</span>
                </a>
              );
            })}
          </div>

          <div className="mt-3 pt-2.5 border-t border-white/[0.08] text-[10px] font-mono text-neutral-400 text-center">
            QR Quick Access • PS-26149 (NTRO)
          </div>
        </div>
      )}

      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#050505]/95 hover:bg-neutral-900 text-white border border-cyan-500/50 shadow-xl shadow-cyan-500/20 backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer font-mono"
        aria-label="Toggle Judge Quick Access menu"
      >
        <Compass className="w-4 h-4 text-cyan-400" />
        <span className="text-xs font-semibold tracking-wide">
          {isOpen ? "Close Menu" : "Judge Quick Access"}
        </span>
        <ChevronUp className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
    </div>
  );
}
