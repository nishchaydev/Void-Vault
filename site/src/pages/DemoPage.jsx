import React from 'react';
import PageShell from '../components/PageShell';
import DemoSection from '../components/DemoSection';

export default function DemoPage() {
  return (
    <PageShell currentKey="demo">
      <DemoSection />
    </PageShell>
  );
}
