import React, { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import ProjectAtAGlance from './components/ProjectAtAGlance';
import WhyVoidVault from './components/WhyVoidVault';
import USPs from './components/USPs';
import PrototypeSnapshots from './components/PrototypeSnapshots';
import LiveDemo from './components/LiveDemo';
import ArchitectureSection from './components/ArchitectureSection';
import DiagramsLibrary from './components/DiagramsLibrary';
import ResearchStandards from './components/ResearchStandards';
import ValidationBenchmarks from './components/ValidationBenchmarks';
import TeamProgress from './components/TeamProgress';
import TeamSection from './components/TeamSection';
import GovernmentImpact from './components/GovernmentImpact';
import BenefitsSection from './components/BenefitsSection';
import BeforeVsAfter from './components/BeforeVsAfter';
import ProjectResources from './components/ProjectResources';
import GitHubSection from './components/GitHubSection';
import FinalCTA from './components/FinalCTA';
import Footer from './components/Footer';
import JudgeQuickAccess from './components/JudgeQuickAccess';
import StickyMobileNav from './components/StickyMobileNav';
import LightboxModal from './components/LightboxModal';
import BootSplash from './components/shell/BootSplash';
import ScrollProgress from './components/ui/scroll-progress';

export default function App() {
  const [isBooting, setIsBooting] = useState(true);
  const [lightbox, setLightbox] = useState({
    isOpen: false,
    imageSrc: '',
    title: '',
    description: ''
  });

  const handleOpenLightbox = (imageSrc, title, description) => {
    setLightbox({
      isOpen: true,
      imageSrc,
      title,
      description
    });
  };

  const handleCloseLightbox = () => {
    setLightbox(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 selection:bg-cyan-500/20 selection:text-white overflow-x-hidden font-sans">
      {/* Top Scroll Reading Progress */}
      <ScrollProgress />

      {/* Orbit-Style Cinematic Boot Sequence */}
      {isBooting && (
        <BootSplash
          onDone={() => setIsBooting(false)}
          duration={2800}
        />
      )}

      {/* Global Header */}
      <Header onReplayBoot={() => setIsBooting(true)} />

      {/* 01 — Hero (Orbit Staggered Typography, Acme Sparkles, Conic Glow Buttons) */}
      <Hero />

      {/* 02 — The Project at a Glance */}
      <ProjectAtAGlance />

      {/* 03 — Why Void Vault? */}
      <WhyVoidVault />

      {/* 04 — USPs */}
      <USPs />

      {/* 05 — Prototype Snapshots (Real Module UI Captures) */}
      <PrototypeSnapshots onOpenLightbox={handleOpenLightbox} />

      {/* 06 — Live Video & 60s Battle Demo */}
      <LiveDemo />

      {/* 07 — System Architecture */}
      <ArchitectureSection onOpenLightbox={handleOpenLightbox} />

      {/* 08 — Dedicated Technical Diagrams Library (Genuine Vector SVGs, 0 Slides) */}
      <DiagramsLibrary onOpenLightbox={handleOpenLightbox} />

      {/* 09 — Comprehensive Research Archive (52 Academic Papers + 24 Defense Dossiers) */}
      <ResearchStandards />

      {/* 10 — Validation / Physical Benchmarks */}
      <ValidationBenchmarks />

      {/* 11 — Team Work Progress & Roadmap */}
      <TeamProgress />

      {/* 12 — Team eMitra Roster */}
      <TeamSection />

      {/* 13 — Government & NTRO Defense Impact */}
      <GovernmentImpact />

      {/* 14 — Benefits Breakdown */}
      <BenefitsSection />

      {/* 15 — Before vs After */}
      <BeforeVsAfter />

      {/* 16 — Central Arsenal & Comprehensive Repository Link Tree */}
      <ProjectResources />

      {/* 17 — GitHub Repository & Open Source Verification */}
      <GitHubSection />

      {/* 18 — Final Evaluation Call-to-Action */}
      <FinalCTA />

      {/* Footer (Orbit-Style Large Name Footer) */}
      <Footer />

      {/* Judge Quick Access Speed-Dial Floating Menu */}
      <JudgeQuickAccess />

      {/* Mobile-Only Sticky Bottom Navigation (QR Code Traffic Optimized) */}
      <StickyMobileNav />

      {/* Fullscreen High-Resolution Lightbox Modal */}
      <LightboxModal
        isOpen={lightbox.isOpen}
        onClose={handleCloseLightbox}
        imageSrc={lightbox.imageSrc}
        title={lightbox.title}
        description={lightbox.description}
      />
    </div>
  );
}
