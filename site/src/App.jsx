
import React, { useState } from 'react';
import { ScrollProgress } from './components/ui/scroll-progress';
import BootSplash from './components/shell/BootSplash';
import Header from './components/Header';
import Hero from './components/Hero';
import LinkCards from './components/LinkCards';
import StatusSection from './components/StatusSection';
import DemoSection from './components/DemoSection';
import ScreensGallery from './components/ScreensGallery';
import ClosedLoopSection from './components/ClosedLoopSection';
import VerifySection from './components/VerifySection';
import PSMatrixSection from './components/PSMatrixSection';
import StandardsSection from './components/StandardsSection';
import DocsIndex from './components/DocsIndex';
import LimitationsSection from './components/LimitationsSection';
import FAQSection from './components/FAQSection';
import PackSection from './components/PackSection';
import ContactFooter from './components/ContactFooter';
import { LargeNameFooter } from './components/ui/large-name-footer';
import JudgeQuickAccess from './components/JudgeQuickAccess';
import StickyMobileNav from './components/StickyMobileNav';

export default function App() {
  const [bootDone, setBootDone] = useState(false);

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 font-sans selection:bg-orange-500/20 selection:text-orange-200">
      {!bootDone && <BootSplash onDone={() => setBootDone(true)} duration={2000} />}
      
      <ScrollProgress className="top-0" />
      
      {bootDone && (
        <div className="animate-in fade-in duration-1000">
          <Header />
          <main>
            <Hero />
            <LinkCards />
            <StatusSection />
            <DemoSection />
            <ScreensGallery />
            <ClosedLoopSection />
            <VerifySection />
            <PSMatrixSection />
            <StandardsSection />
            <DocsIndex />
            <LimitationsSection />
            <FAQSection />
            <PackSection />
          </main>
          <ContactFooter />
          <LargeNameFooter />
          <JudgeQuickAccess />
          <StickyMobileNav />
        </div>
      )}
    </div>
  );
}
