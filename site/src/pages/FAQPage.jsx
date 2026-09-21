import React from 'react';
import PageShell from '../components/PageShell';
import FAQSection from '../components/FAQSection';
import LimitationsSection from '../components/LimitationsSection';

export default function FAQPage() {
  return (
    <PageShell currentKey="faq">
      <FAQSection />
      <LimitationsSection />
    </PageShell>
  );
}
