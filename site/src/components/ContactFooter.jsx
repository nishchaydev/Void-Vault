
import React from 'react';

export function ContactFooter() {
  return (
    <section className="py-12 border-t border-white/10 bg-[#050505] text-center">
      <div className="max-w-4xl mx-auto px-4">
        <p className="text-neutral-400 text-sm mb-4">
          To request source access, verification data, or technical inquiries, contact Team eMitra at <a href="mailto:emitra.sih2026@gmail.com" className="text-orange-500 hover:underline">emitra.sih2026@gmail.com</a> or open an issue on <a href="https://github.com/nishchaydev/Void-Vault/issues" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">GitHub</a>.
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
