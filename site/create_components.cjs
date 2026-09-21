const fs = require('fs');
const path = require('path');

const write = (file, content) => fs.writeFileSync(path.join('n:\\Void-Vault\\site', file), content);

write('src/components/Header.jsx', `
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
`);

write('src/components/Hero.jsx', `
import React from 'react';
import { SparklesCore } from './ui/sparkles';

export function Hero() {
  return (
    <section className="relative flex min-h-[70vh] flex-col items-center justify-center px-4 pt-20 pb-16 text-center">
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        <SparklesCore background="transparent" minSize={0.4} maxSize={1} particleDensity={20} className="w-full h-full opacity-30" particleColor="#38BDF8" />
      </div>
      <div className="relative z-10 flex flex-col items-center">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-mono text-cyan-400">
          <span>SIH 2026 • PS SIH26149 (NTRO) • Team eMitra (146878)</span>
        </div>
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-b from-[#0e1726] to-[#050911] border border-cyan-500/30 flex items-center justify-center shadow-2xl shadow-cyan-950/80 mx-auto">
            <svg className="w-11 h-11 text-cyan-400 drop-shadow-[0_0_12px_rgba(6,182,212,0.6)]" viewBox="0 0 40 40" fill="none"><path d="M6 8L20 34L34 8H26L20 22L14 8H6Z" fill="currentColor"/><path d="M13 8L20 20L27 8H22L20 12L18 8H13Z" fill="#38bdf8" opacity="0.9"/></svg>
          </div>
        </div>
        <h1 className="mb-4 text-5xl sm:text-7xl font-bold tracking-[0.2em] text-white">
          <span className="inline-block drop-shadow-[0_0_15px_rgba(56,189,248,0.3)]">VOID VAULT</span>
        </h1>
        <p className="mb-8 text-xl sm:text-2xl font-light text-cyan-400/90 tracking-wide">
          Secure Today. Recover Tomorrow.
        </p>
        <p className="mb-10 max-w-2xl text-base sm:text-lg text-neutral-400 font-light leading-relaxed">
          Evidence hub for PS SIH26149. Documentation, diagrams, sample artifacts, and validation evidence. No source code.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-16">
          <a href="#demo" className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-400 text-black font-semibold tracking-wide hover:brightness-110 transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)]">
            Watch Demo
          </a>
          <a href="#ps-matrix" className="w-full sm:w-auto px-8 py-3.5 rounded-lg border border-white/10 bg-white/[0.02] text-neutral-300 font-medium hover:bg-white/[0.05] transition-all">
            PS Matrix
          </a>
          <a href="#pack" className="w-full sm:w-auto px-8 py-3.5 rounded-lg border border-white/10 bg-white/[0.02] text-neutral-300 font-medium hover:bg-white/[0.05] transition-all">
            Evaluator Pack
          </a>
        </div>
        
        <div className="flex flex-wrap justify-center gap-3 text-sm font-mono border-t border-white/10 pt-8 w-full max-w-3xl">
          <div className="px-4 py-2 bg-white/[0.02] rounded-md border border-white/5 text-neutral-400">
            <span className="text-cyan-400 mr-2">[Tests]</span>pending
          </div>
          <div className="px-4 py-2 bg-white/[0.02] rounded-md border border-white/5 text-neutral-400">
            <span className="text-cyan-400 mr-2">[Standards]</span>5 aligned
          </div>
          <div className="px-4 py-2 bg-white/[0.02] rounded-md border border-white/5 text-neutral-400">
            <span className="text-cyan-400 mr-2">[Modules]</span>3+2
          </div>
          <div className="px-4 py-2 bg-white/[0.02] rounded-md border border-white/5 text-neutral-400">
            <span className="text-cyan-400 mr-2">[Papers]</span>pending
          </div>
        </div>
      </div>
    </section>
  );
}
export default Hero;
`);

write('src/components/LinkCards.jsx', `
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
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 text-cyan-400 group-hover:text-cyan-300">
              <link.icon size={20} />
            </div>
            <div>
              <h3 className="text-white font-medium group-hover:text-cyan-400 transition-colors">{link.title}</h3>
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
`);

write('src/components/StatusSection.jsx', `
import React from 'react';
import { GlowingEffect } from './ui/glowing-effect';

export function StatusSection() {
  const modules = [
    { name: 'Core Engine (Rust)', status: 'Implemented', type: 'implemented' },
    { name: 'Reporting (HTML/PDF)', status: 'Implemented', type: 'implemented' },
    { name: 'Dashboard (React)', status: 'Implemented', type: 'implemented' },
    { name: 'BSA s.63 Cryptography', status: 'Prototype', type: 'prototype' },
    { name: 'Blockchain Archiving', status: 'Planned', type: 'planned' }
  ];

  return (
    <section id="status" className="py-16 px-4 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-8">System Status</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {modules.map((m, i) => (
          <div key={i} className="relative p-5 rounded-xl bg-white/[0.02] border border-white/10">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-white font-medium">{m.name}</h3>
              <span className={\`text-[10px] font-mono px-2 py-0.5 rounded border \${
                m.type === 'implemented' ? 'bg-neutral-200 text-black border-neutral-300' :
                m.type === 'prototype' ? 'bg-neutral-800 text-neutral-300 border-neutral-600' :
                'bg-neutral-900 text-neutral-500 border-neutral-800'
              }\`}>
                {m.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
export default StatusSection;
`);

write('src/components/DemoSection.jsx', `
import React from 'react';
import { Play } from 'lucide-react';

export function DemoSection() {
  return (
    <section id="demo" className="py-16 px-4 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-8">Demonstration</h2>
      <div className="relative aspect-video rounded-xl bg-neutral-900 border border-white/10 overflow-hidden group flex items-center justify-center cursor-pointer">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPjwvc3ZnPg==')] opacity-50" />
        <div className="w-20 h-20 rounded-full bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center group-hover:bg-cyan-500/30 transition-all group-hover:scale-110 z-10 backdrop-blur-sm shadow-[0_0_30px_rgba(56,189,248,0.3)]">
          <Play className="w-8 h-8 text-cyan-400 ml-1 fill-cyan-400" />
        </div>
      </div>
      <div className="mt-4 flex justify-between items-center text-sm">
        <p className="text-neutral-400 font-mono">Flow: Erase → Carve back → Certificate → Verify → Tamper → Verify fails</p>
        <a href="#" className="text-cyan-400 hover:underline">Transcript →</a>
      </div>
    </section>
  );
}
export default DemoSection;
`);

write('src/components/ScreensGallery.jsx', `
import React from 'react';

export function ScreensGallery() {
  return (
    <section id="screens" className="py-16 px-4 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-8">Screenshots</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="group rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
            <div className="aspect-[4/3] bg-neutral-900 flex items-center justify-center border-b border-white/5 group-hover:bg-neutral-800 transition-colors">
              <span className="text-neutral-600 font-mono text-sm">[Pending Screen {i+1}]</span>
            </div>
            <div className="p-4">
              <div className="text-xs text-cyan-400 font-mono mb-1">Module {i+1}</div>
              <h3 className="text-white text-sm font-medium mb-1">Feature Demonstration</h3>
              <p className="text-neutral-500 text-xs line-clamp-2">Matches PS requirement section X.Y showing capabilities.</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
export default ScreensGallery;
`);

write('src/components/ClosedLoopSection.jsx', `
import React from 'react';

export function ClosedLoopSection() {
  return (
    <section id="loop" className="py-16 px-4 max-w-4xl mx-auto text-center">
      <h2 className="text-2xl font-bold text-white mb-4">Closed-Loop Verification</h2>
      <p className="text-neutral-400 mb-8 max-w-2xl mx-auto">The erase-carve-certify flow proves sanitization effectiveness cryptographically.</p>
      <div className="aspect-[21/9] rounded-xl border border-white/10 bg-neutral-900/50 flex items-center justify-center">
        <span className="text-neutral-600 font-mono">[Diagram SVG Placeholder]</span>
      </div>
    </section>
  );
}
export default ClosedLoopSection;
`);

write('src/components/VerifySection.jsx', `
import React from 'react';

export function VerifySection() {
  return (
    <section id="verify" className="py-16 px-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-4">Verify It Yourself</h2>
      <p className="text-neutral-400 mb-6">Run the following commands on our sample artifacts to manually verify the cryptographic chain.</p>
      <div className="rounded-lg bg-[#0a0a0a] border border-white/10 p-4 font-mono text-sm overflow-x-auto">
        <div className="text-neutral-500 mb-1"># 1. Verify the artifact hash</div>
        <div className="text-cyan-400 mb-4">$ sha256sum void-vault-evidence-001.json</div>
        
        <div className="text-neutral-500 mb-1"># 2. Tamper the file (flip one byte)</div>
        <div className="text-cyan-400 mb-4">$ sed -i 's/success/failure/g' void-vault-evidence-001.json</div>
        
        <div className="text-neutral-500 mb-1"># 3. Verification fails</div>
        <div className="text-cyan-400">$ ./vv-cli verify void-vault-evidence-001.json</div>
        <div className="text-red-400 mt-1">&gt; ERROR: Hash mismatch at block 4. Chain invalid.</div>
      </div>
    </section>
  );
}
export default VerifySection;
`);

write('src/components/PSMatrixSection.jsx', `
import React from 'react';

export function PSMatrixSection() {
  return (
    <section id="ps-matrix" className="py-16 px-4 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-8">PS Traceability Matrix</h2>
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-white/[0.03] text-neutral-400 border-b border-white/10">
            <tr>
              <th className="px-4 py-3 font-medium">PS Clause</th>
              <th className="px-4 py-3 font-medium">Feature</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Evidence</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-neutral-300">
            {[1,2,3,4].map(i => (
              <tr key={i} className="hover:bg-white/[0.01]">
                <td className="px-4 py-3 font-mono text-cyan-400 text-xs">Req {i}.0</td>
                <td className="px-4 py-3">Core Capability {i}</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 rounded text-[10px] uppercase tracking-wider bg-neutral-200 text-black">Implemented</span></td>
                <td className="px-4 py-3 text-neutral-500">docs/0{i}-spec.md</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
export default PSMatrixSection;
`);

write('src/components/StandardsSection.jsx', `
import React from 'react';

export function StandardsSection() {
  return (
    <section id="standards" className="py-16 px-4 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-8">Standards Alignment</h2>
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-white/[0.03] text-neutral-400 border-b border-white/10">
            <tr>
              <th className="px-4 py-3 font-medium">Standard</th>
              <th className="px-4 py-3 font-medium">Version</th>
              <th className="px-4 py-3 font-medium">Aligned To</th>
              <th className="px-4 py-3 font-medium">NOT Claimed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-neutral-300">
            <tr className="hover:bg-white/[0.01]">
              <td className="px-4 py-3 font-medium text-white">NIST SP 800-88</td>
              <td className="px-4 py-3 text-neutral-500">Rev. 2</td>
              <td className="px-4 py-3">Clear, Purge</td>
              <td className="px-4 py-3 text-neutral-500 italic">Destroy (Physical)</td>
            </tr>
            <tr className="hover:bg-white/[0.01]">
              <td className="px-4 py-3 font-medium text-white">BSA 2023</td>
              <td className="px-4 py-3 text-neutral-500">Sec 63</td>
              <td className="px-4 py-3">Electronic Ev.</td>
              <td className="px-4 py-3 text-neutral-500 italic">Court admissibility</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  );
}
export default StandardsSection;
`);

write('src/components/DocsIndex.jsx', `
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
`);

write('src/components/LimitationsSection.jsx', `
import React from 'react';

export function LimitationsSection() {
  return (
    <section id="limits" className="py-16 px-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-6">Limitations & Honest Assessment</h2>
      <ul className="space-y-3 text-neutral-400 list-disc pl-5">
        <li>Flash residual risk: Wear leveling means overwritten data may persist in over-provisioned blocks.</li>
        <li>OS/media support today: Windows physical drives supported; NVMe namespaces pending.</li>
        <li>USB-bridge limits: UASP required for ATA Secure Erase over USB.</li>
        <li>Host-disk handling: Requires exclusive lock on physical drive, failing if OS is using it.</li>
        <li>AI limitations: Carving heuristics work on raw bytes, encrypted data cannot be carved.</li>
        <li>Virtual disk testing caveats: Emulators do not accurately simulate wear-leveling.</li>
      </ul>
    </section>
  );
}
export default LimitationsSection;
`);

write('src/components/FAQSection.jsx', `
import React from 'react';

export function FAQSection() {
  return (
    <section id="faq" className="py-16 px-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-8">Frequently Asked Questions</h2>
      <div className="space-y-4">
        {[1,2,3,4,5].map(i => (
          <div key={i} className="border border-white/10 rounded-lg bg-white/[0.01] p-4">
            <h3 className="text-white font-medium mb-2">Q: Common question {i} regarding the implementation?</h3>
            <p className="text-sm text-neutral-400">A: Short, concise answer addressing the specific concern directly, typically under 5 lines referencing the brief.</p>
          </div>
        ))}
      </div>
    </section>
  );
}
export default FAQSection;
`);

write('src/components/PackSection.jsx', `
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
`);

write('src/components/ContactFooter.jsx', `
import React from 'react';

export function ContactFooter() {
  return (
    <section className="py-12 border-t border-white/10 bg-[#050505] text-center">
      <div className="max-w-4xl mx-auto px-4">
        <p className="text-neutral-400 text-sm mb-4">
          To request source access or for technical inquiries, contact Team eMitra at <a href="mailto:" className="text-cyan-400 hover:underline">pending@email.com</a>
        </p>
        <p className="text-neutral-500 text-xs mb-8">
          License: CC BY-NC-ND 4.0
        </p>
        <div className="p-4 rounded-lg bg-white/[0.02] border border-white/5 text-xs text-neutral-500 max-w-2xl mx-auto leading-relaxed">
          Independent SIH 2026 submission. Standards are referenced for alignment; no endorsement by NTRO, NIST, IEEE, CERT-In or STQC is implied.
          <br /><br />
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>
    </section>
  );
}
export default ContactFooter;
`);

write('src/App.jsx', `
import React, { useState } from 'react';
import { ScrollProgress } from './components/ui/scroll-progress';
import BootSplash from './components/shell/BootSplash';
import Header from './components/Header';
import Hero from './components/Hero';
import LinkCards from './components/LinkCards';
import StatusSection from './components/StatusSection';
import DemoSection from './components/DemoSection';
import ScreensGallery from './components/ScreensGallery';
import ClosedLoopSection from './components/ClosedLoopSection';
import VerifySection from './components/VerifySection';
import PSMatrixSection from './components/PSMatrixSection';
import StandardsSection from './components/StandardsSection';
import DocsIndex from './components/DocsIndex';
import LimitationsSection from './components/LimitationsSection';
import FAQSection from './components/FAQSection';
import PackSection from './components/PackSection';
import ContactFooter from './components/ContactFooter';
import LargeNameFooter from './components/ui/large-name-footer';
import JudgeQuickAccess from './components/JudgeQuickAccess';
import StickyMobileNav from './components/StickyMobileNav';

export default function App() {
  const [bootDone, setBootDone] = useState(false);

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 font-sans selection:bg-cyan-400/20 selection:text-cyan-200">
      {!bootDone && <BootSplash onDone={() => setBootDone(true)} duration={2000} />}
      
      <ScrollProgress className="top-0" />
      
      {bootDone && (
        <div className="animate-in fade-in duration-1000">
          <Header />
          <main>
            <Hero />
            <LinkCards />
            <StatusSection />
            <DemoSection />
            <ScreensGallery />
            <ClosedLoopSection />
            <VerifySection />
            <PSMatrixSection />
            <StandardsSection />
            <DocsIndex />
            <LimitationsSection />
            <FAQSection />
            <PackSection />
          </main>
          <ContactFooter />
          <LargeNameFooter />
          <JudgeQuickAccess />
          <StickyMobileNav />
        </div>
      )}
    </div>
  );
}
`);

write('src/components/JudgeQuickAccess.jsx', `
import React from 'react';
import { Link as LinkIcon, FileText, CheckCircle, Package } from 'lucide-react';

export function JudgeQuickAccess() {
  return (
    <div className="hidden lg:flex fixed bottom-6 right-6 flex-col gap-2 z-40">
      <div className="p-3 rounded-2xl bg-[#050505]/80 backdrop-blur-xl border border-white/10 shadow-2xl flex flex-col gap-2">
        <div className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest px-2 pb-1 border-b border-white/5 mb-1">Quick Links</div>
        <a href="#demo" className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-white/5 text-sm text-neutral-300 hover:text-white transition-colors">
          <LinkIcon className="w-4 h-4 text-cyan-400" /> Demo
        </a>
        <a href="#ps-matrix" className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-white/5 text-sm text-neutral-300 hover:text-white transition-colors">
          <CheckCircle className="w-4 h-4 text-cyan-400" /> PS Matrix
        </a>
        <a href="#pack" className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-white/5 text-sm text-neutral-300 hover:text-white transition-colors">
          <Package className="w-4 h-4 text-cyan-400" /> Evaluator Pack
        </a>
        <a href="#faq" className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-white/5 text-sm text-neutral-300 hover:text-white transition-colors">
          <FileText className="w-4 h-4 text-cyan-400" /> FAQ
        </a>
      </div>
    </div>
  );
}
export default JudgeQuickAccess;
`);

write('src/components/StickyMobileNav.jsx', `
import React from 'react';
import { Home, Play, FileText, Package } from 'lucide-react';

export function StickyMobileNav() {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#050505]/90 backdrop-blur-lg border-t border-white/10 px-4 py-3 flex justify-around">
      <a href="#" className="flex flex-col items-center gap-1 text-cyan-400">
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
`);

console.log("Done.");
