
import React from 'react';
import { Play } from 'lucide-react';

export function DemoSection() {
  return (
    <section id="demo" className="py-16 px-4 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold text-white mb-8">Demonstration</h2>
      <div className="relative aspect-video rounded-xl bg-neutral-900 border border-white/10 overflow-hidden group flex items-center justify-center cursor-pointer">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIvPjwvc3ZnPg==')] opacity-50" />
        <div className="w-20 h-20 rounded-full bg-cyan-500/20 border border-cyan-500/50 flex items-center justify-center group-hover:bg-cyan-500/30 transition-all group-hover:scale-110 z-10 backdrop-blur-sm shadow-[0_0_30px_rgba(56,189,248,0.3)]">
          <Play className="w-8 h-8 text-cyan-400 ml-1 fill-cyan-400" />
        </div>
      </div>
      <div className="mt-4 flex justify-between items-center text-sm">
        <p className="text-neutral-400 font-mono">Flow: Erase → Carve back → Certificate → Verify → Tamper → Verify fails</p>
        <a href="#" className="text-cyan-400 hover:underline">Transcript →</a>
      </div>
    </section>
  );
}
export default DemoSection;
