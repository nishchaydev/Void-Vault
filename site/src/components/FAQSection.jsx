
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
