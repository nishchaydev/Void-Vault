import React from 'react';
import { siteConfig } from '../config/siteConfig';
import { Play, Monitor, BookOpen, Github, Cpu } from 'lucide-react';

export default function StickyMobileNav() {
  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#050505]/95 backdrop-blur-xl border-t border-white/[0.08] px-3 py-1.5 shadow-2xl">
      <div className="grid grid-cols-5 gap-1 max-w-md mx-auto">
        <a
          href="#demo"
          className="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-neutral-300 hover:text-white transition-colors"
        >
          <Play className="w-4 h-4 text-cyan-400 mb-0.5 fill-cyan-400/20" />
          <span className="text-[10px] font-mono font-medium">Demo</span>
        </a>

        <a
          href="#prototype"
          className="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-neutral-300 hover:text-white transition-colors"
        >
          <Monitor className="w-4 h-4 text-cyan-400 mb-0.5" />
          <span className="text-[10px] font-mono font-medium">Screens</span>
        </a>

        <a
          href="#diagrams"
          className="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-neutral-300 hover:text-white transition-colors"
        >
          <Cpu className="w-4 h-4 text-cyan-400 mb-0.5" />
          <span className="text-[10px] font-mono font-medium">Schematics</span>
        </a>

        <a
          href="#research"
          className="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-neutral-300 hover:text-white transition-colors"
        >
          <BookOpen className="w-4 h-4 text-cyan-400 mb-0.5" />
          <span className="text-[10px] font-mono font-medium">Papers</span>
        </a>

        <a
          href={siteConfig.links.github}
          target="_blank"
          rel="noreferrer"
          className="flex flex-col items-center justify-center py-1.5 px-1 rounded-xl text-neutral-300 hover:text-white transition-colors"
        >
          <Github className="w-4 h-4 text-cyan-400 mb-0.5" />
          <span className="text-[10px] font-mono font-medium">GitHub</span>
        </a>
      </div>
    </div>
  );
}
