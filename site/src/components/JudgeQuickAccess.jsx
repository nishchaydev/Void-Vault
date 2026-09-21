import React from 'react';
import { useRouter } from '../context/RouterContext';
import { Play, CheckCircle2, Package, HelpCircle, Activity, Image as ImageIcon } from 'lucide-react';

export function JudgeQuickAccess() {
  const { currentRoute, navigate } = useRouter();

  const QUICK_ITEMS = [
    { id: 'screens', label: 'Screenshots', icon: ImageIcon },
    { id: 'evidence', label: 'Evidence (Part C)', icon: Activity },
    { id: 'ps-matrix', label: 'PS Matrix', icon: CheckCircle2 },
    { id: 'demo', label: 'Demo', icon: Play },
    { id: 'pack', label: 'Pack', icon: Package },
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
  ];

  return (
    <div className="hidden lg:flex fixed bottom-6 right-6 flex-col gap-2 z-40 animate-in fade-in duration-300">
      <div className="p-2.5 rounded-2xl bg-[#0c0d0e]/90 backdrop-blur-xl border border-white/10 shadow-2xl flex flex-col gap-1 w-44">
        <div className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest px-2 pb-1 border-b border-white/5 mb-1 font-semibold flex items-center justify-between">
          <span>Quick Hopper</span>
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
        </div>
        {QUICK_ITEMS.map((item) => {
          const isActive = currentRoute === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer text-left ${
                isActive
                  ? 'bg-orange-500/20 text-orange-400 font-bold border border-orange-500/30'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className={`w-3.5 h-3.5 ${isActive ? 'text-orange-400' : 'text-orange-500/70'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default JudgeQuickAccess;
