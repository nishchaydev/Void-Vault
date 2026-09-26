import { 
  LayoutDashboard, Eraser, FileX2, Search, 
  HardDrive, FileText, Settings, Lock, ShieldCheck, Award,
  PanelLeftOpen, Pin, PinOff, EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sidebar as AceternitySidebar, 
  SidebarBody, 
  SidebarLink,
  useSidebar
} from './ui/sidebar';

function SidebarInner() {
  const { open, setOpen, isPinned, setIsPinned, isHidden, setIsHidden } = useSidebar();

  const mainModules = [
    { href: '/dashboard', icon: <LayoutDashboard className="w-4 h-4 flex-shrink-0" />, label: 'Dashboard' },
    { href: '/erasure', icon: <Eraser className="w-4 h-4 flex-shrink-0 text-[#ff5600]" />, label: 'Drive Sanitization', badge: 'M1' },
    { href: '/shredder', icon: <FileX2 className="w-4 h-4 flex-shrink-0 text-amber-600" />, label: 'File Shredder', badge: 'M2' },
    { href: '/recovery', icon: <Search className="w-4 h-4 flex-shrink-0 text-blue-600" />, label: 'File Recovery', badge: 'M3' },
  ];

  const forensicTools = [
    { href: '/devices', icon: <HardDrive className="w-4 h-4 flex-shrink-0 text-[#626260]" />, label: 'Hardware Devices' },
    { href: '/compliance', icon: <Award className="w-4 h-4 flex-shrink-0 text-emerald-600" />, label: 'NIST CFTT Suite' },
    { href: '/reports', icon: <FileText className="w-4 h-4 flex-shrink-0 text-[#626260]" />, label: 'Audit Reports' },
    { href: '/settings', icon: <Settings className="w-4 h-4 flex-shrink-0 text-[#626260]" />, label: 'Engine Settings' },
  ];

  if (isHidden) {
    return (
      <button
        onClick={() => {
          setIsHidden(false);
          setOpen(true);
          setIsPinned(true);
        }}
        title="Show Void Vault Navigation Bar"
        className="fixed top-4 left-4 z-50 p-2 rounded-xl glass-panel text-[#111111] hover:bg-white/95 shadow-md transition-all active:scale-95 flex items-center gap-2 border border-white/90"
      >
        <div className="bg-[#111111] p-1.5 rounded-lg text-white">
          <Lock className="w-3.5 h-3.5" />
        </div>
        <span className="text-xs font-semibold tracking-tight">Void Vault</span>
        <PanelLeftOpen className="w-3.5 h-3.5 text-[#ff5600] ml-0.5" />
      </button>
    );
  }

  return (
    <SidebarBody className="justify-between">
      <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        {/* Header Brand */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#d3cec6]/60 mb-3.5 min-h-[44px]">
          <div className="flex items-center gap-2.5 min-w-0">
            <div 
              onClick={() => {
                if (isPinned) {
                  setIsPinned(false);
                  setOpen(false);
                } else {
                  setIsPinned(true);
                  setOpen(true);
                }
              }}
              title={isPinned ? "Click to switch to hover rail mode" : "Click to pin open"}
              className="bg-[#111111] p-2 rounded-lg text-white cursor-pointer hover:bg-neutral-800 transition-colors shadow-xs flex-shrink-0 flex items-center justify-center w-8 h-8"
            >
              <Lock className="w-4 h-4 text-[#f5f1ec]" />
            </div>

            <motion.div 
              animate={{
                opacity: open ? 1 : 0,
                width: open ? "auto" : 0,
              }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col whitespace-nowrap overflow-hidden"
            >
              <div className="flex items-center gap-1.5">
                <span className="text-[#111111] font-semibold text-sm tracking-tight">Void Vault</span>
                <span className="text-[9px] bg-amber-100 text-amber-900 font-bold px-1.5 py-0.5 rounded tracking-wide">PS-26149</span>
              </div>
              <span className="text-[10px] text-[#7b7b78] leading-tight">Digital Forensics Suite</span>
            </motion.div>
          </div>

          <motion.div
            animate={{
              opacity: open ? 1 : 0,
              width: open ? "auto" : 0,
            }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-1 whitespace-nowrap overflow-hidden flex-shrink-0"
          >
            <button
              onClick={() => {
                const nextPinned = !isPinned;
                setIsPinned(nextPinned);
                if (!nextPinned) setOpen(false);
              }}
              title={isPinned ? "Unpin (Auto-expand on hover)" : "Pin Open"}
              className={`p-1.5 rounded-md transition-colors ${
                isPinned 
                  ? 'text-[#111111] bg-black/5 hover:bg-black/10' 
                  : 'text-[#7b7b78] hover:text-[#111111] hover:bg-black/5'
              }`}
            >
              {isPinned ? <Pin className="w-3.5 h-3.5" /> : <PinOff className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => setIsHidden(true)}
              title="Hide Sidebar completely"
              className="p-1.5 rounded-md text-[#7b7b78] hover:text-[#ff5600] hover:bg-black/5 transition-colors"
            >
              <EyeOff className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        </div>

        {/* Toggle button when collapsed to rail */}
        {!open && (
          <div className="flex flex-col items-center mb-3">
            <button
              onClick={() => {
                setIsPinned(true);
                setOpen(true);
              }}
              title="Pin Void Vault Sidebar Open"
              className="p-1.5 rounded-md text-[#7b7b78] hover:text-[#111111] hover:bg-black/5 transition-colors"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Core Modules Section */}
        <div className="space-y-4">
          <div>
            <motion.div
              animate={{
                opacity: open ? 1 : 0,
                height: open ? "auto" : 0,
                marginBottom: open ? 6 : 0,
              }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="px-2 text-[10px] font-semibold text-[#7b7b78] uppercase tracking-wider overflow-hidden whitespace-nowrap"
            >
              Core Modules
            </motion.div>
            <div className="space-y-0.5">
              {mainModules.map((item) => (
                <SidebarLink
                  key={item.href}
                  link={item}
                  badge={item.badge}
                />
              ))}
            </div>
          </div>

          {/* Forensic & Compliance Section */}
          <div>
            <motion.div
              animate={{
                opacity: open ? 1 : 0,
                height: open ? "auto" : 0,
                marginBottom: open ? 6 : 0,
              }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="px-2 text-[10px] font-semibold text-[#7b7b78] uppercase tracking-wider overflow-hidden whitespace-nowrap"
            >
              Forensic & Verification
            </motion.div>
            <div className="space-y-0.5">
              {forensicTools.map((item) => (
                <SidebarLink
                  key={item.href}
                  link={item}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Badges */}
      <div className="pt-3 border-t border-[#d3cec6]/60 overflow-hidden">
        <div className="relative min-h-[36px] flex items-center">
          <motion.div
            animate={{
              opacity: open ? 1 : 0,
              width: open ? "100%" : 0,
            }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col gap-1 text-[10px] text-[#626260] whitespace-nowrap overflow-hidden"
          >
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span className="truncate">NIST SP 800-88 Compliant</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span className="truncate">IEEE 2883-2022 Certified</span>
            </div>
            <div className="flex items-center justify-between text-[#7b7b78] pt-1 border-t border-[#d3cec6]/40 mt-1 font-mono text-[9px]">
              <span>CFTT-DR</span>
              <span>v1.2.0 • Void Vault</span>
            </div>
          </motion.div>

          <motion.div
            animate={{
              opacity: open ? 0 : 1,
              scale: open ? 0.6 : 1,
            }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className={`w-full flex justify-center py-1 absolute inset-0 pointer-events-none ${open ? 'hidden' : 'flex'}`}
            title="NIST SP 800-88 & IEEE 2883 Verified • Void Vault"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
          </motion.div>
        </div>
      </div>
    </SidebarBody>
  );
}

export default function Sidebar() {
  return (
    <AceternitySidebar>
      <SidebarInner />
    </AceternitySidebar>
  );
}
