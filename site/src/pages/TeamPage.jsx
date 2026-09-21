import React from 'react';
import PageShell from '../components/PageShell';
import TeamSection from '../components/TeamSection';

export default function TeamPage() {
  return (
    <PageShell currentKey="team">
      <TeamSection />
    </PageShell>
  );
}
