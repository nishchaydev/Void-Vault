import React, { useState, useEffect } from 'react';
import { siteConfig } from '../config/siteConfig';
import { Shield, Github, Menu, X, ExternalLink, ChevronRight, RotateCcw } from 'lucide-react';

export default function Header({ onReplayBoot }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: "Live Prototype", href: "#demo" },
    { name: "Screenshots", href: "#prototype" },
    { name: "Schematics", href: "#diagrams" },
    { name: "Research (52)", href: "#research" },
    { name: "Benchmarks", href: "#benchmarks" },
    { name: "Govt & NTRO", href: "#impact" },
    { name: "Repo Tree", href: "#resources" },
    { name: "Team", href: "#team" },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-[#050505]/90 backdrop-blur-md border-b border-white/[0.06] py-3' 
        : 'bg-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo & Hackathon Badge */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="relative w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl bg-white/[0.04] border border-white/10 p-1.5 shadow-sm group-hover:border-cyan-500/50 transition-colors">
              <img src="/favicon.svg" alt="Void Vault" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-bold text-base sm:text-lg tracking-wider text-white font-mono">VOID VAULT</span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-mono font-medium tracking-tight bg-cyan-950/70 text-cyan-300 border border-cyan-800/60">
                  {siteConfig.hackathon.problemId}
                </span>
              </div>
              <span className="text-[10px] text-neutral-400 font-mono tracking-tight hidden sm:block">
                NTRO • {siteConfig.hackathon.edition}
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="px-2.5 py-1.5 text-xs font-mono font-medium text-neutral-300 hover:text-white rounded-lg hover:bg-white/5 transition-all"
              >
                {item.name}
              </a>
            ))}
          </nav>

          {/* Top CTAs */}
          <div className="hidden sm:flex items-center gap-2.5">
            {onReplayBoot && (
              <button
                type="button"
                onClick={onReplayBoot}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-medium text-neutral-400 hover:text-cyan-300 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/30 rounded-full transition-all duration-200 cursor-pointer backdrop-blur-md"
                title="Replay System Boot Cinematic"
              >
                <RotateCcw className="w-3 h-3 text-cyan-400" />
                <span className="hidden xl:inline">Boot</span>
              </button>
            )}

            <a
              href="https://github.com/nishchaydev/sih2026"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono font-medium text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-full transition-all duration-200 backdrop-blur-md"
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub</span>
            </a>

            <a
              href="#demo"
              className="inline-flex items-center gap-1 px-4 py-1.5 text-xs font-mono font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-full shadow-lg shadow-cyan-500/25 transition-all duration-200"
            >
              <span>Explore Demo</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-white/[0.08] bg-[#050505]/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-white/[0.06]">
            {navLinks.map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 text-xs font-mono text-neutral-300 hover:text-white rounded-lg hover:bg-white/5"
              >
                {item.name}
              </a>
            ))}
          </div>

          <div className="pt-2 flex flex-col gap-2">
            {onReplayBoot && (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onReplayBoot();
                }}
                className="w-full flex items-center justify-center gap-2 py-2 text-xs font-mono text-cyan-300 bg-cyan-950/40 border border-cyan-800/60 rounded-full cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                <span>Replay Boot Sequence</span>
              </button>
            )}
            <a
              href="https://github.com/nishchaydev/sih2026"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2 text-xs font-mono text-neutral-200 bg-white/5 border border-white/10 rounded-full"
            >
              <Github className="w-4 h-4" />
              <span>GitHub Repository</span>
            </a>
            <a
              href="#demo"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-mono text-white bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full shadow"
            >
              <span>Explore Prototype</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
