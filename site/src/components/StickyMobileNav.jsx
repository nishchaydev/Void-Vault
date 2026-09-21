
import React from 'react';
import { Home, Play, FileText, Package } from 'lucide-react';

export function StickyMobileNav() {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#050505]/90 backdrop-blur-lg border-t border-white/10 px-4 py-3 flex justify-around">
      <a href="#" className="flex flex-col items-center gap-1 text-orange-500">
        <Home className="w-5 h-5" />
        <span className="text-[10px]">Home</span>
      </a>
      <a href="#demo" className="flex flex-col items-center gap-1 text-neutral-400 hover:text-white">
        <Play className="w-5 h-5" />
        <span className="text-[10px]">Demo</span>
      </a>
      <a href="#docs" className="flex flex-col items-center gap-1 text-neutral-400 hover:text-white">
        <FileText className="w-5 h-5" />
        <span className="text-[10px]">Docs</span>
      </a>
      <a href="#pack" className="flex flex-col items-center gap-1 text-neutral-400 hover:text-white">
        <Package className="w-5 h-5" />
        <span className="text-[10px]">Pack</span>
      </a>
    </div>
  );
}
export default StickyMobileNav;
