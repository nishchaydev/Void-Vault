import React from 'react';
import PageShell from '../components/PageShell';
import DocsIndex from '../components/DocsIndex';

export default function DocsPage() {
  return (
    <PageShell currentKey="docs">
      <DocsIndex />
    </PageShell>
  );
}
