import React from 'react';
import PageShell from '../components/PageShell';
import ClosedLoopSection from '../components/ClosedLoopSection';
import VerifySection from '../components/VerifySection';
import ValidationBenchmarks from '../components/ValidationBenchmarks';

export default function EvidencePage() {
  return (
    <PageShell currentKey="evidence">
      {/* 4-Step Closed Loop Flow & 12 Experiments Matrix (E01-E12) */}
      <ClosedLoopSection />

      {/* Tabbed Interactive CLI Verifier */}
      <VerifySection />

      {/* Empirical Hardware Benchmarks */}
      <ValidationBenchmarks />
    </PageShell>
  );
}
