
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
                <td className="px-4 py-3 font-mono text-orange-500 text-xs">Req {i}.0</td>
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
