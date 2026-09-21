
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
