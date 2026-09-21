
import React from 'react';

export function VerifySection() {
  return (
    <section id="verify" className="py-16 px-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-4">Verify It Yourself</h2>
      <p className="text-neutral-400 mb-6">Run the following commands on our sample artifacts to manually verify the cryptographic chain.</p>
      <div className="rounded-lg bg-[#0a0a0a] border border-white/10 p-4 font-mono text-sm overflow-x-auto">
        <div className="text-neutral-500 mb-1"># 1. Verify the artifact hash</div>
        <div className="text-orange-500 mb-4">$ sha256sum void-vault-evidence-001.json</div>
        
        <div className="text-neutral-500 mb-1"># 2. Tamper the file (flip one byte)</div>
        <div className="text-orange-500 mb-4">$ sed -i 's/success/failure/g' void-vault-evidence-001.json</div>
        
        <div className="text-neutral-500 mb-1"># 3. Verification fails</div>
        <div className="text-orange-500">$ ./vv-cli verify void-vault-evidence-001.json</div>
        <div className="text-red-400 mt-1">&gt; ERROR: Hash mismatch at block 4. Chain invalid.</div>
      </div>
    </section>
  );
}
export default VerifySection;
