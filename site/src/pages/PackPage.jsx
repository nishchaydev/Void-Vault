import React from 'react';
import PageShell from '../components/PageShell';
import PackSection from '../components/PackSection';

export default function PackPage() {
  return (
    <PageShell currentKey="pack">
      <PackSection />
    </PageShell>
  );
}
