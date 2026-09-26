import { 
  Usb, Cpu, Zap, Search, HardDrive, ShieldCheck, 
  ArrowRight, Shield, Key, FileX2, Eraser, FileText, CheckCircle2, Award
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchStatus } from '../api';
import { useDevices } from '../context/DeviceContext';

function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default function Dashboard() {
  const { devices, loading, refreshDevices } = useDevices();

  // Collect all partitions / volumes across all devices
  const allVolumes = devices.flatMap(d => 
    (d.partitions || []).flatMap(p => 
      (p.volumes || []).map(v => ({
        ...v,
        diskModel: d.model,
        diskId: d.device_id,
        isBoot: v.drive_letter?.toUpperCase() === 'C:' || p.is_boot
      }))
    )
  );
  const targetVolumes = allVolumes.filter(v => !v.isBoot);
  const systemVolumes = allVolumes.filter(v => v.isBoot);
  const targetDisks = devices.filter(d => !d.is_boot_disk && d.safety_status !== 'Protected');
  const activeTargets = targetDisks.length > 0 ? targetDisks : targetVolumes;
  const systemDrives = devices.filter(d => d.is_boot_disk || d.safety_status === 'Protected');

  return (
    <div className="h-full max-w-6xl mx-auto w-full flex flex-col justify-between pb-6">
      <div>
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase px-2 py-0.5 rounded bg-neutral-900 text-white tracking-wider">
                Void Vault
              </span>
              <span className="text-xs text-[#7b7b78]">•</span>
              <span className="text-xs text-neutral-600 font-medium">NTRO PS-26149</span>
              <span className="text-xs text-[#7b7b78]">•</span>
              <span className="text-xs text-emerald-700 font-medium">Dual-Engine Forensic Workstation</span>
            </div>
            <h1 className="text-2xl font-medium tracking-tight text-[#111111]">
              Void Vault — Secure Data Erasure & Advanced File Recovery
            </h1>
            <p className="text-sm text-[#626260]">
              Certified Digital Forensics Suite: NIST SP 800-88 Rev. 1 • IEEE 2883-2022 • CFTT-DR Validated
            </p>
          </div>
          <button 
            onClick={refreshDevices}
            className="bg-[#ffffff] text-[#111111] border border-[#d3cec6] rounded-lg px-4 py-2 text-xs font-medium hover:bg-[#f5f1ec] transition-colors flex items-center gap-2 shadow-sm"
          >
            <Search className="w-3.5 h-3.5" />
            {loading ? 'Scanning...' : 'Rescan Hardware'}
          </button>
        </div>

        {/* Live System Status Cards */}
        <div className="grid grid-cols-3 gap-5 mb-8">
          <div className="glass-panel glass-card-interactive rounded-xl p-5 shadow-xs">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs text-[#7b7b78] uppercase font-medium tracking-wider">Detected Hardware</span>
              <HardDrive className="w-4 h-4 text-[#111111]" />
            </div>
            <div className="text-3xl font-medium text-[#111111]">{devices.length}</div>
            <p className="text-xs text-[#626260] mt-1 font-mono">
              {devices.map(d => d.device_type).join(', ') || 'Probing bus...'}
            </p>
          </div>

          <div className="glass-panel glass-card-interactive rounded-xl p-5 shadow-xs">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs text-[#7b7b78] uppercase font-medium tracking-wider">System Protection</span>
              <Shield className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-3xl font-medium text-[#111111]">{systemDrives.length}</div>
            <p className="text-xs text-amber-700 mt-1">
              Active OS NVMe drives protected against accidental wipe
            </p>
          </div>

          <div className="glass-panel glass-card-interactive rounded-xl p-5 shadow-xs">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs text-[#7b7b78] uppercase font-medium tracking-wider">Active Target Media</span>
              <Key className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-3xl font-medium text-emerald-700">{activeTargets.length}</div>
            <p className="text-xs text-[#626260] mt-1">
              {activeTargets.length > 0 
                ? `${targetVolumes.map(v => v.drive_letter).join(', ') || activeTargets[0].model || 'Target'} available for forensic ops` 
                : 'Insert target media to begin'}
            </p>
          </div>
        </div>

        {/* Connected Media Banner */}
        {activeTargets.length > 0 && (
          <div className="glass-panel border border-[#111111]/30 rounded-xl p-5 mb-8 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-black/5 p-3 rounded-lg backdrop-blur-xs">
                  <Usb className="w-7 h-7 text-[#111111]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-medium text-[#111111]">
                      {targetVolumes.length > 0 
                        ? `Volumes: ${targetVolumes.map(v => `${v.drive_letter} ${v.label ? `(${v.label})` : ''}`).join(', ')}`
                        : (activeTargets[0].model || 'Target Media')}
                    </h3>
                    <span className="text-[10px] bg-emerald-100/80 text-emerald-800 px-2 py-0.5 rounded font-semibold uppercase border border-emerald-200">READY</span>
                  </div>
                  <p className="text-xs text-[#7b7b78] font-mono mt-0.5">
                    {targetVolumes.length > 0
                      ? `${targetVolumes.length} target partition(s) ready • File shredder, free space wipe & deep carving active`
                      : `${activeTargets[0].device_id} • ${formatBytes(activeTargets[0].capacity)} • ${activeTargets[0].device_type}`}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Link 
                  to="/erasure"
                  className="bg-[#ff5600] text-white rounded-lg px-4 py-2 text-xs font-medium hover:opacity-90 flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                >
                  <Eraser className="w-3.5 h-3.5" /> Drive Wipe
                </Link>
                <Link 
                  to="/shredder"
                  className="bg-[#111111] text-white rounded-lg px-4 py-2 text-xs font-medium hover:opacity-90 flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                >
                  <FileX2 className="w-3.5 h-3.5" /> File Shredder
                </Link>
                <Link 
                  to="/recovery"
                  className="bg-[#111111] text-white rounded-lg px-4 py-2 text-xs font-medium hover:opacity-90 flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                >
                  <Search className="w-3.5 h-3.5" /> Carve Files
                </Link>
              </div>
            </div>
          </div>
        )}


        {/* 3 Core NTRO Modules Presentation */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-[#7b7b78] uppercase tracking-wider mb-4">
            Void Vault • Integrated Forensic Architecture
          </h2>
          
          <div className="grid grid-cols-3 gap-5">
            {/* Module 1 Card */}
            <div className="glass-panel glass-card-interactive rounded-xl p-5 flex flex-col justify-between hover:border-[#ff5600] transition-all">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-orange-100 text-orange-900 font-mono">
                    MODULE 1
                  </span>
                  <Eraser className="w-5 h-5 text-[#ff5600]" />
                </div>
                <h3 className="text-base font-medium text-[#111111] mb-1">Secure Drive Sanitization</h3>
                <p className="text-xs text-[#626260] leading-relaxed mb-4">
                  Full drive erasure for HDD, SSD, NVMe, and USB media per NIST SP 800-88 Rev. 1 & IEEE 2883-2022. Hardware NVMe Sanitize, ATA Secure Erase, and multi-pass overwrite engines.
                </p>
                <ul className="text-[11px] space-y-1 text-[#7b7b78] mb-4 font-mono">
                  <li>• NIST Clear / Purge & DoD 7-Pass</li>
                  <li>• Double-Buffered Pipeline I/O</li>
                  <li>• Post-Erasure Auto Volume Formatter</li>
                </ul>
              </div>
              <Link
                to="/erasure"
                className="w-full py-2 px-3 bg-[#f5f1ec] text-[#111111] hover:bg-[#111111] hover:text-white rounded-lg text-xs font-medium transition-all flex items-center justify-between"
              >
                <span>Launch Drive Sanitization</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Module 2 Card */}
            <div className="glass-panel glass-card-interactive rounded-xl p-5 flex flex-col justify-between hover:border-amber-600 transition-all">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-mono">
                    MODULE 2
                  </span>
                  <FileX2 className="w-5 h-5 text-amber-600" />
                </div>
                <h3 className="text-base font-medium text-[#111111] mb-1">Selective File Shredder</h3>
                <p className="text-xs text-[#626260] leading-relaxed mb-4">
                  Targeted destruction of confidential files without wiping the entire drive. Overwrites physical clusters, wipes cluster slack space, destroys NTFS Alternate Data Streams, and obfuscates MFT entries.
                </p>
                <ul className="text-[11px] space-y-1 text-[#7b7b78] mb-4 font-mono">
                  <li>• Cluster Slack Zeroing (EOF boundary)</li>
                  <li>• SDelete 5-Pass MFT Obfuscation</li>
                  <li>• Signed JSON Forensic Audit Reports</li>
                </ul>
              </div>
              <Link
                to="/shredder"
                className="w-full py-2 px-3 bg-[#f5f1ec] text-[#111111] hover:bg-[#111111] hover:text-white rounded-lg text-xs font-medium transition-all flex items-center justify-between"
              >
                <span>Launch File Shredder</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Module 3 Card */}
            <div className="glass-panel glass-card-interactive rounded-xl p-5 flex flex-col justify-between hover:border-blue-600 transition-all">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900 font-mono">
                    MODULE 3
                  </span>
                  <Search className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-base font-medium text-[#111111] mb-1">Advanced File Recovery</h3>
                <p className="text-xs text-[#626260] leading-relaxed mb-4">
                  Deep raw sector carving for deleted digital evidence. Features 97% Byte Frequency Distribution (BFD) classification, non-contiguous bifragment reassembly, and structural format validation.
                </p>
                <ul className="text-[11px] space-y-1 text-[#7b7b78] mb-4 font-mono">
                  <li>• BFD Neural Entropy Classifier</li>
                  <li>• Gap-Carving Bifragment Engine</li>
                  <li>• JPEG/PNG/PDF/ZIP Structural Check</li>
                </ul>
              </div>
              <Link
                to="/recovery"
                className="w-full py-2 px-3 bg-[#f5f1ec] text-[#111111] hover:bg-[#111111] hover:text-white rounded-lg text-xs font-medium transition-all flex items-center justify-between"
              >
                <span>Launch File Recovery</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Engine Capability Badges */}
      <div className="grid grid-cols-4 gap-4 mt-2">
        <div className="glass-panel glass-card-interactive rounded-xl p-4 flex items-center gap-3">
          <Zap className="w-5 h-5 text-[#626260]" />
          <div>
            <p className="text-xs font-medium text-[#111111]">Pipeline I/O</p>
            <p className="text-xs text-[#7b7b78]">Double-Buffered Zero Copy</p>
          </div>
        </div>
        <div className="glass-panel glass-card-interactive rounded-xl p-4 flex items-center gap-3">
          <Cpu className="w-5 h-5 text-[#626260]" />
          <div>
            <p className="text-xs font-medium text-[#111111]">BFD Classifier</p>
            <p className="text-xs text-[#7b7b78]">97% Statistical Accuracy</p>
          </div>
        </div>
        <div className="glass-panel glass-card-interactive rounded-xl p-4 flex items-center gap-3">
          <Award className="w-5 h-5 text-emerald-600" />
          <div>
            <p className="text-xs font-medium text-[#111111]">NIST CFTT Suite</p>
            <p className="text-xs text-[#7b7b78]">100% Zero-Write Source</p>
          </div>
        </div>
        <div className="glass-panel glass-card-interactive rounded-xl p-4 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-[#626260]" />
          <div>
            <p className="text-xs font-medium text-[#111111]">SSD Overwrite Guard</p>
            <p className="text-xs text-[#7b7b78]">FAST 2011 Active</p>
          </div>
        </div>
      </div>
    </div>
  );
}
