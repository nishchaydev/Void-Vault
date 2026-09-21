
import React from 'react';

export function ScreensGallery() {
  return (
    <section id="screens" className="py-16 px-4 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-8">Screenshots</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="group rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
            <div className="aspect-[4/3] bg-neutral-900 flex items-center justify-center border-b border-white/5 group-hover:bg-neutral-800 transition-colors">
              <span className="text-neutral-600 font-mono text-sm">[Pending Screen {i+1}]</span>
            </div>
            <div className="p-4">
              <div className="text-xs text-orange-500 font-mono mb-1">Module {i+1}</div>
              <h3 className="text-white text-sm font-medium mb-1">Feature Demonstration</h3>
              <p className="text-neutral-500 text-xs line-clamp-2">Matches PS requirement section X.Y showing capabilities.</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
export default ScreensGallery;
