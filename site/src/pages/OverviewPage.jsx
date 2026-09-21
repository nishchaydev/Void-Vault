import React from 'react';
import Hero from '../components/Hero';
import LinkCards from '../components/LinkCards';
import StatusSection from '../components/StatusSection';

export default function OverviewPage() {
  return (
    <div className="animate-in fade-in duration-300">
      {/* Cinematic Orbit Hero */}
      <Hero />

      {/* Directory Link Cards with Direct 1-Click Page Routing */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 mb-16">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-xs font-mono font-semibold tracking-widest text-orange-500 uppercase">
            EVALUATOR DIRECTORY
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2 tracking-tight">
            Jump Directly to Any Section
          </h2>
          <p className="text-neutral-400 text-xs sm:text-sm mt-1">
            Zero endless scrolling. Click any card below or use the top menu to view dedicated, focused pages.
          </p>
        </div>
        <LinkCards />
      </div>

      {/* Real Verified Status Highlights */}
      <StatusSection />
    </div>
  );
}
