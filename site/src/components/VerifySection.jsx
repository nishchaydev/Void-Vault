import React, { useState } from 'react';
import { Terminal, Copy, Check, ShieldCheck, FileCode, CheckCircle2 } from 'lucide-react';
import { GlowingEffect } from './ui/glowing-effect';

export default function VerifySection() {
  const [activeTab, setActiveTab] = useState('schema');
  const [copied, setCopied] = useState(false);

  const SNIPPETS = {
    schema: `# 1. Clone public validation repository
git clone https://github.com/nishchaydev/Void-Vault.git
cd Void-Vault

# 2. Validate all 12 experiment summaries against JSON schema
python -c "
import json, jsonschema, glob
schema = json.load(open('validation/schemas/summary.schema.json', encoding='utf-8'))
for f in sorted(glob.glob('validation/results/E*/summary.json')):
    data = json.load(open(f, encoding='utf-8'))
    jsonschema.validate(instance=data, schema=schema)
    print(f'OK: {data[\"experiment_id\"]} ({data[\"experiment_title\"]})')
"
# Output: 12/12 experiment summaries VALID!`,

    tamper: `# 1. Inspect E04 Ledger Tamper Resistance results
cat validation/results/E04/summary.json | grep -A 5 "detection_rate_pct"

# 2. Manually verify SHA-256 hash chaining on sample audit session:
# Verify entry hash: SHA256(canonical_json(entry) + bytes(prev_hash))
# If any single bit is flipped, chain verification halts immediately:
# > ERROR: Hash mismatch at block 2. Cryptographic audit chain invalid.`,

    cert: `# Verify Ed25519 Digital Certificate Signature
# using OpenSSL or standard forensic CLI tooling:
openssl dgst -sha256 -verify ed25519_authority.pub \\
  -signature sample_artifacts/certificate_001.sig \\
  sample_artifacts/certificate_001.json

# Verified OK: Certificate issued by Void Vault Engine v1.0-sih-r2
# Matches Merkle Root: c78ebe9a37d7df226cfc65dc3a158e86e6f070a4`
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(SNIPPETS[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="verify" className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto relative">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-xs font-mono font-semibold tracking-widest text-orange-500 uppercase">
          07 — INDEPENDENT VERIFICATION
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3 mb-4 tracking-tight">
          Verify It Yourself
        </h2>
        <p className="text-neutral-400 text-sm leading-relaxed">
          Zero blind trust. Download our raw datasets, schemas, and cryptographic proofs, then run the verification commands locally on your own machine.
        </p>
      </div>

      <div className="relative rounded-2xl border border-white/[0.08] bg-[#0c0d0e]/95 overflow-hidden shadow-2xl">
        <GlowingEffect hoverLiquid spread={40} proximity={50} />

        {/* Tab Headers */}
        <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3 bg-white/[0.02]">
          <div className="flex items-center gap-2 overflow-x-auto">
            {[
              { id: 'schema', label: 'Schema Validation (E01-E12)', icon: FileCode },
              { id: 'tamper', label: 'Ledger Tamper Audit (E04)', icon: ShieldCheck },
              { id: 'cert', label: 'Ed25519 Cert Signature', icon: Terminal }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-white/10 bg-white/5 hover:bg-white/10 text-neutral-300 font-mono text-xs transition-colors cursor-pointer shrink-0 ml-2"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>

        {/* Terminal Window */}
        <div className="p-6 font-mono text-xs sm:text-sm text-neutral-300 overflow-x-auto leading-relaxed bg-[#080809]">
          <pre className="text-orange-300/90 whitespace-pre font-mono">
            {SNIPPETS[activeTab]}
          </pre>
        </div>
      </div>
    </section>
  );
}
