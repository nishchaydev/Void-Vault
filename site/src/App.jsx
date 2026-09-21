import React from 'react';
import { ScrollProgress } from './components/ui/scroll-progress';
import Header from './components/Header';
import ContactFooter from './components/ContactFooter';
import { LargeNameFooter } from './components/ui/large-name-footer';
import JudgeQuickAccess from './components/JudgeQuickAccess';
import StickyMobileNav from './components/StickyMobileNav';
import { RouterProvider, useRouter } from './context/RouterContext';

// Dedicated Subpages
import OverviewPage from './pages/OverviewPage';
import DemoPage from './pages/DemoPage';
import ScreenshotsPage from './pages/ScreenshotsPage';
import EvidencePage from './pages/EvidencePage';
import PSMatrixPage from './pages/PSMatrixPage';
import DocsPage from './pages/DocsPage';
import StandardsPage from './pages/StandardsPage';
import TeamPage from './pages/TeamPage';
import FAQPage from './pages/FAQPage';
import PackPage from './pages/PackPage';

function PageRouter() {
  const { currentRoute } = useRouter();

  switch (currentRoute) {
    case 'demo':
      return <DemoPage />;
    case 'screens':
      return <ScreenshotsPage />;
    case 'evidence':
      return <EvidencePage />;
    case 'ps-matrix':
      return <PSMatrixPage />;
    case 'docs':
      return <DocsPage />;
    case 'standards':
      return <StandardsPage />;
    case 'team':
      return <TeamPage />;
    case 'faq':
      return <FAQPage />;
    case 'pack':
      return <PackPage />;
    case 'overview':
    default:
      return <OverviewPage />;
  }
}

export default function App() {
  return (
    <RouterProvider>
      <div className="min-h-screen bg-[#050505] text-neutral-200 font-sans selection:bg-orange-500/20 selection:text-orange-200 antialiased overflow-x-hidden">
        {/* Top reading progress indicator */}
        <ScrollProgress className="top-0" />
        
        {/* Top Header with multi-page navigation tabs */}
        <Header />

        {/* Active Dedicated Page */}
        <main className="relative z-10 min-h-[75vh]">
          <PageRouter />
        </main>

        {/* Persistent Footers & Navigation Helpers */}
        <ContactFooter />
        <LargeNameFooter />
        <JudgeQuickAccess />
        <StickyMobileNav />
      </div>
    </RouterProvider>
  );
}
