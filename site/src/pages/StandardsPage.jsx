import React from 'react';
import PageShell from '../components/PageShell';
import StandardsSection from '../components/StandardsSection';

export default function StandardsPage() {
  return (
    <PageShell currentKey="standards">
      <StandardsSection />
    </PageShell>
  );
}
