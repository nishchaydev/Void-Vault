import React from 'react';
import { useRouter } from '../context/RouterContext';
import { ArrowLeft, Home, ChevronRight, Layers } from 'lucide-react';

const PAGE_NAMES = {
  demo: 'Demo Video & Walkthrough',
  screens: 'GUI Screenshots & Visual Flows',
  evidence: 'Validation Evidence & Part C Test Harness',
  'ps-matrix': 'PS SIH26149 Traceability Matrix',
  docs: 'Complete Technical Documentation Dossier',
  standards: 'Sanitization Standards & Alignment',
  team: 'Team eMitra (Team ID 146878)',
  faq: 'Evaluator FAQ & Limitations',
  pack: 'Offline Evaluator Pack & Checksums'
};

export default function PageShell({ title, subtitle, children, currentKey }) {
  const { navigate } = useRouter();

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

  return (
    <div className="pt-6 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Top Breadcrumb & Quick Hopper */}
      <div className="mb-8 pb-4 border-b border-white/[0.06] flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <button
            onClick={() => navigate('overview')}
            className="flex items-center gap-1.5 text-neutral-400 hover:text-orange-400 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Overview</span>
          </button>
          <ChevronRight className="w-3 h-3 text-neutral-600" />
          <span className="text-orange-500 font-semibold uppercase tracking-wider">
            {PAGE_NAMES[currentKey] || title}
          </span>
        </div>

        {/* Section Hopper Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-all cursor-pointer whitespace-nowrap ${
                currentKey === item.id
                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40 font-semibold'
                  : 'bg-white/[0.02] text-neutral-400 hover:text-white hover:bg-white/5 border border-white/5'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Page Content */}
      <div className="animate-in fade-in duration-300">
        {children}
      </div>

      {/* Bottom Back Button */}
      <div className="mt-16 pt-8 border-t border-white/[0.06] flex justify-between items-center text-xs font-mono text-neutral-400">
        <button
          onClick={() => navigate('overview')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-orange-500/10 hover:border-orange-500/30 hover:text-orange-400 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Overview Hub</span>
        </button>

        <span className="text-neutral-500 hidden sm:inline">
          NTRO PS SIH26149 • Team eMitra
        </span>
      </div>
    </div>
  );
}
