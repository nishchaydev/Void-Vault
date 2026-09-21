
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
