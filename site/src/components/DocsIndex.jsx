
import React from 'react';
import { FileText } from 'lucide-react';

export function DocsIndex() {
  return (
    <section id="docs" className="py-16 px-4 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-8">Documentation Index</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[1,2,3,4,5,6].map(i => (
          <a key={i} href="#" className="flex items-center gap-3 p-3 rounded-lg border border-white/10 bg-white/[0.01] hover:bg-white/[0.03] transition-colors group">
            <FileText className="w-5 h-5 text-neutral-500 group-hover:text-cyan-400" />
            <div>
              <div className="text-sm font-medium text-neutral-300 group-hover:text-white transition-colors">0{i}-document-name.md</div>
              <div className="text-xs text-neutral-500">v1.0 • Sep 2026</div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
export default DocsIndex;
