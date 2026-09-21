import React from 'react';
import { useRouter } from '../context/RouterContext';
import { GlowingEffect } from './ui/glowing-effect';
import { 
  Play, 
  FileText, 
  CheckCircle2, 
  Image as ImageIcon, 
  Activity, 
  GitMerge, 
  ShieldCheck, 
  Users, 
  Package, 
  HelpCircle, 
  Mail,
  ArrowRight
} from 'lucide-react';

const LINKS = [
  { 
    id: 'screens', 
    icon: ImageIcon, 
    title: 'Screenshots & Visual Flows', 
    desc: 'Live high-res captures of Dashboard, Shredder, Recovery & Compliance modules', 
    badge: '10 High-Res Screens',
    route: 'screens'
  },
  { 
    id: 'evidence', 
    icon: Activity, 
    title: 'Evidence Harness & Part C', 
    desc: '12 reproducible test protocols (E01-E12), tamper matrix, and CLI verifier', 
    badge: '12 / 12 Certified',
    route: 'evidence'
  },
  { 
    id: 'docs', 
    icon: FileText, 
    title: 'Complete Documentation Dossier', 
    desc: '18 formal technical specifications, threat models, and research papers', 
    badge: '18 Docs Dossier',
    route: 'docs'
  },
  { 
    id: 'ps-matrix', 
    icon: CheckCircle2, 
    title: 'PS Traceability Matrix', 
    desc: 'Every clause of NTRO PS SIH26149 mapped to features and verification artifacts', 
    badge: '100% PS Coverage',
    route: 'ps-matrix'
  },
  { 
    id: 'demo', 
    icon: Play, 
    title: 'Demo Video & Walkthrough', 
    desc: '2-minute walkthrough of erasure, carving, and cryptographic audit workflows', 
    badge: 'Video Walkthrough',
    route: 'demo'
  },
  { 
    id: 'standards', 
    icon: ShieldCheck, 
    title: 'Standards Alignment Matrix', 
    desc: '17 sanitization standards (NIST SP 800-88, DoD, Gutmann) & BSA 2023 Sec 63', 
    badge: '17 Standards',
    route: 'standards'
  },
  { 
    id: 'team', 
    icon: Users, 
    title: 'Team eMitra Roster', 
    desc: 'Meet the team behind Void Vault (Team ID 146878): Nishchay, Vivek, and developers', 
    badge: 'Team ID 146878',
    route: 'team'
  },
  { 
    id: 'faq', 
    icon: HelpCircle, 
    title: 'Evaluator FAQ & Limitations', 
    desc: '15 concise evaluator questions and 13 transparent technical limitations', 
    badge: '15 Q&A + Limits',
    route: 'faq'
  },
  { 
    id: 'pack', 
    icon: Package, 
    title: 'Offline Evaluator Pack', 
    desc: 'Air-gapped verification bundle, checksums, and offline validation scripts', 
    badge: 'Offline Bundle',
    route: 'pack'
  },
];

export default function LinkCards() {
  const { navigate } = useRouter();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {LINKS.map((link) => (
        <div
          key={link.id}
          onClick={() => navigate(link.route)}
          className="relative group rounded-2xl bg-[#0c0d0e]/90 border border-white/[0.06] hover:border-orange-500/40 p-5 flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] cursor-pointer shadow-xl"
        >
          <GlowingEffect hoverLiquid spread={35} proximity={50} />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500 group-hover:bg-orange-500/20 group-hover:text-orange-400 transition-colors">
                <link.icon className="w-5 h-5" />
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono text-neutral-400 bg-white/5 border border-white/10 group-hover:border-orange-500/30 group-hover:text-orange-300 transition-colors">
                {link.badge}
              </span>
            </div>

            <h3 className="text-base font-bold text-white group-hover:text-orange-400 transition-colors mb-1.5 flex items-center gap-1.5">
              <span>{link.title}</span>
              <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-orange-500" />
            </h3>
            <p className="text-xs text-neutral-400 leading-relaxed font-light">
              {link.desc}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-white/[0.04] relative z-10 flex items-center justify-between text-[11px] font-mono text-neutral-500 group-hover:text-orange-400/80 transition-colors">
            <span>Open Dedicated Page</span>
            <span>→</span>
          </div>
        </div>
      ))}
    </div>
  );
}
