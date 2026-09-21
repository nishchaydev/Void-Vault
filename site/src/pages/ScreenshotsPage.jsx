import React from 'react';
import PageShell from '../components/PageShell';
import ScreensGallery from '../components/ScreensGallery';

export default function ScreenshotsPage() {
  return (
    <PageShell currentKey="screens">
      <ScreensGallery />
    </PageShell>
  );
}
