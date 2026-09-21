import React from 'react';
import { resourcesGrid, repoLinkTree } from '../config/resources';
import { GlowingEffect } from './ui/glowing-effect';
import { Monitor, Play, Github, BookOpen, FileText, Cpu, Layers, BarChart3, Users, ArrowUpRight, ChevronRight, FolderGit2, Link2, ExternalLink } from 'lucide-react';

const iconMap = {
  Monitor,
  Play,
  Github,
  BookOpen,
  FileText,
  Cpu,
  Layers,
  BarChart3,
  Users
};

export default function ProjectResources() {
  return (
    <section id="resources" className="py-20 md:py-28 border-t border-white/[0.04] bg-[#050505] relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-orange-500/5 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-mono font-semibold tracking-widest text-orange-500 uppercase">
            16 — CENTRAL ARSENAL & REPO LINK TREE
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mt-3 mb-4 tracking-tight">
            Repository Deliverables & Link Tree
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
            The single-pane-of-glass directory linking every technical specification, peer-reviewed paper dossier, benchmark testbed, and source component across the repository.
          </p>
        </div>

        {/* 9 Resource Cards Grid with Orbit GlowingEffect */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {resourcesGrid.map((res) => {
            const Icon = iconMap[res.icon] || FileText;
            return (
              <a
                key={res.id}
                href={res.href}
                target={res.isExternal ? "_blank" : "_self"}
                rel={res.isExternal ? "noreferrer" : ""}
                className="group relative p-6 rounded-2xl border border-white/[0.06] bg-white/[0.01] hover:bg-white/[0.02] transition-all duration-300 flex flex-col justify-between shadow-2xl"
              >
                <GlowingEffect hoverLiquid breathe spread={45} proximity={60} />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2.5 rounded-xl border border-white/10 bg-white/5 text-orange-300 group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>

                    <span className="text-[10px] font-mono text-neutral-400 uppercase font-semibold">
                      {res.category}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-1.5 group-hover:text-orange-300 transition-colors">
                    {res.title}
                  </h3>
                  <p className="text-xs text-neutral-300 leading-relaxed mb-6 font-light">
                    {res.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono font-medium relative z-10">
                  <span className="text-orange-300 group-hover:text-white transition-colors">
                    {res.cta}
                  </span>
                  {res.isExternal ? (
                    <ArrowUpRight className="w-4 h-4 text-orange-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
                  )}
                </div>
              </a>
            );
          })}
        </div>

        {/* FULL REPOSITORY LINK TREE (Everything in the Repo) */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.01] p-6 sm:p-8 backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-white/[0.06]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FolderGit2 className="w-5 h-5 text-orange-500" />
                <h3 className="text-lg sm:text-xl font-bold text-white font-mono">
                  Comprehensive Repository Tree
                </h3>
              </div>
              <p className="text-xs text-neutral-400">
                Direct links to all core source crates, specifications, manuals, testbeds, and research literature.
              </p>
            </div>

            <a
              href="https://github.com/nishchaydev/sih2026"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/40 text-xs font-mono transition-colors whitespace-nowrap self-start sm:self-auto"
            >
              <Github className="w-4 h-4" />
              <span>Open github.com/nishchaydev/sih2026</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {repoLinkTree.map((categoryGroup, idx) => (
              <div key={idx} className="flex flex-col">
                <h4 className="text-xs font-mono uppercase tracking-widest text-orange-500 font-semibold mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                  {categoryGroup.category}
                </h4>

                <div className="space-y-2.5">
                  {categoryGroup.items.map((item, itemIdx) => (
                    <a
                      key={itemIdx}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/item flex items-start justify-between gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] hover:border-white/10 transition-all duration-200"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-white group-hover/item:text-orange-300 transition-colors">
                          <Link2 className="w-3 h-3 text-neutral-500 group-hover/item:text-orange-500" />
                          <span className="truncate">{item.name}</span>
                        </div>
                        <p className="text-[11px] text-neutral-400 font-light mt-0.5 truncate">
                          {item.desc}
                        </p>
                      </div>
                      <ArrowUpRight className="w-3.5 h-3.5 text-neutral-500 group-hover/item:text-orange-500 shrink-0 mt-0.5" />
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
