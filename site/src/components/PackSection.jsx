
import React from 'react';
import { Download } from 'lucide-react';

export function PackSection() {
  return (
    <section id="pack" className="py-24 px-4 max-w-3xl mx-auto text-center">
      <div className="p-8 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-cyan-400 blur-sm" />
        <h2 className="text-2xl font-bold text-white mb-2">Evaluator Pack</h2>
        <p className="text-neutral-400 mb-8 text-sm">Offline ZIP containing all docs, diagrams, and proof samples.</p>
        
        <button disabled className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white/5 text-neutral-500 border border-white/10 cursor-not-allowed font-medium">
          <Download className="w-5 h-5" />
          Pending First Release
        </button>
        
        <div className="mt-6 text-xs font-mono text-neutral-600">
          SHA-256: [PENDING BUILD]
        </div>
      </div>
    </section>
  );
}
export default PackSection;
