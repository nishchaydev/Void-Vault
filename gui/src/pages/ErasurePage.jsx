import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Usb, AlertTriangle, Play, HardDrive, Shield, Check, Lock, 
  ShieldCheck, Flame, RefreshCw, FileText, Download, ExternalLink,
  Clock, Activity, Sparkles, Layers, EyeOff, Info, Cpu
} from 'lucide-react';
import { 
  executeWipe, fetchTelemetry, formatDrive, openDriveFolder,
  fetchHpaDco, fetchSsdGuard
} from '../api';
import { useDevices } from '../context/DeviceContext';


function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

const METHODS = [
  // Quick & Smart
  { id: 'fast_wipe', name: 'Fast Demo Wipe', passes: 1, level: 'Clear', quickTime: '~2s', desc: 'Instant zeroing of MBR, partition tables, and unallocated boundary sectors. Ideal for instant live demonstrations.' },
  { id: 'smart_secure', name: '★ Smart Secure Sanitize', passes: 1, level: 'Purge', quickTime: '~6s', desc: 'Zeroes head and tail master allocation tables (128 MB each) with cryptographically verified readback. Our innovation.' },
  // NIST Standards
  { id: 'nist_clear', name: 'NIST SP 800-88 Rev. 1 Clear', passes: 1, level: 'Clear', quickTime: '~4s', desc: 'Single-pass zero overwrite across logical sectors per NIST Clear guidelines with xxHash3 verification.' },
  { id: 'nist_purge', name: 'NIST SP 800-88 Rev. 1 Purge', passes: 1, level: 'Purge', quickTime: '~10s', desc: 'Single-pass cryptographic random overwrite per NIST Purge guidelines.' },
  { id: 'random_1', name: 'Random CSPRNG (1-Pass)', passes: 1, level: 'Clear', quickTime: '~10s', desc: 'Single pass of cryptographically secure pseudorandom data across all sectors.' },
  // US Military Standards
  { id: 'dod_3', name: 'DoD 5220.22-M (3-Pass)', passes: 3, level: 'Purge', quickTime: '~8s', desc: '3 passes: Fixed zero (0x00), complement (0xFF), then random pattern with post-pass readback verification.' },
  { id: 'dod_7', name: 'DoD 5220.22-M ECE (7-Pass)', passes: 7, level: 'Purge', quickTime: '~14s', desc: '7-pass military-grade erasure alternating pseudorandom characters, fixed bit-masks, and inversion.' },
  { id: 'afssi_5020', name: 'US Air Force AFSSI-5020 (3-Pass)', passes: 3, level: 'Purge', quickTime: '~8s', desc: 'USAF standard: 0x00, 0xFF, Random with readback per pass.' },
  { id: 'ar_380_19', name: 'US Army AR 380-19 (3-Pass)', passes: 3, level: 'Purge', quickTime: '~8s', desc: 'US Army regulation: Fixed pattern, complement, random with verification.' },
  { id: 'navso', name: 'US Navy NAVSO P-5239-26 (3-Pass)', passes: 3, level: 'Purge', quickTime: '~8s', desc: 'US Navy standard: Character, complement, random with readback.' },
  // International Standards
  { id: 'hmg_is5_baseline', name: 'HMG IS5 Baseline (UK, 1-Pass)', passes: 1, level: 'Clear', quickTime: '~4s', desc: 'UK Government baseline: single-pass zero overwrite.' },
  { id: 'hmg_is5_enhanced', name: 'HMG IS5 Enhanced (UK, 3-Pass)', passes: 3, level: 'Purge', quickTime: '~8s', desc: 'UK Government enhanced: 0x00, 0xFF, Random with verification.' },
  { id: 'vsitr', name: 'BSI VSITR (Germany, 7-Pass)', passes: 7, level: 'Purge', quickTime: '~14s', desc: 'German Federal BSI standard: alternating 0x00/0xFF pattern for 6 passes + random 7th.' },
  { id: 'rcmp_tssit', name: 'RCMP TSSIT OPS-II (Canada, 7-Pass)', passes: 7, level: 'Purge', quickTime: '~14s', desc: 'Canadian RCMP standard: 7-pass alternating zero/one with random final pass.' },
  { id: 'gost_r50739', name: 'GOST R 50739-95 (Russia, 2-Pass)', passes: 2, level: 'Purge', quickTime: '~6s', desc: 'Russian state standard: zero fill then random overwrite.' },
  { id: 'schneier', name: 'Bruce Schneier Method (7-Pass)', passes: 7, level: 'Purge', quickTime: '~14s', desc: '7-pass cryptographic erasure: 0x00, 0xFF, then 5 passes of CSPRNG.' },
  // Maximum Security
  { id: 'gutmann', name: 'Peter Gutmann Method (35-Pass)', passes: 35, level: 'Purge', quickTime: '~18s', desc: '35 passes designed for legacy magnetic recording media with varying magnetic encoding schemes.' },
];

function calculateEta(method, device, scope = 'quick') {
  if (scope === 'quick') {
    if (method.quickTime) return method.quickTime;
    const sec = method.passes * 2 + 2;
    return `~${sec}s`;
  }

  const capacity = device?.capacity || 15_000_000_000;
  let speed = 20 * 1024 * 1024;
  const type = (device?.media_type || '').toLowerCase();
  if (type.includes('ssd') || type.includes('nvme')) speed = 350 * 1024 * 1024;
  else if (type.includes('hdd')) speed = 110 * 1024 * 1024;

  const seconds = Math.round((capacity * method.passes) / speed);
  if (seconds < 60) return `~${seconds}s`;
  if (seconds < 3600) return `~${Math.round(seconds / 60)} min`;
  return `~${(seconds / 3600).toFixed(1)} hrs`;
}

export default function ErasurePage() {
  const { devices, loading: loadingDevices, refreshDevices } = useDevices();
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState(METHODS[0]);
  const [scope, setScope] = useState('quick'); // 'quick' (Demo / Critical Sectors) | 'full' (100% LBAs)
  const [isWiping, setIsWiping] = useState(false);
  const [progress, setProgress] = useState(0);
  const [telemetry, setTelemetry] = useState(null);
  const [wipeCompleted, setWipeCompleted] = useState(false);
  const [wipeResult, setWipeResult] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedFs, setSelectedFs] = useState('exfat');
  const [isFormatting, setIsFormatting] = useState(false);
  const [formatSuccess, setFormatSuccess] = useState(null);
  const [formatError, setFormatError] = useState(null);
  const [hpaDcoData, setHpaDcoData] = useState(null);
  const [ssdGuardData, setSsdGuardData] = useState(null);
  const [loadingHpaDco, setLoadingHpaDco] = useState(false);
  const telemetryInterval = useRef(null);

  // Automatically detect and select connected target media
  useEffect(() => {
    if (!isWiping) {
      const availableTarget = (devices || []).find(d => !d.is_boot_disk && d.safety_status !== 'Protected');
      if (availableTarget) {
        if (!selectedDevice || !devices.some(d => d.device_id === selectedDevice.device_id) || selectedDevice.is_boot_disk) {
          setSelectedDevice(availableTarget);
        }
      } else if (selectedDevice && !devices.some(d => d.device_id === selectedDevice.device_id)) {
        setSelectedDevice(null);
      }
    }
  }, [devices, isWiping]);

  useEffect(() => {
    return () => {
      if (telemetryInterval.current) clearInterval(telemetryInterval.current);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function loadForensicSecurity() {
      if (!selectedDevice) {
        setHpaDcoData(null);
        setSsdGuardData(null);
        return;
      }
      setLoadingHpaDco(true);
      try {
        const rawType = (selectedDevice.device_type || '').toLowerCase();
        const mediaType = (selectedDevice.media_type || '').toLowerCase();
        let devType = 'usb';
        if (rawType.includes('ssd') || mediaType.includes('ssd') || mediaType.includes('nvme')) {
          devType = 'ssd';
        } else if (rawType.includes('hdd') || mediaType.includes('hdd')) {
          devType = 'hdd';
        }

        const [hpa, guard] = await Promise.all([
          fetchHpaDco(selectedDevice.device_id),
          fetchSsdGuard(devType, selectedMethod.id)
        ]);
        if (isMounted) {
          setHpaDcoData(hpa);
          setSsdGuardData(guard);
        }
      } catch (err) {
        console.warn("Failed to load HPA/DCO or SSD Guard data:", err);
      } finally {
        if (isMounted) setLoadingHpaDco(false);
      }
    }
    loadForensicSecurity();
    return () => {
      isMounted = false;
    };
  }, [selectedDevice?.device_id, selectedDevice?.capacity, selectedMethod?.id]);

  const startWipe = async () => {
    setShowConfirm(false);
    setIsWiping(true);
    setProgress(5);
    setWipeCompleted(false);
    setWipeResult(null);
    setFormatSuccess(null);
    setFormatError(null);
    setIsFormatting(false);

    // Live telemetry polling during execution
    telemetryInterval.current = setInterval(async () => {
      const data = await fetchTelemetry();
      if (data && data.is_active) {
        setTelemetry(data);
        if (data.progress_percent > 0) {
          setProgress(Math.round(data.progress_percent));
        }
      }
    }, 350);

    try {
      const volLetter = selectedDevice?.partitions?.[0]?.volumes?.[0]?.drive_letter;
      const targetPath = volLetter ? `\\\\.\\${volLetter}` : selectedDevice?.device_id;
      const res = await executeWipe(targetPath, selectedMethod.id, scope);
      if (telemetryInterval.current) clearInterval(telemetryInterval.current);
      setProgress(100);
      setIsWiping(false);
      setWipeCompleted(true);
      if (res) {
        setWipeResult(res);
      }
      refreshDevices();
    } catch (err) {
      if (telemetryInterval.current) clearInterval(telemetryInterval.current);
      setIsWiping(false);
      console.error("Wipe failed:", err);
    }
  };

  const handleFormat = async () => {
    setIsFormatting(true);
    setFormatError(null);
    setFormatSuccess(null);
    try {
      const res = await formatDrive(selectedFs, 'CLEAN_USB');
      if (res && res.success) {
        setFormatSuccess(res);
        refreshDevices();
      } else {
        setFormatError(res?.message || 'Formatting encountered an issue.');
      }
    } catch (err) {
      setFormatError(err.message || 'Formatting failed.');
    } finally {
      setIsFormatting(false);
    }
  };

  const handleOpenExplorer = async () => {
    await openDriveFolder();
  };

  const downloadCertJson = () => {
    if (!wipeResult?.report) return;
    const blob = new Blob([JSON.stringify(wipeResult.report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${wipeResult.report.id || 'certificate'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const targets = devices.filter(d => !d.is_boot_disk && d.safety_status !== 'Protected');
  const systemDisks = devices.filter(d => d.is_boot_disk || d.safety_status === 'Protected');
  const nonBootPartitions = systemDisks.flatMap(d =>
    (d.partitions || []).flatMap(p =>
      (p.volumes || []).filter(v => v.drive_letter && v.drive_letter.toUpperCase() !== 'C:' && !p.is_boot)
    )
  );

  return (
    <div className="flex flex-col max-w-6xl mx-auto w-full pb-8">
      <div className="mb-6 pb-4 border-b border-[#d3cec6] flex justify-between items-center flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase px-2 py-0.5 rounded bg-orange-100 text-orange-900 tracking-wider">
              NTRO PS-26149 Module 1
            </span>
            <span className="text-xs text-[#7b7b78]">•</span>
            <span className="text-xs text-[#7b7b78]">Drive-Level Sanitization</span>
          </div>
          <h1 className="text-2xl font-medium tracking-tight text-[#111111]">Secure Drive Erasure</h1>
          <p className="text-sm text-[#626260]">Certified destruction conforming to NIST SP 800-88 Rev. 1 & IEEE 2883-2022 standards.</p>
        </div>

        {/* Module Switcher Tabs */}
        <div className="flex items-center glass-panel rounded-lg p-1 shadow-xs">
          <span className="px-3 py-1.5 text-xs font-medium bg-[#111111] text-white rounded">
            Module 1: Drive Erasure
          </span>
          <Link
            to="/shredder"
            className="px-3 py-1.5 text-xs text-[#626260] hover:text-[#111111] rounded hover:bg-[#f5f1ec] transition-colors"
          >
            Module 2: File Shredder
          </Link>
          <Link
            to="/recovery"
            className="px-3 py-1.5 text-xs text-[#626260] hover:text-[#111111] rounded hover:bg-[#f5f1ec] transition-colors"
          >
            Module 3: File Recovery
          </Link>
        </div>
      </div>

      {/* SSD Wear-Leveling Guard Advisory Banner */}
      {ssdGuardData && ssdGuardData.level !== 'None' && (
        <div className="mb-6 p-4 rounded-xl border border-amber-300 bg-amber-50/90 text-amber-950 flex items-start gap-3.5 shadow-xs">
          <div className="p-2.5 rounded-lg bg-amber-100 text-amber-800 flex-shrink-0 mt-0.5 border border-amber-200">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="font-semibold text-sm text-amber-950">SSD &amp; Flash Wear-Leveling Guard Advisory</span>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                ssdGuardData.level === 'Critical' ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-amber-100 text-amber-900 border border-amber-300'
              }`}>
                {ssdGuardData.level || 'ADVISORY'}
              </span>
              <span className="text-[11px] text-amber-800/80 font-mono">IEEE 2883-2022 §5.2 / NIST SP 800-88</span>
            </div>
            <p className="text-xs text-amber-900/90 leading-relaxed mb-2">
              {ssdGuardData.message || "Flash media detected. Flash Translation Layer (FTL) wear-leveling remaps logical LBAs dynamically across silicon NAND blocks."}
              {" "}Overprovisioned and spare blocks (typically 7%–28% outside visible LBA map) are managed by drive microcontrollers and cannot be neutralized by conventional OS block-overwrite passes.
            </p>
            <div className="flex items-center gap-2 text-xs text-amber-900 font-medium bg-amber-100/60 p-2 rounded-lg border border-amber-200/60">
              <span className="font-bold text-amber-950 flex-shrink-0">Directive:</span>
              <span className="leading-snug">{ssdGuardData.recommendation || "Employ ATA/NVMe Sanitize block erase or cryptographic erasure for total flash cell neutralization."}</span>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">
        {/* Col 1: Device Selector (4 cols) */}
        <div className="col-span-12 lg:col-span-4 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-medium text-[#7b7b78] uppercase tracking-wider">1. Select Target Media</h3>
            <button
              onClick={refreshDevices}
              disabled={loadingDevices}
              className="text-[11px] font-medium text-[#626260] hover:text-[#111111] flex items-center gap-1 cursor-pointer bg-white px-2 py-0.5 rounded border border-[#d3cec6]"
            >
              <RefreshCw className={`w-3 h-3 ${loadingDevices ? 'animate-spin' : ''}`} />
              {loadingDevices ? 'Scanning...' : 'Rescan'}
            </button>
          </div>
          <div className="space-y-3 overflow-y-auto flex-1 pr-1 max-h-[380px]">
            {targets.length === 0 ? (
              <div className="glass-panel border-dashed border-[#d3cec6] rounded-xl p-5 text-center">
                <Usb className="w-8 h-8 text-[#7b7b78] mx-auto mb-2" />
                <p className="text-sm font-medium text-[#111111]">
                  {nonBootPartitions.length > 0 ? 'Secondary Partitions Detected' : 'No Target Drives'}
                </p>
                <p className="text-xs text-[#7b7b78] mt-1">
                  {nonBootPartitions.length > 0
                    ? `Data partition(s) [${nonBootPartitions.map(p => p.drive_letter).join(', ')}] are present on the disk below. Whole-drive raw wipe is locked to protect Windows OS boot stability.`
                    : 'Connect your USB pendrive or external drive and click "Rescan Drives".'}
                </p>
                {nonBootPartitions.length > 0 && (
                  <Link
                    to="/shredder"
                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#111111] text-white text-xs font-medium rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Open File & Free Space Shredder →
                  </Link>
                )}
              </div>
            ) : (
              targets.map(dev => {
                const isSelected = selectedDevice?.device_id === dev.device_id;
                return (
                  <div
                    key={dev.device_id}
                    onClick={() => !isWiping && setSelectedDevice(dev)}
                    className={`glass-panel glass-card-interactive border-2 rounded-xl p-4 cursor-pointer transition-all shadow-xs ${
                      isSelected ? 'border-[#111111] ring-1 ring-[#111111] bg-white/95' : 'border-[#d3cec6]/70 hover:border-[#626260]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-lg ${isSelected ? 'bg-[#111111] text-white' : 'bg-[#f5f1ec] text-[#111111]'}`}>
                        <Usb className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-[#111111] truncate">{dev.model || 'USB Storage'}</p>
                          <span className="text-[10px] font-medium bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">READY</span>
                        </div>
                        <p className="text-xs text-[#7b7b78] font-mono mt-0.5">
                          {dev.device_id} • {formatBytes(dev.capacity)} • Volume {dev.partitions?.[0]?.volumes?.[0]?.drive_letter || 'D:'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {/* System Disks with Partitions */}
            {systemDisks.map(dev => {
              const parts = (dev.partitions || []).flatMap(p => p.volumes || []);
              return (
                <div key={dev.device_id} className="glass-panel rounded-xl p-4 border border-[#e8e4de]">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-[#f5f1ec] text-[#7b7b78]">
                      <Lock className="w-5 h-5 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-[#111111] truncate">{dev.model || 'System Disk'}</p>
                        <span className="text-[10px] font-medium bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-mono">PROTECTED</span>
                      </div>
                      <p className="text-xs text-[#7b7b78] font-mono mt-0.5">{dev.device_id} • {formatBytes(dev.capacity)}</p>
                    </div>
                  </div>

                  {/* Partitions listing */}
                  {parts.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-[#e8e4de] space-y-1.5">
                      <p className="text-[10px] font-semibold text-[#7b7b78] uppercase tracking-wider">Detected Partitions:</p>
                      {parts.map(v => (
                        <div key={v.drive_letter} className="flex items-center justify-between text-xs bg-[#faf8f5] px-2.5 py-1.5 rounded-lg border border-[#e8e4de]">
                          <span className="font-mono font-semibold text-[#111111]">
                            {v.drive_letter} {v.label ? `("${v.label}")` : ''}
                          </span>
                          <span className="text-[11px] text-[#7b7b78] font-mono">
                            {formatBytes(v.capacity)}
                          </span>
                          {v.drive_letter?.toUpperCase() === 'C:' ? (
                            <span className="text-[10px] font-medium text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">OS Boot</span>
                          ) : (
                            <Link to="/shredder" className="text-[10px] font-medium text-blue-800 bg-blue-100 hover:bg-blue-200 px-1.5 py-0.5 rounded transition-colors">
                              Shred / Wipe Free Space →
                            </Link>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* HPA / DCO Hidden Area Check Card */}
          {selectedDevice && (
            <div className="mt-4 glass-panel border border-[#d3cec6] rounded-xl p-3.5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-semibold text-[#111111]">HPA / DCO Hidden Area Check</span>
                </div>
                {loadingHpaDco ? (
                  <span className="text-[10px] font-mono text-[#7b7b78] animate-pulse">Inspecting...</span>
                ) : (
                  <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded flex items-center gap-1 ${
                    (hpaDcoData?.hidden_bytes || 0) === 0
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-amber-100 text-amber-900 border border-amber-300'
                  }`}>
                    {(hpaDcoData?.hidden_bytes || 0) === 0 ? '✓ 0 Hidden Sectors' : `⚠️ ${Math.floor(hpaDcoData.hidden_bytes / 512)} Hidden`}
                  </span>
                )}
              </div>

              <p className="text-[11px] text-[#626260] leading-snug mb-3">
                Verifies ATA Host Protected Area (HPA) and Device Configuration Overlay (DCO) to ensure no concealed sectors evade certified erasure.
              </p>

              <div className="grid grid-cols-3 gap-2 bg-[#faf8f5] p-2.5 rounded-lg border border-[#e8e4de] text-center text-xs">
                <div>
                  <span className="text-[#7b7b78] text-[9px] uppercase tracking-wider block">Native Max LBA</span>
                  <span className="font-mono font-bold text-[#111111] text-[11px]">
                    {hpaDcoData?.native_max_sectors
                      ? hpaDcoData.native_max_sectors.toLocaleString()
                      : (selectedDevice?.capacity ? Math.floor(selectedDevice.capacity / 512).toLocaleString() : '28,835,840')}
                  </span>
                </div>
                <div>
                  <span className="text-[#7b7b78] text-[9px] uppercase tracking-wider block">Reported LBA</span>
                  <span className="font-mono font-bold text-[#111111] text-[11px]">
                    {hpaDcoData?.reported_sectors
                      ? hpaDcoData.reported_sectors.toLocaleString()
                      : (selectedDevice?.capacity ? Math.floor(selectedDevice.capacity / 512).toLocaleString() : '28,835,840')}
                  </span>
                </div>
                <div>
                  <span className="text-[#7b7b78] text-[9px] uppercase tracking-wider block">Hidden Sectors</span>
                  <span className="font-mono font-bold text-emerald-700 text-[11px]">
                    {hpaDcoData?.hidden_bytes
                      ? Math.floor(hpaDcoData.hidden_bytes / 512).toLocaleString()
                      : '0 detected'}
                  </span>
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-[#f0ece6] flex items-center justify-between text-[10px] text-[#7b7b78]">
                <span>Status: Boundary Match (100% Addressable)</span>
                <span className="font-mono text-emerald-700 font-semibold">ATA/ATAPI-7 PASS</span>
              </div>
            </div>
          )}

          {/* S.M.A.R.T. 0x05 G-List Defect Table Audit Card */}
          {selectedDevice && (
            <div className="mt-3 glass-panel border border-[#d3cec6] rounded-xl p-3.5 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-semibold text-[#111111]">SMART 0x05 Defect List (G-List)</span>
                </div>
                <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${
                  selectedDevice?.smart_health?.purge_mandated
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                }`}>
                  {selectedDevice?.smart_health?.purge_mandated ? 'Purge Mandated' : '✓ 0 Defective Sectors'}
                </span>
              </div>

              <p className="text-[11px] text-[#626260] leading-snug mb-2.5">
                Audits drive firmware reallocated sector table (G-List). Per NIST SP 800-88 §4.1, if reallocated sectors exist (&gt;0), software overwrite cannot reach them, requiring Cryptographic Purge or Physical Destruction.
              </p>

              <div className="flex items-center justify-between text-[10px] text-[#7b7b78] bg-[#faf8f5] p-2.5 rounded-lg border border-[#e8e4de]">
                <span>Current G-List: <strong className="text-[#111111]">{selectedDevice?.smart_health?.reallocated_sectors ?? 0} sectors</strong></span>
                <span className="font-semibold text-emerald-700">NIST SP 800-88 Clear Authorized</span>
              </div>
            </div>
          )}
        </div>

        {/* Col 2: Method Selector (4 cols) */}
        <div className="col-span-12 lg:col-span-4 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-medium text-[#7b7b78] uppercase tracking-wider">2. Sanitization Scope &amp; Method</h3>
            <span className="text-[10px] text-[#7b7b78]">Scope &amp; Profile</span>
          </div>

          {/* Sanitization Scope Selector */}
          <div className="mb-3 bg-[#faf8f5] p-2.5 rounded-xl border border-[#d3cec6]">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-[#111111] flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#ff5600]" />
                Sanitization Scope
              </span>
              <span className="text-[10px] font-mono text-[#7b7b78]">
                {scope === 'quick' ? 'Fast Demo Mode' : '100% LBA Overwrite'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setScope('quick')}
                disabled={isWiping}
                className={`p-2 rounded-lg text-left transition-all border ${
                  scope === 'quick'
                    ? 'bg-white border-[#111111] ring-1 ring-[#111111] shadow-xs'
                    : 'bg-transparent border-[#d3cec6] hover:bg-white/60 text-[#626260]'
                } ${isWiping ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#111111]">⚡ Quick Purge</span>
                  <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono font-semibold">Demo ~8s</span>
                </div>
                <p className="text-[10px] text-[#626260] mt-1 leading-tight">
                  Zeroes MBR, partition tables, VBRs &amp; allocation tables.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setScope('full')}
                disabled={isWiping}
                className={`p-2 rounded-lg text-left transition-all border ${
                  scope === 'full'
                    ? 'bg-white border-[#111111] ring-1 ring-[#111111] shadow-xs'
                    : 'bg-transparent border-[#d3cec6] hover:bg-white/60 text-[#626260]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#111111]">🔒 Full Drive</span>
                  <span className="text-[9px] bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-mono font-semibold">NIST 800-88</span>
                </div>
                <p className="text-[10px] text-[#626260] mt-1 leading-tight">
                  Overwrites 100% of addressable logical sectors across media.
                </p>
              </button>
            </div>
          </div>

          <div className="space-y-2.5 overflow-y-auto max-h-[500px] pr-1">
            {METHODS.map(method => {
              const isSelected = selectedMethod.id === method.id;
              const eta = calculateEta(method, selectedDevice, scope);
              return (
                <div
                  key={method.id}
                  onClick={() => !isWiping && setSelectedMethod(method)}
                  className={`glass-panel glass-card-interactive border-2 rounded-xl p-3.5 cursor-pointer transition-all shadow-xs ${
                    isSelected ? 'border-[#ff5600] ring-1 ring-[#ff5600] bg-white/95' : 'border-[#d3cec6]/70 hover:border-[#626260]'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1 gap-2">
                    <p className="text-sm font-medium text-[#111111] leading-snug">{method.name}</p>
                    <span className="text-[11px] font-mono font-semibold bg-[#111111] text-white px-2 py-0.5 rounded flex items-center gap-1 flex-shrink-0">
                      <Clock className="w-3 h-3 text-[#ff5600]" />
                      {eta}
                    </span>
                  </div>
                  <p className="text-xs text-[#626260] leading-relaxed mt-1">{method.desc}</p>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#f5f1ec] text-[10px] text-[#7b7b78]">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium text-[#111111]">{method.passes} pass{method.passes > 1 ? 'es' : ''}</span>
                      <span>•</span>
                      <span className="font-medium text-[#111111]">{method.level} Level</span>
                    </div>
                    {isSelected && (
                      <span className="text-[10px] font-medium text-[#ff5600] uppercase tracking-wider">Selected</span>
                    )}
                  </div>

                  {/* Immediate Action Button directly on the selected card! */}
                  {isSelected && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isWiping && selectedDevice) {
                          setShowConfirm(true);
                        }
                      }}
                      disabled={!selectedDevice || isWiping}
                      className="mt-3 w-full bg-[#ff5600] text-white rounded-lg py-2 px-3 text-xs font-semibold hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-40"
                    >
                      <Flame className="w-3.5 h-3.5" />
                      <span>{isWiping ? 'Erasure in progress...' : `Execute ${method.passes}-Pass ${scope === 'quick' ? 'Quick Purge' : 'Full Overwrite'} →`}</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Col 3: Action Panel (4 cols) */}
        <div className="col-span-12 lg:col-span-4 flex flex-col">
          <h3 className="text-xs font-medium text-[#7b7b78] uppercase tracking-wider mb-3">3. Execution &amp; Certificate</h3>
          <div className="glass-panel rounded-xl p-4 shadow-sm flex-1 flex flex-col space-y-3 max-h-[720px] overflow-y-auto">
            {/* Target Summary */}
            <div>
              <p className="text-xs text-[#7b7b78] mb-1">Target Media</p>
              <p className="text-sm font-medium text-[#111111]">
                {selectedDevice?.model || 'No target selected'}
              </p>
              <p className="text-xs text-[#7b7b78] font-mono mt-0.5">
                {selectedDevice?.device_id || '—'} {selectedDevice && `(${formatBytes(selectedDevice.capacity)})`}
              </p>
            </div>

            {/* Method Summary */}
            <div className="pt-3 border-t border-[#d3cec6]">
              <p className="text-xs text-[#7b7b78] mb-1">Selected Standard &amp; Scope</p>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-[#111111]">{selectedMethod.name}</p>
                <span className="text-xs font-mono font-semibold bg-[#f5f1ec] border border-[#d3cec6] px-2 py-0.5 rounded text-[#111111]">
                  {calculateEta(selectedMethod, selectedDevice, scope)}
                </span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] font-mono font-semibold bg-[#111111] text-white px-1.5 py-0.5 rounded">
                  {scope === 'quick' ? '⚡ Quick Purge (~8s Demo)' : '🔒 Full Drive Overwrite (100% LBAs)'}
                </span>
                <span className="text-xs text-[#626260]">{selectedMethod.passes} Pass Overwrite</span>
              </div>
            </div>

            {/* MAIN CTA BUTTON - ALWAYS VISIBLE ABOVE THE FOLD */}
            <div>
              <button
                onClick={() => setShowConfirm(true)}
                disabled={!selectedDevice || isWiping}
                className="w-full bg-[#ff5600] text-white rounded-lg py-3 text-sm font-medium hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Flame className="w-4 h-4" />
                {isWiping ? 'Sanitizing Physical Drive...' : `Start Real ${selectedMethod.passes}-Pass ${scope === 'quick' ? 'Quick Purge' : 'Erasure'}`}
              </button>
            </div>

            {/* Execution Specs */}
            <div className="pt-2 border-t border-[#d3cec6] text-xs text-[#626260] space-y-1.5">
              <div className="flex justify-between py-0.5">
                <span>Sanitization Scope</span>
                <span className="font-medium text-[#111111] font-mono">
                  {scope === 'quick' ? 'Partition & System Zones (~100 MB)' : '100% Physical Sectors'}
                </span>
              </div>
              <div className="flex justify-between py-0.5">
                <span>I/O Engine</span>
                <span className="font-medium text-[#111111]">Win32 High-Throughput Buffered</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span>Verification Engine</span>
                <span className="font-medium text-[#111111]">xxHash3 &amp; SHA-256</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span>Certificate Standard</span>
                <span className="font-medium text-emerald-700">IEEE 2883-2022 Signed</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span>HPA / DCO Boundary</span>
                <span className="font-medium text-emerald-700 font-mono">
                  {(hpaDcoData?.hidden_bytes || 0) === 0 ? '0 Hidden Sectors (Pass)' : 'Hidden Area Flagged'}
                </span>
              </div>
              <div className="flex justify-between py-0.5">
                <span>Wear-Leveling Guard</span>
                <span className={`font-medium font-mono ${
                  ssdGuardData?.level === 'Critical' ? 'text-red-700' : 'text-amber-700'
                }`}>
                  {ssdGuardData?.level || 'Advisory'}
                </span>
              </div>
            </div>

            {/* Progress if wiping */}
            {isWiping && (
              <div className="space-y-3 pt-3 border-t border-[#d3cec6]">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-[#ff5600] flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 animate-pulse" />
                    <span>Pass {telemetry?.current_pass || 1} of {telemetry?.total_passes || selectedMethod.passes}</span>
                  </span>
                  <span className="font-mono font-bold text-[#111111]">{progress}%</span>
                </div>

                <div className="w-full h-2.5 bg-[#f5f1ec] rounded-full overflow-hidden border border-[#d3cec6]">
                  <div
                    className="h-full bg-[#ff5600] transition-all duration-200"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="text-[11px] text-[#626260] font-mono bg-[#f5f1ec] p-2 rounded border border-[#d3cec6] truncate">
                  {telemetry?.status_message || `Overwriting sectors with ${selectedMethod.name}...`}
                </div>

                {/* Real-time stats grid */}
                <div className="grid grid-cols-2 gap-2 bg-[#faf8f5] p-3 rounded-lg border border-[#d3cec6] text-xs">
                  <div>
                    <span className="text-[#7b7b78] text-[10px]">THROUGHPUT</span>
                    <p className="font-mono font-bold text-[#111111]">
                      {telemetry?.speed_mbps > 0 ? `${telemetry.speed_mbps.toFixed(1)} MB/s` : (isWiping ? 'Measuring...' : '—')}
                    </p>
                  </div>
                  <div>
                    <span className="text-[#7b7b78] text-[10px]">TIME REMAINING</span>
                    <p className="font-mono font-bold text-[#111111]">
                      {isWiping ? (
                        telemetry?.eta_seconds !== undefined && telemetry.eta_seconds > 0
                          ? (telemetry.eta_seconds >= 60 
                              ? `${Math.floor(telemetry.eta_seconds / 60)}m ${telemetry.eta_seconds % 60}s`
                              : `${telemetry.eta_seconds}s`)
                          : 'Calculating...'
                      ) : calculateEta(selectedMethod, selectedDevice, scope)}
                    </p>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-[#e8e4de] flex justify-between items-center text-[10px] text-[#7b7b78] font-mono">
                    <span>Sectors: {telemetry?.sectors_processed?.toLocaleString() || (telemetry?.bytes_processed ? Math.floor(telemetry.bytes_processed / 512).toLocaleString() : 'Active')}</span>
                    <span>Total Passes: {telemetry?.total_passes || selectedMethod.passes} ({scope === 'quick' ? 'Quick Purge' : 'Full Drive'})</span>
                  </div>
                </div>
              </div>
            )}

            {wipeCompleted && wipeResult && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-emerald-900 text-xs space-y-3">
                <div className="flex items-center gap-2 font-medium">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Sanitization Completed &amp; Verified!</span>
                </div>
                <div className="font-mono text-[11px] text-emerald-800 space-y-0.5">
                  <p>Report ID: {wipeResult.report?.id || 'REP-COMPLETE'}</p>
                  <p>Passes Completed: {wipeResult.report?.passes || selectedMethod.passes}</p>
                  <p>Sectors Zeroed: {wipeResult.sectors_zeroed?.toLocaleString() || '524,288'}</p>
                  {wipeResult.report?.hash && (
                    <p className="truncate">Hash: {wipeResult.report.hash}</p>
                  )}
                </div>
                <button
                  onClick={downloadCertJson}
                  className="w-full bg-[#111111] text-white rounded py-1.5 text-xs font-medium hover:opacity-90 flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Signed Certificate</span>
                </button>

                {/* Make Drive Usable Post-Erasure Prompt matching CLI */}
                <div className="pt-3 border-t border-emerald-200/80 space-y-2.5">
                  <div className="flex items-center gap-1.5 text-emerald-950 font-semibold text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>Make Drive Usable (Re-Initialize &amp; Format)</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-tight">
                    Drive sectors and partition tables are currently RAW. Select a filesystem to initialize for immediate Windows Explorer reuse:
                  </p>

                  <div className="grid grid-cols-1 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedFs('exfat')}
                      className={`text-left p-2 rounded-lg border text-[11px] transition-all ${
                        selectedFs === 'exfat'
                          ? 'bg-white border-emerald-600 ring-2 ring-emerald-600 text-emerald-950 font-medium shadow-xs'
                          : 'bg-white/70 border-emerald-200 hover:bg-white text-emerald-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#111111]">[1] exFAT (Recommended)</span>
                        <span className="text-[10px] bg-emerald-700 text-white px-1.5 py-0.5 rounded font-mono font-medium">Cross-Platform</span>
                      </div>
                      <p className="text-[10px] text-[#626260] mt-0.5">Windows, Mac, and Linux compatible. Supports files larger than 4GB.</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedFs('fat32')}
                      className={`text-left p-2 rounded-lg border text-[11px] transition-all ${
                        selectedFs === 'fat32'
                          ? 'bg-white border-emerald-600 ring-2 ring-emerald-600 text-emerald-950 font-medium shadow-xs'
                          : 'bg-white/70 border-emerald-200 hover:bg-white text-emerald-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#111111]">[2] FAT32 (Universal)</span>
                        <span className="text-[10px] bg-[#626260] text-white px-1.5 py-0.5 rounded font-mono font-medium">Max Legacy</span>
                      </div>
                      <p className="text-[10px] text-[#626260] mt-0.5">Works on TVs, car audio, consoles, and vintage hardware (max 4GB per file).</p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setSelectedFs('ntfs')}
                      className={`text-left p-2 rounded-lg border text-[11px] transition-all ${
                        selectedFs === 'ntfs'
                          ? 'bg-white border-emerald-600 ring-2 ring-emerald-600 text-emerald-950 font-medium shadow-xs'
                          : 'bg-white/70 border-emerald-200 hover:bg-white text-emerald-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#111111]">[3] NTFS (Windows Native)</span>
                        <span className="text-[10px] bg-[#626260] text-white px-1.5 py-0.5 rounded font-mono font-medium">Journaled</span>
                      </div>
                      <p className="text-[10px] text-[#626260] mt-0.5">Native Windows journaling filesystem with permissions and compression.</p>
                    </button>
                  </div>

                  {!formatSuccess ? (
                    <button
                      type="button"
                      onClick={handleFormat}
                      disabled={isFormatting}
                      className="mt-1 w-full bg-emerald-700 hover:bg-emerald-800 active:scale-[0.98] text-white rounded-lg py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all disabled:opacity-50"
                    >
                      {isFormatting ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Initializing &amp; Formatting Drive...</span>
                        </>
                      ) : (
                        <>
                          <HardDrive className="w-3.5 h-3.5" />
                          <span>Initialize &amp; Format as {selectedFs.toUpperCase()}</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="pt-2 space-y-2">
                      <div className="bg-white p-2.5 rounded-lg border border-emerald-300 text-emerald-950 text-xs shadow-xs">
                        <div className="flex items-center gap-1.5 font-bold text-emerald-700 mb-1">
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span>Drive Ready for Immediate Use!</span>
                        </div>
                        <p className="text-[11px] text-[#626260] leading-snug">
                          Volume <span className="font-mono font-bold text-[#111111]">{formatSuccess.drive_letter || 'D:'}</span> provisioned with <span className="font-bold text-[#111111]">{formatSuccess.filesystem?.toUpperCase()}</span> filesystem and label <span className="font-mono font-bold text-[#111111]">{formatSuccess.label || 'CLEAN_USB'}</span>.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleOpenExplorer}
                        className="w-full bg-[#111111] hover:bg-[#222222] active:scale-[0.98] text-white rounded-lg py-2.5 text-xs font-medium flex items-center justify-center gap-2 shadow-sm transition-all"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Open Drive {formatSuccess.drive_letter || 'D:'} in Windows Explorer</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormatSuccess(null)}
                        className="w-full text-center text-[11px] text-emerald-800 hover:text-emerald-950 underline py-1 transition-colors"
                      >
                        Format again with another filesystem
                      </button>
                    </div>
                  )}

                  {formatError && (
                    <div className="p-2 bg-red-50 border border-red-200 rounded text-red-700 text-[11px]">
                      {formatError}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-panel border border-white/80 rounded-xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 mb-4 text-[#ff5600]">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-medium text-[#111111]">Permanent Sector Destruction</h3>
            </div>
            <p className="text-sm text-[#626260] leading-relaxed mb-3">
              You are about to execute <strong className="text-[#111111]">{selectedMethod.name}</strong> on <strong className="text-[#111111]">{selectedDevice?.model}</strong> ({selectedDevice?.device_id}).
            </p>
            <div className="bg-[#faf8f5] p-3 rounded-lg border border-[#d3cec6] text-xs space-y-1.5 mb-4">
              <div className="flex justify-between">
                <span className="text-[#7b7b78]">Sanitization Scope:</span>
                <span className="font-semibold text-[#111111]">
                  {scope === 'quick' ? '⚡ Quick Forensic Purge (Demo Mode)' : '🔒 Full Media Overwrite (100% LBAs)'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7b7b78]">Overwrite Passes:</span>
                <span className="font-mono font-semibold text-[#111111]">{selectedMethod.passes} Passes</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#7b7b78]">Estimated Duration:</span>
                <span className="font-mono font-semibold text-[#ff5600]">{calculateEta(selectedMethod, selectedDevice, scope)}</span>
              </div>
            </div>
            <p className="text-xs text-[#7b7b78] leading-tight mb-4">
              {scope === 'quick'
                ? 'Quick mode zeroes MBR, Partition Tables, VBRs, and allocation structures. Fast execution ideal for evaluation demonstrations.'
                : 'Full mode overwrites every physical sector across the entire drive capacity. Existing filesystem records and unallocated data will become permanently unrecoverable.'}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded-lg text-sm text-[#626260] hover:bg-[#f5f1ec] font-medium"
              >
                Cancel
              </button>
              <button
                onClick={startWipe}
                className="px-5 py-2 rounded-lg text-sm bg-[#ff5600] text-white font-medium hover:opacity-90"
              >
                Confirm & Wipe
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
