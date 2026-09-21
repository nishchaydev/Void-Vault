
import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#050505]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-950 border border-cyan-500/30">
            <svg className="w-5 h-5 text-cyan-400" viewBox="0 0 40 40" fill="none"><path d="M6 8L20 34L34 8H26L20 22L14 8H6Z" fill="currentColor"/><path d="M13 8L20 20L27 8H22L20 12L18 8H13Z" fill="#38bdf8" opacity="0.9"/></svg>
          </div>
          <span className="font-bold tracking-widest text-white uppercase text-sm">VOID VAULT</span>
          <div className="hidden lg:flex items-center ml-4 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/10">
            <span className="text-[10px] font-mono text-cyan-400">SIH 2026 • PS SIH26149 (NTRO) • Team eMitra</span>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-neutral-400">
          <a href="#docs" className="hover:text-cyan-400 transition-colors">Docs</a>
          <a href="#screens" className="hover:text-cyan-400 transition-colors">Screenshots</a>
          <a href="#demo" className="hover:text-cyan-400 transition-colors">Demo</a>
          <a href="#faq" className="hover:text-cyan-400 transition-colors">FAQ</a>
          <a href="#pack" className="hover:text-cyan-400 transition-colors">Pack</a>
        </nav>
        <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-neutral-400 hover:text-white">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-b border-white/10 bg-[#050505] px-4 py-4 space-y-4">
          <a href="#docs" className="block text-sm text-neutral-400">Docs</a>
          <a href="#screens" className="block text-sm text-neutral-400">Screenshots</a>
          <a href="#demo" className="block text-sm text-neutral-400">Demo</a>
          <a href="#faq" className="block text-sm text-neutral-400">FAQ</a>
          <a href="#pack" className="block text-sm text-neutral-400">Pack</a>
        </div>
      )}
    </header>
  );
}
export default Header;
