import React from 'react';
import { useRouter } from '../context/RouterContext';
import { Home, Image as ImageIcon, Activity, FileText, Users } from 'lucide-react';

export function StickyMobileNav() {
  const { currentRoute, navigate } = useRouter();

  const NAV_ITEMS = [
    { id: 'overview', label: 'Hub', icon: Home },
    { id: 'screens', label: 'Screens', icon: ImageIcon },
    { id: 'evidence', label: 'Evidence', icon: Activity },
    { id: 'docs', label: 'Docs', icon: FileText },
    { id: 'team', label: 'Team', icon: Users },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0c0d0e]/95 backdrop-blur-xl border-t border-white/10 px-2 py-2 flex justify-around shadow-2xl">
      {NAV_ITEMS.map((item) => {
        const isActive = currentRoute === item.id;
        return (
          <button
            key={item.id}
            onClick={() => navigate(item.id)}
            className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors cursor-pointer ${
              isActive ? 'text-orange-500 font-bold' : 'text-neutral-400 hover:text-white'
            }`}
          >
            <item.icon className="w-4 h-4" />
            <span className="text-[10px] font-mono">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default StickyMobileNav;
