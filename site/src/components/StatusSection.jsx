
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
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                m.type === 'implemented' ? 'bg-neutral-200 text-black border-neutral-300' :
                m.type === 'prototype' ? 'bg-neutral-800 text-neutral-300 border-neutral-600' :
                'bg-neutral-900 text-neutral-500 border-neutral-800'
              }`}>
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
