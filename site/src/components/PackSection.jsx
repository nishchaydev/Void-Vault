import React, { useState } from 'react';
import { Download, Check, Copy, Package, ShieldCheck, Terminal, FileCode, CheckCircle2 } from 'lucide-react';
import { GlowingEffect } from './ui/glowing-effect';

const PACK_SHA256 = "8a2d32afc35a98a6335c714a923de414cb6ab536d639a2c981755d10f9f2b9b8";

export function PackSection() {
  const [copied, setCopied] = useState(false);
  const BASE = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
  const downloadUrl = `${BASE}/void-vault-evaluator-pack.zip`;

  const copyHash = () => {
    navigator.clipboard?.writeText(PACK_SHA256);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="pack" className="py-12 md:py-16 px-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <span className="text-xs font-mono font-semibold tracking-widest text-orange-500 uppercase">
          10 — AIR-GAPPED VERIFICATION BUNDLE
        </span>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white mt-3 mb-4 tracking-tight">
          Offline Evaluator Pack
        </h2>
        <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
          Full standalone verification bundle engineered for evaluators reviewing Void Vault inside air-gapped SCIF facilities or offline evaluation workstations.
        </p>
      </div>

      {/* Main Download Card */}
      <div className="relative rounded-3xl border border-orange-500/30 bg-[#0c0d0e]/90 p-8 sm:p-10 shadow-2xl overflow-hidden mb-10">
        <GlowingEffect hoverLiquid spread={50} proximity={65} />

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-500 mb-6 shadow-[0_0_25px_rgba(255,86,0,0.2)]">
            <Package className="w-8 h-8" />
          </div>

          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Void Vault Evaluator Pack v1.0
          </h3>
          <p className="text-neutral-400 text-xs sm:text-sm max-w-lg mb-6">
            Includes all 17 specification documents, technical data schemas (YML), legal attestation forms, and manifest signatures.
          </p>

          {/* Download Action */}
          <a
            href={downloadUrl}
            download="void-vault-evaluator-pack.zip"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white font-bold text-sm sm:text-base transition-all shadow-[0_0_30px_rgba(255,86,0,0.35)] hover:scale-[1.02] cursor-pointer"
          >
            <Download className="w-5 h-5" />
            <span>Download Offline Bundle (.ZIP)</span>
          </a>

          <div className="mt-3 text-[11px] font-mono text-neutral-400">
            Compressed size: ~29 KB • Zero external runtime dependencies
          </div>

          {/* Checksum Box */}
          <div className="mt-8 w-full max-w-2xl rounded-xl bg-black/60 border border-white/10 p-4 text-left">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase font-bold text-neutral-400 tracking-wider">
                SHA-256 Checksum (Air-Gap Integrity)
              </span>
              <button
                onClick={copyHash}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-[11px] font-mono text-orange-400 hover:text-orange-300 border border-white/10 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy Hash'}</span>
              </button>
            </div>
            <code className="block text-xs font-mono text-neutral-300 break-all bg-white/[0.02] p-2 rounded border border-white/5 select-all">
              {PACK_SHA256}
            </code>
          </div>
        </div>
      </div>

      {/* Verification Instructions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-[#0c0d0e]/80 border border-white/[0.06] shadow-xl">
          <div className="flex items-center gap-2 mb-3 text-orange-400 font-mono text-xs font-bold uppercase">
            <Terminal className="w-4 h-4" />
            <span>Windows PowerShell Verification</span>
          </div>
          <p className="text-xs text-neutral-400 mb-3 font-light">
            Verify the integrity of the downloaded archive prior to transfer to an air-gapped forensic workstation:
          </p>
          <pre className="p-3 rounded-lg bg-black/80 text-orange-300 text-[11px] font-mono overflow-x-auto border border-white/5">
            <code>Get-FileHash void-vault-evaluator-pack.zip -Algorithm SHA256</code>
          </pre>
        </div>

        <div className="p-6 rounded-2xl bg-[#0c0d0e]/80 border border-white/[0.06] shadow-xl">
          <div className="flex items-center gap-2 mb-3 text-orange-400 font-mono text-xs font-bold uppercase">
            <Terminal className="w-4 h-4" />
            <span>Linux / macOS Terminal Verification</span>
          </div>
          <p className="text-xs text-neutral-400 mb-3 font-light">
            Compute the SHA-256 cryptographic digest using standard coreutils:
          </p>
          <pre className="p-3 rounded-lg bg-black/80 text-orange-300 text-[11px] font-mono overflow-x-auto border border-white/5">
            <code>sha256sum void-vault-evaluator-pack.zip</code>
          </pre>
        </div>
      </div>
    </section>
  );
}

export default PackSection;
