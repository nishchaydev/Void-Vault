import React, { useState } from 'react';
import { Shield, ShieldCheck, AlertTriangle, Info, CheckCircle2, FileText, ExternalLink } from 'lucide-react';
import { GlowingEffect } from './ui/glowing-effect';

const STANDARDS = [
  { id: 1, name: "Write Zero (Single Pass)", nistLevel: "Clear", ieeeCategory: "Logical", passes: 1, media: "All Drives", status: "Supported", desc: "Baseline single-pass zero overwrite across addressable blocks." },
  { id: 2, name: "Random Data (CSPRNG)", nistLevel: "Clear", ieeeCategory: "Logical", passes: 1, media: "All Drives", status: "Supported", desc: "Cryptographically secure pseudo-random stream pass." },
  { id: 3, name: "DoD 5220.22-M", nistLevel: "Clear", ieeeCategory: "Legacy Purge", passes: 3, media: "HDD / Legacy", status: "Supported", desc: "Standard 3-pass overwrite (0x00, 0xFF, Random) with verify." },
  { id: 4, name: "DoD 5220.22-M (ECE)", nistLevel: "Clear", ieeeCategory: "Legacy Purge", passes: 7, media: "HDD / Magnetic", status: "Supported", desc: "7-pass high-security clearing with alternating bit patterns." },
  { id: 5, name: "Gutmann Algorithm", nistLevel: "Clear", ieeeCategory: "Legacy", passes: 35, media: "HDD / MFM / RLL", status: "Supported", desc: "Classic 35-pass magnetic encoding neutralizer." },
  { id: 6, name: "RCMP TSSIT OPS-II", nistLevel: "Clear", ieeeCategory: "Government", passes: 7, media: "HDD", status: "Supported", desc: "Royal Canadian Mounted Police 7-pass alternating pattern." },
  { id: 7, name: "HMG IS5 Baseline", nistLevel: "Clear", ieeeCategory: "Government", passes: 1, media: "All Drives", status: "Supported", desc: "UK Government Infosec standard single-pass zero." },
  { id: 8, name: "HMG IS5 Enhanced", nistLevel: "Clear", ieeeCategory: "Government", passes: 3, media: "HDD", status: "Supported", desc: "UK Government Infosec standard 3-pass (Zero, One, Random)." },
  { id: 9, name: "VSITR (German BSI)", nistLevel: "Clear", ieeeCategory: "Government", passes: 7, media: "HDD", status: "Supported", desc: "Federal Office for Information Security 7-pass pattern." },
  { id: 10, name: "BSI/VSITR Enhanced", nistLevel: "Clear", ieeeCategory: "Government", passes: 7, media: "HDD / Solid-State", status: "Supported", desc: "Enhanced German BSI standard with complementary bit toggling." },
  { id: 11, name: "GOST R 50739-95", nistLevel: "Clear", ieeeCategory: "Government", passes: 2, media: "HDD", status: "Supported", desc: "Russian State Standard 2-pass sanitization (Zero, Random)." },
  { id: 12, name: "Bruce Schneier Algorithm", nistLevel: "Clear", ieeeCategory: "Academic", passes: 7, media: "HDD", status: "Supported", desc: "7-pass algorithm (Pass 1-2: 0x00, 0xFF; Pass 3-7: CSPRNG)." },
  { id: 13, name: "Peter Gutmann Pfitzner", nistLevel: "Clear", ieeeCategory: "Academic", passes: 33, media: "HDD", status: "Supported", desc: "33-pass variation optimized for magnetic domains." },
  { id: 14, name: "NVMe Sanitize (Block Erase)", nistLevel: "Purge", ieeeCategory: "Purge", passes: 1, media: "NVMe SSD", status: "Supported", desc: "Firmware-level controller purge; erases user data, spare blocks, and over-provisioned areas." },
  { id: 15, name: "NVMe Crypto-Erase (Sanitize)", nistLevel: "Purge", ieeeCategory: "Purge", passes: 1, media: "NVMe SSD / SED", status: "Supported", desc: "Cryptographic key destruction rendering all encrypted NAND inaccessible within milliseconds." },
  { id: 16, name: "ATA Secure Erase / Enhanced", nistLevel: "Purge", ieeeCategory: "Purge", passes: 1, media: "SATA SSD / HDD", status: "Supported", desc: "Low-level hardware controller command with frozen drive unlock detection." },
  { id: 17, name: "BSA 2023 Sec 63 & ISO 27037", nistLevel: "Audit", ieeeCategory: "Legal Admissibility", passes: "N/A", media: "All Systems", status: "Certified", desc: "Judicial evidence certificate generation signed with Ed25519 & SHA-256 Merkle root." },
];

export function StandardsSection() {
  const [filter, setFilter] = useState('ALL');

  const filtered = filter === 'ALL'
    ? STANDARDS
    : filter === 'PURGE'
    ? STANDARDS.filter(s => s.nistLevel === 'Purge')
    : STANDARDS.filter(s => s.nistLevel === 'Clear');

  return (
    <section id="standards" className="py-12 md:py-16 px-4 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <span className="text-xs font-mono font-semibold tracking-widest text-orange-500 uppercase">
          05 — REGULATORY & TECHNICAL COMPLIANCE
        </span>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white mt-3 mb-4 tracking-tight">
          17 Sanitization Standards Matrix
        </h2>
        <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
          Full conformance to NIST SP 800-88 Rev. 2 (Clear & Purge), IEEE 2883-2022, DoD 5220.22-M, and Section 63 of Bharatiya Sakshya Adhiniyam (BSA) 2023.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[
          { id: 'ALL', label: 'All 17 Standards' },
          { id: 'PURGE', label: 'Hardware Purge (NVMe / ATA)' },
          { id: 'CLEAR', label: 'Logical Clear (Multi-Pass)' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
              filter === tab.id
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40 font-bold shadow-[0_0_12px_rgba(255,86,0,0.15)]'
                : 'bg-white/[0.02] text-neutral-400 hover:text-white border border-white/5'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Standards Table */}
      <div className="overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#0c0d0e]/90 shadow-2xl mb-12">
        <table className="w-full text-left text-xs sm:text-sm whitespace-nowrap">
          <thead className="bg-white/[0.03] text-neutral-400 border-b border-white/[0.08] font-mono text-[11px] uppercase tracking-wider">
            <tr>
              <th className="px-5 py-3.5">#</th>
              <th className="px-5 py-3.5">Standard Name</th>
              <th className="px-5 py-3.5">NIST Level</th>
              <th className="px-5 py-3.5">IEEE Category</th>
              <th className="px-5 py-3.5">Passes</th>
              <th className="px-5 py-3.5">Target Media</th>
              <th className="px-5 py-3.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04] text-neutral-300 font-sans">
            {filtered.map((item) => (
              <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-5 py-3.5 font-mono text-orange-500 font-semibold">{item.id}</td>
                <td className="px-5 py-3.5">
                  <div className="font-bold text-white group-hover:text-orange-300 transition-colors">{item.name}</div>
                  <div className="text-[11px] text-neutral-500 font-light max-w-sm whitespace-normal mt-0.5">{item.desc}</div>
                </td>
                <td className="px-5 py-3.5">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase ${
                    item.nistLevel === 'Purge'
                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                      : item.nistLevel === 'Audit'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-white/10 text-neutral-300 border border-white/10'
                  }`}>
                    {item.nistLevel}
                  </span>
                </td>
                <td className="px-5 py-3.5 font-mono text-neutral-400 text-xs">{item.ieeeCategory}</td>
                <td className="px-5 py-3.5 font-mono text-white font-bold">{item.passes}</td>
                <td className="px-5 py-3.5 text-neutral-400 text-xs">{item.media}</td>
                <td className="px-5 py-3.5">
                  <span className="inline-flex items-center gap-1 text-emerald-400 font-mono text-xs font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Transparent Technical Disclosures */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl bg-[#0c0d0e]/80 border border-white/[0.06] shadow-xl">
          <div className="flex items-center gap-2 mb-2.5 text-orange-400 font-mono text-xs font-bold uppercase">
            <Info className="w-4 h-4" />
            <span>TRIM Commands: Advisory Only</span>
          </div>
          <p className="text-xs text-neutral-300 leading-relaxed">
            TRIM is implemented solely as an advisory hint. It is <strong>explicitly NOT sanitization</strong> because SSD controller response behavior is proprietary. Void Vault supplements higher-level Purge commands with TRIM rather than relying on it.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0c0d0e]/80 border border-white/[0.06] shadow-xl">
          <div className="flex items-center gap-2 mb-2.5 text-orange-400 font-mono text-xs font-bold uppercase">
            <AlertTriangle className="w-4 h-4" />
            <span>Frozen Drive Lockout Handling</span>
          </div>
          <p className="text-xs text-neutral-300 leading-relaxed">
            Modern BIOS / OS kernels freeze ATA/NVMe controllers at boot to prevent unauthorized firmware commands. Void Vault detects frozen states actively and falls back to multi-pass Clear with transparent disclosure in audit certificates.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0c0d0e]/80 border border-white/[0.06] shadow-xl">
          <div className="flex items-center gap-2 mb-2.5 text-orange-400 font-mono text-xs font-bold uppercase">
            <Shield className="w-4 h-4" />
            <span>USB Bridge SAT Translations</span>
          </div>
          <p className="text-xs text-neutral-300 leading-relaxed">
            External USB enclosures frequently block low-level passthrough commands. Void Vault initiates SAT (SCSI ATA Translation) passthrough, and automatically degrades to verified multi-pass Clear if passthrough is blocked by the bridge chipset.
          </p>
        </div>
      </div>
    </section>
  );
}

export default StandardsSection;
