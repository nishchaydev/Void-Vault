import React from 'react';
import PageShell from '../components/PageShell';
import PSMatrixSection from '../components/PSMatrixSection';

export default function PSMatrixPage() {
  return (
    <PageShell currentKey="ps-matrix">
      <PSMatrixSection />
    </PageShell>
  );
}
