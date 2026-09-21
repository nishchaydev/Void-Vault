import React, { useState } from 'react';
import { useRouter } from '../context/RouterContext';
import { VoidVaultMark } from './ui/VoidVaultLogo';
import { Menu, X, ExternalLink, ShieldCheck } from 'lucide-react';

export function Header() {
  const [open, setOpen] = useState(false);
  const { currentRoute, navigate } = useRouter();

  const NAV_ITEMS = [
    { id: 'overview', label: 'Overview' },
    { id: 'screens', label: 'Screenshots' },
    { id: 'evidence', label: 'Evidence (Part C)' },
    { id: 'ps-matrix', label: 'PS Matrix' },
    { id: 'docs', label: 'Docs' },
    { id: 'demo', label: 'Demo' },
    { id: 'standards', label: 'Standards' },
    { id: 'team', label: 'Team' },
    { id: 'faq', label: 'FAQ' },
    { id: 'pack', label: 'Pack' },
  ];

  const handleNav = (routeId) => {
    navigate(routeId);
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.08] bg-[#0c0d0e]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        
        {/* Brand Logo & Tag */}
        <div 
          onClick={() => handleNav('overview')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#17181c] border border-orange-500/30 shadow-[0_0_15px_rgba(255,86,0,0.2)] group-hover:border-orange-500/60 transition-all p-1.5">
            <VoidVaultMark className="w-full h-full text-orange-500 group-hover:scale-105 transition-transform drop-shadow-[0_0_8px_rgba(255,86,0,0.5)]" variant="orange" />
          </div>
          <div>
            <span className="font-black tracking-[0.14em] text-white uppercase text-sm font-sans block group-hover:text-orange-400 transition-colors">
              VOID VAULT
            </span>
            <span className="text-[9px] font-mono text-neutral-400 tracking-wider hidden sm:block">
              NTRO PS-26149 • Team eMitra
            </span>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden xl:flex items-center gap-1 bg-white/[0.02] p-1 rounded-xl border border-white/[0.05]">
          {NAV_ITEMS.map((item) => {
            const isActive = currentRoute === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                  isActive
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40 font-bold shadow-[0_0_12px_rgba(255,86,0,0.15)]'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Secondary Navigation for Lg screens */}
        <nav className="hidden md:flex xl:hidden items-center gap-1.5">
          {NAV_ITEMS.slice(0, 6).map((item) => {
            const isActive = currentRoute === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40 font-semibold'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            );
          })}
          <button
            onClick={() => setOpen(!open)}
            className="px-2 py-1 rounded-lg text-xs font-mono text-neutral-400 hover:text-white border border-white/10"
          >
            More ▾
          </button>
        </nav>

        {/* External GitHub Link */}
        <div className="hidden lg:flex items-center gap-2">
          <a
            href="https://github.com/nishchaydev/Void-Vault"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-orange-500/10 hover:border-orange-500/30 hover:text-orange-400 text-xs font-mono text-neutral-300 transition-colors"
          >
            <span>GitHub</span>
            <ExternalLink className="w-3 h-3 text-neutral-400" />
          </a>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
          aria-label="Toggle Menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {open && (
        <div className="md:hidden border-b border-white/10 bg-[#0c0d0e] px-4 py-4 space-y-1 shadow-2xl animate-in slide-in-from-top-2 duration-200">
          <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest px-3 pb-2 mb-1 border-b border-white/5">
            Navigation Pages
          </div>
          {NAV_ITEMS.map((item) => {
            const isActive = currentRoute === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-mono flex items-center justify-between transition-colors ${
                  isActive
                    ? 'bg-orange-500/15 text-orange-400 font-bold border border-orange-500/30'
                    : 'text-neutral-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span>{item.label}</span>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}

export default Header;
