import React, { useState, useMemo } from 'react';
import { researchConfig } from '../config/research';
import { GlowingEffect } from './ui/glowing-effect';
import { BookOpen, Shield, FileText, ExternalLink, Download, Search, CheckCircle, FolderArchive, ArrowUpRight } from 'lucide-react';

export default function ResearchStandards() {
  const [activeTab, setActiveTab] = useState("papers"); // Default to papers as requested!
  const [paperCategory, setPaperCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPapers = useMemo(() => {
    return researchConfig.papers.filter((paper) => {
      const matchesCat = paperCategory === "ALL" || paper.pillar.toLowerCase().includes(paperCategory.toLowerCase());
      const matchesSearch =
        !searchQuery ||
        paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        paper.authors.toLowerCase().includes(searchQuery.toLowerCase()) ||
        paper.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
        paper.relevance.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [paperCategory, searchQuery]);

  const filteredDossiers = useMemo(() => {
    return researchConfig.dossiers.filter((d) => {
      return (
        !searchQuery ||
        d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.focus.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.file.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [searchQuery]);

  return (
    <section id="research" className="py-20 md:py-28 border-t border-white/[0.04] bg-[#050505] relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-cyan-500/5 blur-[140px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-mono font-semibold tracking-widest text-cyan-400 uppercase">
            09 — EMPIRICAL FOUNDATIONS & LITERATURE COMPENDIUM
          </span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mt-3 mb-4 tracking-tight">
            Research Archive & Standards
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
            Every sector-traversal routine, cryptographic purge, and adversarial carving heuristic in Void Vault is grounded in 52 cited academic papers and 24 specialized defense dossiers.
          </p>
        </div>

        {/* Top Segmented Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          <button
            onClick={() => setActiveTab("papers")}
            className={`px-4 py-2 rounded-full text-xs font-mono font-medium transition-all cursor-pointer ${
              activeTab === "papers"
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-lg shadow-cyan-500/10'
                : 'bg-white/[0.03] text-neutral-400 border border-white/[0.08] hover:text-white'
            }`}
          >
            Academic Papers ({researchConfig.papers.length})
          </button>
          <button
            onClick={() => setActiveTab("dossiers")}
            className={`px-4 py-2 rounded-full text-xs font-mono font-medium transition-all cursor-pointer ${
              activeTab === "dossiers"
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-lg shadow-cyan-500/10'
                : 'bg-white/[0.03] text-neutral-400 border border-white/[0.08] hover:text-white'
            }`}
          >
            24 Defense Dossiers (800+ Surveyed)
          </button>
          <button
            onClick={() => setActiveTab("standards")}
            className={`px-4 py-2 rounded-full text-xs font-mono font-medium transition-all cursor-pointer ${
              activeTab === "standards"
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-lg shadow-cyan-500/10'
                : 'bg-white/[0.03] text-neutral-400 border border-white/[0.08] hover:text-white'
            }`}
          >
            Statutory & Legal Standards ({researchConfig.standards.length})
          </button>
        </div>

        {/* Global Search Bar */}
        <div className="max-w-xl mx-auto mb-8">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-neutral-500 absolute left-4 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by author, paper title, standard (e.g., USENIX, BGC, BSA 63, Garfinkel)..."
              className="w-full pl-11 pr-4 py-2.5 rounded-full bg-white/[0.02] border border-white/[0.08] text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-cyan-500/50 transition-colors backdrop-blur-md"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 text-neutral-500 hover:text-white text-xs cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* TAB 1: 52 ACADEMIC PAPERS */}
        {activeTab === "papers" && (
          <div>
            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
              {["ALL", "Flash", "Carving", "File System", "AI", "Standards"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setPaperCategory(cat)}
                  className={`px-3 py-1 rounded-lg text-[11px] font-mono transition-colors cursor-pointer ${
                    paperCategory === cat
                      ? "bg-white/15 text-white border border-white/20 font-semibold"
                      : "bg-white/[0.02] text-neutral-400 border border-white/[0.05] hover:text-white"
                  }`}
                >
                  {cat === "ALL" ? "All Pillars (52)" : cat}
                </button>
              ))}
            </div>

            {/* Papers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPapers.map((paper) => (
                <div
                  key={paper.id}
                  className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.01] hover:bg-white/[0.02] p-5 sm:p-6 transition-all duration-300 flex flex-col justify-between"
                >
                  <GlowingEffect hoverLiquid breathe spread={40} proximity={50} />

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono uppercase font-semibold text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-800/40">
                        {paper.pillar}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-500">
                        #{paper.id} • {paper.doi}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-bold text-white mb-1 group-hover:text-cyan-300 transition-colors leading-snug">
                      {paper.title}
                    </h3>

                    <p className="text-xs font-mono text-neutral-400 mb-2">
                      {paper.authors}
                    </p>

                    <p className="text-xs text-neutral-500 italic mb-3">
                      {paper.venue}
                    </p>

                    <p className="text-xs text-neutral-300 leading-relaxed font-light bg-white/[0.02] p-3 rounded-xl border border-white/[0.04]">
                      <span className="text-cyan-400 font-medium font-mono text-[10px] uppercase block mb-1">Architectural Relevance:</span>
                      {paper.relevance}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between relative z-10">
                    <a
                      href={paper.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                      <span>Read Original Paper</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>

            {filteredPapers.length === 0 && (
              <div className="text-center py-12 text-neutral-500 text-sm">
                No papers found matching "{searchQuery}".
              </div>
            )}
          </div>
        )}

        {/* TAB 2: 24 DEFENSE DOSSIERS */}
        {activeTab === "dossiers" && (
          <div>
            <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-800/30 flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <FolderArchive className="w-6 h-6 text-cyan-400 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-white">24 Thematic Defense Dossiers in Repository</h4>
                  <p className="text-xs text-neutral-400">
                    Surveyed across 800+ academic papers in IEEE S&P, USENIX Security, ACM CCS, and NDSS. Located in <code className="text-cyan-300">research/anti-piracy/</code>.
                  </p>
                </div>
              </div>
              <a
                href="https://github.com/nishchaydev/sih2026/tree/main/research/anti-piracy"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-mono whitespace-nowrap inline-flex items-center gap-1.5"
              >
                <span>Browse Directory</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDossiers.map((dossier) => (
                <div
                  key={dossier.id}
                  className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.01] hover:bg-white/[0.02] p-5 transition-all duration-300 flex flex-col justify-between"
                >
                  <GlowingEffect hoverLiquid breathe spread={35} proximity={45} />

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono text-cyan-400 font-bold px-2 py-0.5 rounded bg-cyan-950/40 border border-cyan-800/40">
                        DOSSIER {dossier.id}
                      </span>
                      <span className="text-[10px] font-mono text-neutral-500">
                        {dossier.papersCount} Surveyed Works
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                      {dossier.title}
                    </h3>

                    <p className="text-xs text-neutral-400 font-light leading-relaxed mb-3">
                      {dossier.focus}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between relative z-10">
                    <a
                      href={`https://github.com/nishchaydev/sih2026/blob/main/research/anti-piracy/${dossier.file}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-mono transition-colors"
                    >
                      <span>{dossier.file}</span>
                      <ArrowUpRight className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: REGULATORY STANDARDS */}
        {activeTab === "standards" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {researchConfig.standards.map((std, idx) => (
              <div
                key={idx}
                className="group relative rounded-2xl border border-white/[0.06] bg-white/[0.01] hover:bg-white/[0.02] p-6 transition-all duration-300 flex flex-col justify-between"
              >
                <GlowingEffect hoverLiquid breathe spread={40} proximity={55} />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono font-bold text-cyan-400 px-2.5 py-1 rounded bg-cyan-950/60 border border-cyan-800/50">
                      {std.code}
                    </span>
                    <span className="text-[10px] font-mono text-neutral-500 uppercase">
                      {std.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-1">{std.title}</h3>
                  <span className="text-xs font-mono text-neutral-400 block mb-3">{std.body}</span>
                  <p className="text-xs text-neutral-300 leading-relaxed font-light">{std.role}</p>
                </div>

                <div className="pt-4 mt-6 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-neutral-400 relative z-10">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle className="w-3.5 h-3.5" />
                    Strictly Adhered
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
