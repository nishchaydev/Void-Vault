
import React from 'react';
import { GlowingEffect } from './ui/glowing-effect';
import { Play, FileText, CheckCircle2, Image as ImageIcon, Activity, GitMerge, FileKey, BookOpen, Package, AlertTriangle, Mail } from 'lucide-react';

const LINKS = [
  { id: 'demo', icon: Play, title: 'Demo Video', desc: 'Watch the 2-minute walkthrough → #demo', badge: 'MP4 / 2m' },
  { id: 'brief', icon: FileText, title: 'One-Page Brief', desc: 'Project summary → docs/00-brief.md', badge: 'MD / 4KB' },
  { id: 'ps-matrix', icon: CheckCircle2, title: 'PS Traceability', desc: 'Every PS clause mapped → #ps-matrix', badge: 'Table' },
  { id: 'screens', icon: ImageIcon, title: 'Screenshots', desc: '10 annotated module screenshots → #screens', badge: 'Gallery' },
  { id: 'validation', icon: Activity, title: 'Validation & Performance', desc: 'Test results and benchmarks → docs/09', badge: 'MD / PDF' },
  { id: 'architecture', icon: GitMerge, title: 'Architecture & Diagrams', desc: 'System design → docs/02', badge: 'SVG / MD' },
  { id: 'audit', icon: FileKey, title: 'Audit Ledger & BSA s.63', desc: 'Evidence chain → docs/07', badge: 'Crypto' },
  { id: 'research', icon: BookOpen, title: 'Research & Bibliography', desc: 'Literature review → research/', badge: 'PDFs' },
  { id: 'pack', icon: Package, title: 'Evaluator Pack', desc: 'Offline ZIP download → #pack', badge: 'ZIP / Pending' },
  { id: 'limits', icon: AlertTriangle, title: 'Limitations & FAQ', desc: 'Honest assessment → #limits', badge: 'Text' },
  { id: 'contact', icon: Mail, title: 'Request Source Access', desc: 'Contact team', badge: 'mailto', href: 'mailto:' },
];

export function LinkCards() {
  return (
    <section id="links" className="py-16 px-4 max-w-4xl mx-auto space-y-4">
      {LINKS.map((link, i) => (
        <div key={i} className="relative group rounded-xl bg-white/[0.02] border border-white/5 p-4 flex items-center justify-between hover:bg-white/[0.04] transition-colors cursor-pointer">
          <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} />
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center border border-orange-500/20 text-orange-500 group-hover:text-orange-300">
              <link.icon size={20} />
            </div>
            <div>
              <h3 className="text-white font-medium group-hover:text-orange-500 transition-colors">{link.title}</h3>
              <p className="text-neutral-500 text-sm">{link.desc}</p>
            </div>
          </div>
          <div className="relative z-10 hidden sm:block">
            <span className="px-2.5 py-1 rounded bg-white/[0.05] text-xs font-mono text-neutral-400 border border-white/10">{link.badge}</span>
          </div>
        </div>
      ))}
    </section>
  );
}
export default LinkCards;
