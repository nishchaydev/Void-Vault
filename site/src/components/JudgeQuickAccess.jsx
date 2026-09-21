
import React from 'react';
import { Link as LinkIcon, FileText, CheckCircle, Package } from 'lucide-react';

export function JudgeQuickAccess() {
  return (
    <div className="hidden lg:flex fixed bottom-6 right-6 flex-col gap-2 z-40">
      <div className="p-3 rounded-2xl bg-[#050505]/80 backdrop-blur-xl border border-white/10 shadow-2xl flex flex-col gap-2">
        <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest px-2 pb-1 border-b border-white/5 mb-1">Quick Links</div>
        <a href="#demo" className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-white/5 text-sm text-neutral-300 hover:text-white transition-colors">
          <LinkIcon className="w-4 h-4 text-orange-500" /> Demo
        </a>
        <a href="#ps-matrix" className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-white/5 text-sm text-neutral-300 hover:text-white transition-colors">
          <CheckCircle className="w-4 h-4 text-orange-500" /> PS Matrix
        </a>
        <a href="#pack" className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-white/5 text-sm text-neutral-300 hover:text-white transition-colors">
          <Package className="w-4 h-4 text-orange-500" /> Evaluator Pack
        </a>
        <a href="#faq" className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-white/5 text-sm text-neutral-300 hover:text-white transition-colors">
          <FileText className="w-4 h-4 text-orange-500" /> FAQ
        </a>
      </div>
    </div>
  );
}
export default JudgeQuickAccess;
