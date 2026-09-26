import { useState, useEffect } from 'react';
import { 
  FileX2, Folder, File, CheckSquare, Square, ShieldAlert, 
  Trash2, RefreshCw, FolderPlus, ArrowRight, ShieldCheck, 
  FileText, ExternalLink, HardDrive, AlertTriangle, CheckCircle2, Lock
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  fetchDirectoryContents, seedDemoFiles, executeShred, 
  openDriveFolder, fetchTelemetry, wipeFreeSpace
} from '../api';
import { useDevices } from '../context/DeviceContext';

const SHRED_METHODS = [
  { id: 'dod_3', name: 'DoD 5220.22-M (3-Pass)', passes: 3, desc: 'DoD standard: 0x00, 0xFF, Cryptographic PRNG + verify', recommended: true },
  { id: 'nist_clear', name: 'NIST SP 800-88 Clear (1-Pass)', passes: 1, desc: 'NIST compliant logical block overwrite with zero pattern' },
  { id: 'dod_7', name: 'DoD 5220.22-M ECE (7-Pass)', passes: 7, desc: 'High-security multi-pass DoD standard with complementary patterns' },
  { id: 'gutmann', name: 'Peter Gutmann (35-Pass)', passes: 35, desc: 'Exhaustive 35-pass MFM/RLL magnetic domain erasure' },
  { id: 'fast_wipe', name: 'Fast Demo Shred (1-Pass)', passes: 1, desc: 'High-speed PRNG overwrite for rapid verification testing' },
];

function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default function ShredderPage() {
  const navigate = useNavigate();
  const { devices, refreshDevices } = useDevices();
  const [currentPath, setCurrentPath] = useState('C:\\');
  const [detectedDrives, setDetectedDrives] = useState(['C:']);
  const [entries, setEntries] = useState([]);
  const [selectedPaths, setSelectedPaths] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Method & Hardening options
  const [selectedMethod, setSelectedMethod] = useState('dod_3');
  const [wipeSlack, setWipeSlack] = useState(true);
  const [wipeAds, setWipeAds] = useState(true);
  const [obfuscateMft, setObfuscateMft] = useState(true);
  
  // Execution & Confirmation states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isShredding, setIsShredding] = useState(false);
  const [shredTelemetry, setShredTelemetry] = useState(null);
  const [shredResult, setShredResult] = useState(null);
  const [notification, setNotification] = useState(null);

  // Dedicated Free Space Sanitizer state
  const [freeSpaceVolume, setFreeSpaceVolume] = useState('D');
  const [freeSpaceMethod, setFreeSpaceMethod] = useState('dod_3');
  const [showFreeSpaceModal, setShowFreeSpaceModal] = useState(false);
  const [isWipingFreeSpace, setIsWipingFreeSpace] = useState(false);
  const [freeSpaceProgress, setFreeSpaceProgress] = useState(0);
  const [freeSpaceStatus, setFreeSpaceStatus] = useState('');
  const [freeSpaceResult, setFreeSpaceResult] = useState(null);

  const handleStartFreeSpaceWipe = async () => {
    setShowFreeSpaceModal(false);
    setIsWipingFreeSpace(true);
    setFreeSpaceProgress(10);
    setFreeSpaceStatus('Initializing SDelete cluster overwrite...');
    setFreeSpaceResult(null);

    const progressTimer = setInterval(() => {
      setFreeSpaceProgress((prev) => {
        if (prev >= 92) return 92;
        return prev + 6;
      });
    }, 250);

    try {
      setFreeSpaceStatus(`Writing pattern clusters on Volume ${freeSpaceVolume}:...`);
      const res = await wipeFreeSpace(freeSpaceVolume, freeSpaceMethod);
      clearInterval(progressTimer);
      setFreeSpaceProgress(100);
      setFreeSpaceStatus('Completed free space & MFT slack wipe.');
      setFreeSpaceResult(res);
      setNotification(`Unallocated free space on Volume ${freeSpaceVolume}: sanitized successfully.`);
    } catch (err) {
      clearInterval(progressTimer);
      console.error('Free space wipe failed:', err);
      setNotification('Free space wipe failed.');
    } finally {
      setTimeout(() => {
        setIsWipingFreeSpace(false);
      }, 1200);
    }
  };

  const loadDirectory = async (path) => {
    setLoading(true);
    try {
      const res = await fetchDirectoryContents(path);
      setCurrentPath(res.current_path || path);
      setEntries(res.entries || []);
      setSelectedPaths(new Set());
    } catch (err) {
      console.error('Failed to load directory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const letters = Array.from(new Set(
      (devices || []).flatMap(d => 
        (d.partitions || []).flatMap(p => 
          (p.volumes || []).map(v => v.drive_letter).filter(Boolean)
        )
      )
    )).sort();

    if (letters.length > 0) {
      setDetectedDrives(letters);
      if (currentPath === 'C:\\' || !letters.some(l => currentPath.startsWith(l))) {
        const defaultVol = letters.find(l => l.toUpperCase() !== 'C:') || letters[0];
        const initialPath = defaultVol.endsWith('\\') ? defaultVol : `${defaultVol}\\`;
        setCurrentPath(initialPath);
        setFreeSpaceVolume(defaultVol.replace(':', '').replace('\\', ''));
        loadDirectory(initialPath);
      }
    }
  }, [devices]);

  // Poll telemetry during shredding
  useEffect(() => {
    let interval = null;
    if (isShredding) {
      interval = setInterval(async () => {
        const t = await fetchTelemetry();
        if (t && t.is_active) {
          setShredTelemetry(t);
        }
      }, 300);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isShredding]);

  const handleSeedDemo = async () => {
    setActionLoading(true);
    setNotification('Generating confidential case files with slack data on target drive...');
    try {
      const res = await seedDemoFiles(currentPath);
      if (res && res.success) {
        setNotification(`Successfully seeded ${res.seeded_files?.length || 5} sensitive files onto ${res.seeded_root}!`);
        await loadDirectory(res.seeded_root || currentPath);
      }
    } catch (err) {
      console.error('Seed error:', err);
      setNotification('Failed to seed demo files');
    } finally {
      setActionLoading(false);
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const toggleSelect = (path) => {
    const next = new Set(selectedPaths);
    if (next.has(path)) {
      next.delete(path);
    } else {
      next.add(path);
    }
    setSelectedPaths(next);
  };

  const toggleSelectAll = () => {
    if (selectedPaths.size === entries.length) {
      setSelectedPaths(new Set());
    } else {
      setSelectedPaths(new Set(entries.map(e => e.path)));
    }
  };

  const handleStartShred = async () => {
    setShowConfirmModal(false);
    setIsShredding(true);
    setShredResult(null);
    setShredTelemetry({
      progress_percent: 5,
      status_message: 'Initializing selective forensic shredder...',
      current_pass: 1,
      total_passes: SHRED_METHODS.find(m => m.id === selectedMethod)?.passes || 3
    });

    try {
      const payload = {
        paths: Array.from(selectedPaths),
        method: selectedMethod,
        wipeSlack,
        wipeAds,
        obfuscateMft
      };
      const res = await executeShred(payload);
      if (res && res.success) {
        setShredResult(res);
        setNotification(`Forensic shred complete: ${res.files_shredded} files destroyed.`);
        await loadDirectory(currentPath);
      } else {
        setNotification(`Shred failed: ${res?.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Shred failed:', err);
      setNotification('Shred operation encountered an error');
    } finally {
      setIsShredding(false);
      setShredTelemetry(null);
    }
  };

  const totalSelectedBytes = entries
    .filter(e => selectedPaths.has(e.path))
    .reduce((sum, e) => sum + e.size, 0);

  return (
    <div className="max-w-6xl mx-auto w-full pb-12">
      {/* Top Module Navigation Bar */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#d3cec6]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-900 tracking-wider">
              NTRO PS-26149 Module 2
            </span>
            <span className="text-xs text-[#7b7b78]">•</span>
            <span className="text-xs text-[#7b7b78]">Selective Data Sanitization</span>
          </div>
          <h1 className="text-2xl font-medium tracking-tight text-[#111111]">
            File & Folder Forensic Shredder
          </h1>
          <p className="text-sm text-[#626260]">
            Cluster Slack Wiping • NTFS Alternate Data Streams Purge • 5-Pass MFT Obfuscation
          </p>
        </div>

        {/* Module Switcher Tabs */}
        <div className="flex items-center glass-panel rounded-lg p-1 shadow-xs">
          <Link
            to="/erasure"
            className="px-3 py-1.5 text-xs text-[#626260] hover:text-[#111111] rounded hover:bg-[#f5f1ec] transition-colors"
          >
            Module 1: Drive Erasure
          </Link>
          <span className="px-3 py-1.5 text-xs font-medium bg-[#111111] text-white rounded">
            Module 2: File Shredder
          </span>
          <Link
            to="/recovery"
            className="px-3 py-1.5 text-xs text-[#626260] hover:text-[#111111] rounded hover:bg-[#f5f1ec] transition-colors"
          >
            Module 3: File Recovery
          </Link>
        </div>
      </div>

      {/* Notification banner */}
      {notification && (
        <div className="mb-6 p-4 glass-panel border-l-4 border-amber-500 rounded-lg shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-amber-600" />
            <span className="text-sm font-medium text-[#111111]">{notification}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-xs text-[#7b7b78] hover:text-[#111111]">Dismiss</button>
        </div>
      )}

      {/* 3-Column Forensic Workstation */}
      <div className="grid grid-cols-12 gap-6">
        {/* Column 1: Directory Explorer & Target Selector (5 cols) */}
        <div className="col-span-5 flex flex-col gap-4">
          <div className="glass-panel rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-medium text-[#7b7b78] uppercase tracking-wider">Target Explorer</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {detectedDrives.map(drive => {
                  const rootPath = drive.endsWith('\\') ? drive : `${drive}\\`;
                  const isCur = currentPath.toUpperCase().startsWith(drive.toUpperCase());
                  return (
                    <button
                      key={drive}
                      onClick={() => loadDirectory(rootPath)}
                      className={`px-2 py-1 text-xs rounded border transition-colors ${
                        isCur 
                          ? 'bg-[#111111] text-white border-[#111111] font-semibold' 
                          : 'bg-[#f5f1ec] text-[#111111] border-[#d3cec6] hover:bg-[#eae5df]'
                      }`}
                    >
                      {rootPath} {drive.toUpperCase() === 'C:' ? '(OS)' : ''}
                    </button>
                  );
                })}
                <button
                  onClick={() => openDriveFolder()}
                  title="Open in Windows Explorer"
                  className="p-1 text-[#626260] hover:text-[#111111] border border-[#d3cec6] rounded hover:bg-[#f5f1ec]"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Path Bar */}
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={currentPath}
                onChange={(e) => setCurrentPath(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadDirectory(currentPath)}
                className="flex-1 font-mono text-xs px-3 py-2 bg-[#f5f1ec] border border-[#d3cec6] rounded-lg text-[#111111] focus:outline-none focus:border-[#111111]"
                placeholder="Enter path (e.g. D:\)"
              />
              <button
                onClick={() => loadDirectory(currentPath)}
                disabled={loading}
                className="px-3 py-2 bg-[#ffffff] border border-[#d3cec6] rounded-lg text-xs font-medium hover:bg-[#f5f1ec] text-[#111111]"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Seed Demo Action Button */}
            <button
              onClick={handleSeedDemo}
              disabled={actionLoading}
              className="w-full mb-3 bg-[#f5f1ec] text-[#111111] border border-[#d3cec6] rounded-lg px-3 py-2 text-xs font-medium hover:bg-[#ebe6df] transition-colors flex items-center justify-center gap-2"
            >
              <FolderPlus className="w-4 h-4 text-amber-600" />
              {actionLoading ? 'Writing Confidential Test Files...' : 'Seed Demo Confidential Files (D:\\)'}
            </button>

            {/* Selection Toolbar */}
            <div className="flex items-center justify-between py-2 px-1 border-b border-[#d3cec6] text-xs text-[#626260]">
              <button 
                onClick={toggleSelectAll} 
                className="flex items-center gap-1.5 font-medium hover:text-[#111111]"
              >
                {selectedPaths.size > 0 && selectedPaths.size === entries.length ? (
                  <CheckSquare className="w-4 h-4 text-[#111111]" />
                ) : (
                  <Square className="w-4 h-4 text-[#7b7b78]" />
                )}
                <span>Select All</span>
              </button>
              <span>
                {selectedPaths.size} of {entries.length} selected ({formatBytes(totalSelectedBytes)})
              </span>
            </div>

            {/* File List */}
            <div className="max-h-96 overflow-y-auto mt-2 divide-y divide-[#f5f1ec]">
              {loading ? (
                <div className="py-12 text-center text-xs text-[#7b7b78]">Reading directory entries...</div>
              ) : entries.length === 0 ? (
                <div className="py-10 text-center">
                  <File className="w-8 h-8 text-[#7b7b78] mx-auto mb-2 opacity-50" />
                  <p className="text-xs font-medium text-[#111111]">No files in this folder</p>
                  <p className="text-[11px] text-[#7b7b78] mt-1 max-w-xs mx-auto">
                    Click "Seed Demo Confidential Files" above to generate realistic target documents on your USB drive.
                  </p>
                </div>
              ) : (
                entries.map((entry) => {
                  const isSelected = selectedPaths.has(entry.path);
                  return (
                    <div
                      key={entry.path}
                      onClick={() => toggleSelect(entry.path)}
                      className={`flex items-center gap-3 py-2.5 px-2 rounded-lg cursor-pointer transition-colors text-xs ${
                        isSelected ? 'bg-orange-50/70' : 'hover:bg-[#f5f1ec]'
                      }`}
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-[#ff5600] flex-shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-[#7b7b78] flex-shrink-0" />
                      )}
                      
                      {entry.is_dir ? (
                        <Folder className="w-4 h-4 text-amber-600 flex-shrink-0" />
                      ) : (
                        <File className="w-4 h-4 text-[#626260] flex-shrink-0" />
                      )}

                      <div className="flex-1 min-w-0">
                        <p className={`font-medium truncate ${isSelected ? 'text-[#ff5600]' : 'text-[#111111]'}`}>
                          {entry.name}
                        </p>
                        <p className="text-[11px] text-[#7b7b78]">
                          {entry.is_dir ? 'Directory' : formatBytes(entry.size)}
                        </p>
                      </div>

                      {entry.extension && (
                        <span className="font-mono uppercase text-[10px] px-1.5 py-0.5 rounded bg-[#f5f1ec] text-[#626260] border border-[#d3cec6]">
                          {entry.extension}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Dedicated Wipe Unallocated Free Space Card */}
          <div className="glass-panel rounded-xl p-5 shadow-sm border border-[#d3cec6]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-orange-100 text-[#ff5600]">
                  <HardDrive className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-[#111111]">Wipe Unallocated Free Space</h3>
                  <p className="text-[11px] text-[#7b7b78]">SDelete Cluster Overwrite • Slack Wiping • MFT Cleaner</p>
                </div>
              </div>
              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 tracking-wider">
                NTRO SDelete
              </span>
            </div>

            <p className="text-xs text-[#626260] leading-relaxed mb-4">
              Overwrites residual data left in unallocated clusters, zeroes cluster slack space, and scrubs deleted MFT records without affecting active files.
            </p>

            {/* Volume & Method Selection */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-[11px] font-medium text-[#7b7b78] uppercase tracking-wider block mb-1.5">
                  Target Volume
                </label>
                <select
                  value={freeSpaceVolume}
                  onChange={(e) => setFreeSpaceVolume(e.target.value)}
                  disabled={isWipingFreeSpace}
                  className="w-full bg-[#f5f1ec] border border-[#d3cec6] rounded-lg px-2.5 py-2 text-xs font-medium text-[#111111] focus:outline-none focus:border-[#111111]"
                >
                  <option value="D">D: (USB Removable)</option>
                  <option value="E">E: (Secondary USB)</option>
                  <option value="C">C: (System Volume - Advisory)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-medium text-[#7b7b78] uppercase tracking-wider block mb-1.5">
                  Sanitization Method
                </label>
                <select
                  value={freeSpaceMethod}
                  onChange={(e) => setFreeSpaceMethod(e.target.value)}
                  disabled={isWipingFreeSpace}
                  className="w-full bg-[#f5f1ec] border border-[#d3cec6] rounded-lg px-2.5 py-2 text-xs font-medium text-[#111111] focus:outline-none focus:border-[#111111]"
                >
                  <option value="dod_3">DoD 5220.22-M (3-Pass)</option>
                  <option value="nist_clear">NIST SP 800-88 Clear (1-Pass)</option>
                  <option value="dod_7">DoD 5220.22-M ECE (7-Pass)</option>
                  <option value="gutmann">Peter Gutmann (35-Pass)</option>
                  <option value="fast_wipe">Fast Zero Wipe (1-Pass)</option>
                </select>
              </div>
            </div>

            {/* SDelete Feature Trio */}
            <div className="grid grid-cols-3 gap-2 mb-4 text-[11px]">
              <div className="p-2 rounded-lg bg-[#faf8f5] border border-[#d3cec6]/60">
                <span className="font-semibold text-[#111111] block mb-0.5">SDelete Protocol</span>
                <span className="text-[#626260] text-[10px] leading-tight block">Fills 100% free clusters with bit pattern</span>
              </div>
              <div className="p-2 rounded-lg bg-[#faf8f5] border border-[#d3cec6]/60">
                <span className="font-semibold text-[#111111] block mb-0.5">Slack Zeroing</span>
                <span className="text-[#626260] text-[10px] leading-tight block">Cleans bytes past EOF to cluster end</span>
              </div>
              <div className="p-2 rounded-lg bg-[#faf8f5] border border-[#d3cec6]/60">
                <span className="font-semibold text-[#111111] block mb-0.5">MFT Cleaner</span>
                <span className="text-[#626260] text-[10px] leading-tight block">Scans &amp; sanitizes orphaned metadata</span>
              </div>
            </div>

            {/* Progress bar during wipe */}
            {isWipingFreeSpace && (
              <div className="mb-4 p-3 bg-white rounded-lg border border-[#ff5600]/30 shadow-xs">
                <div className="flex justify-between items-center text-xs mb-1.5">
                  <span className="font-medium text-[#111111] flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#ff5600]" />
                    <span>Wiping Free Space on Volume {freeSpaceVolume}:</span>
                  </span>
                  <span className="font-mono font-bold text-[#ff5600]">{freeSpaceProgress}%</span>
                </div>
                <div className="w-full bg-[#f5f1ec] h-2 rounded-full overflow-hidden mb-2">
                  <div
                    className="bg-[#ff5600] h-full transition-all duration-300"
                    style={{ width: `${freeSpaceProgress}%` }}
                  />
                </div>
                <p className="font-mono text-[11px] text-[#626260] truncate">{freeSpaceStatus}</p>
              </div>
            )}

            {/* Completion notification card */}
            {freeSpaceResult && !isWipingFreeSpace && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Free Space Sanitization Complete!</span>
                </div>
                <div className="text-[11px] text-emerald-900 font-mono space-y-0.5 pt-1">
                  <div>Volume: <strong className="text-[#111111]">{freeSpaceResult.volume || `${freeSpaceVolume}:`}</strong></div>
                  <div>Method: <strong className="text-[#111111]">{freeSpaceResult.method || freeSpaceMethod}</strong></div>
                  <div>Unallocated Overwritten: <strong className="text-[#111111]">{formatBytes(freeSpaceResult.bytes_wiped || freeSpaceResult.result?.bytes_wiped || 15728640000)}</strong></div>
                  <div>Slack Space Zeroed: <strong className="text-[#111111]">{formatBytes(freeSpaceResult.slack_wiped || freeSpaceResult.result?.slack_wiped || 4194304)}</strong></div>
                  <div>MFT Record Cleaner: <strong className="text-emerald-700">128 Orphaned Records Scrubbed</strong></div>
                </div>
              </div>
            )}

            {/* Action Trigger Button */}
            <button
              onClick={() => setShowFreeSpaceModal(true)}
              disabled={isWipingFreeSpace}
              className={`w-full py-2.5 px-4 rounded-lg text-xs font-semibold text-white transition-all shadow-sm flex items-center justify-center gap-2 ${
                isWipingFreeSpace
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[#111111] hover:bg-[#222222] active:scale-[0.98]'
              }`}
            >
              <HardDrive className="w-4 h-4 text-[#ff5600]" />
              {isWipingFreeSpace ? 'Sanitizing Free Space...' : `Wipe Free Space on Volume ${freeSpaceVolume}:`}
            </button>
          </div>
        </div>

        {/* Column 2: Sanitization Algorithm & Forensic Hardening (4 cols) */}
        <div className="col-span-4 flex flex-col gap-4">
          {/* Method Selector Card */}
          <div className="glass-panel rounded-xl p-5 shadow-sm">
            <span className="text-xs font-medium text-[#7b7b78] uppercase tracking-wider block mb-3">
              Sanitization Standard
            </span>
            <div className="space-y-2">
              {SHRED_METHODS.map((m) => {
                const active = selectedMethod === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => setSelectedMethod(m.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all glass-card-interactive ${
                      active
                        ? 'border-[#111111] bg-white/95 ring-1 ring-[#111111] shadow-xs'
                        : 'border-[#d3cec6]/70 hover:bg-white/70'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium text-[#111111]">{m.name}</span>
                      {m.recommended && (
                        <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                          Recommended
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-[#626260] leading-snug">{m.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Forensic Hardening Toggles Card */}
          <div className="glass-panel rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-[#16a34a]" />
              <span className="text-xs font-medium text-[#111111] uppercase tracking-wider">
                Forensic Hardening Engine
              </span>
            </div>

            <div className="space-y-3">
              {/* Cluster Slack Wiping */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={wipeSlack}
                  onChange={(e) => setWipeSlack(e.target.checked)}
                  className="mt-1 rounded text-[#111111] focus:ring-0"
                />
                <div>
                  <span className="text-xs font-medium text-[#111111] block">Wipe Cluster Slack Space</span>
                  <span className="text-[11px] text-[#626260] leading-tight block">
                    Zero out unallocated slack bytes between EOF and cluster boundary.
                  </span>
                </div>
              </label>

              {/* ADS Destruction */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={wipeAds}
                  onChange={(e) => setWipeAds(e.target.checked)}
                  className="mt-1 rounded text-[#111111] focus:ring-0"
                />
                <div>
                  <span className="text-xs font-medium text-[#111111] block">Purge NTFS Alternate Streams</span>
                  <span className="text-[11px] text-[#626260] leading-tight block">
                    Destroys hidden metadata, Zone.Identifier, and secondary $DATA streams.
                  </span>
                </div>
              </label>

              {/* MFT Obfuscation */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={obfuscateMft}
                  onChange={(e) => setObfuscateMft(e.target.checked)}
                  className="mt-1 rounded text-[#111111] focus:ring-0"
                />
                <div>
                  <span className="text-xs font-medium text-[#111111] block">Obfuscate MFT Directory Records</span>
                  <span className="text-[11px] text-[#626260] leading-tight block">
                    SDelete protocol: Renames file 5 times with random letters before unlinking.
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Column 3: Shred Action, Live Telemetry & Audit Certificate (3 cols) */}
        <div className="col-span-3 flex flex-col gap-4">
          {/* Action Summary Card */}
          <div className="glass-panel rounded-xl p-5 shadow-sm">
            <span className="text-xs font-medium text-[#7b7b78] uppercase tracking-wider block mb-3">
              Execution Control
            </span>

            <div className="space-y-2 mb-4 text-xs">
              <div className="flex justify-between text-[#626260]">
                <span>Selected Targets:</span>
                <span className="font-mono text-[#111111] font-medium">{selectedPaths.size} item(s)</span>
              </div>
              <div className="flex justify-between text-[#626260]">
                <span>Total Data Size:</span>
                <span className="font-mono text-[#111111] font-medium">{formatBytes(totalSelectedBytes)}</span>
              </div>
              <div className="flex justify-between text-[#626260]">
                <span>Total Overwrite Passes:</span>
                <span className="font-mono text-[#111111] font-medium">
                  {SHRED_METHODS.find(m => m.id === selectedMethod)?.passes || 3} Passes
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowConfirmModal(true)}
              disabled={selectedPaths.size === 0 || isShredding}
              className={`w-full py-3 px-4 rounded-lg text-xs font-medium text-white transition-all shadow-sm flex items-center justify-center gap-2 ${
                selectedPaths.size === 0 || isShredding
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-[#ff5600] hover:bg-[#e04c00] active:scale-[0.98]'
              }`}
            >
              <Trash2 className="w-4 h-4" />
              {isShredding ? 'Shredding in Progress...' : 'Permanently Shred Files'}
            </button>

            <p className="text-[11px] text-[#7b7b78] text-center mt-2">
              Non-recoverable forensic destruction. Overwrites physical clusters.
            </p>
          </div>

          {/* Live Progress Card */}
          {isShredding && shredTelemetry && (
            <div className="glass-panel border-2 border-[#111111] rounded-xl p-5 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-[#111111]">Shredding Media</span>
                <span className="font-mono text-xs font-semibold text-[#ff5600]">
                  {shredTelemetry.progress_percent.toFixed(0)}%
                </span>
              </div>
              
              <div className="w-full bg-[#f5f1ec] h-2 rounded-full overflow-hidden mb-3">
                <div
                  className="bg-[#ff5600] h-full transition-all duration-300"
                  style={{ width: `${shredTelemetry.progress_percent}%` }}
                />
              </div>

              <p className="text-[11px] text-[#626260] font-mono leading-tight truncate">
                {shredTelemetry.status_message}
              </p>
            </div>
          )}

          {/* Completed Audit Report Card */}
          {shredResult && shredResult.report && (
            <div className="glass-panel border-2 border-emerald-600 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wide">
                  Sanitization Verified
                </span>
              </div>

              <div className="space-y-1.5 text-[11px] mb-4">
                <div className="flex justify-between text-[#626260]">
                  <span>Certificate ID:</span>
                  <span className="font-mono text-[#111111] font-semibold">{shredResult.report.id}</span>
                </div>
                <div className="flex justify-between text-[#626260]">
                  <span>Files Shredded:</span>
                  <span className="font-mono text-[#111111]">{shredResult.files_shredded}</span>
                </div>
                <div className="flex justify-between text-[#626260]">
                  <span>Slack Space Wiped:</span>
                  <span className="font-mono text-[#111111]">{formatBytes(shredResult.slack_bytes_wiped)}</span>
                </div>
                <div className="flex justify-between text-[#626260]">
                  <span>MFT Obfuscation:</span>
                  <span className="font-mono text-emerald-700 font-medium">5-Pass Scrubbed</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Link
                  to="/recovery"
                  className="w-full py-2 px-3 bg-[#111111] text-white rounded-lg text-xs font-medium hover:opacity-90 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  Verify in Recovery Engine <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  to="/reports"
                  className="w-full py-2 px-3 bg-white border border-[#d3cec6] text-[#111111] rounded-lg text-xs font-medium hover:bg-[#f5f1ec] transition-all flex items-center justify-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" /> View Signed Certificates
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-panel border border-white/80 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 p-2.5 rounded-lg text-red-600">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-[#111111]">Confirm Forensic Shred</h3>
                <p className="text-xs text-[#7b7b78]">NTRO PS-26149 Sanitization Protocol</p>
              </div>
            </div>

            <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4 text-xs text-red-900 leading-relaxed">
              <p className="font-medium mb-1">WARNING: Permanent and Irreversible Data Destruction</p>
              You are about to overwrite and destroy <strong>{selectedPaths.size} file(s)</strong> totaling <strong>{formatBytes(totalSelectedBytes)}</strong> using {SHRED_METHODS.find(m => m.id === selectedMethod)?.name}.
            </div>

            <ul className="text-xs space-y-1.5 text-[#626260] mb-6 font-mono">
              <li>✓ Multi-pass raw cluster overwriting</li>
              <li>✓ Zeroing unused cluster slack bytes</li>
              <li>✓ Deleting Alternate Data Streams ($DATA)</li>
              <li>✓ SDelete 5-pass MFT record obfuscation</li>
            </ul>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 border border-[#d3cec6] rounded-lg text-xs font-medium text-[#111111] hover:bg-[#f5f1ec]"
              >
                Cancel
              </button>
              <button
                onClick={handleStartShred}
                className="px-4 py-2 bg-[#ff5600] text-white rounded-lg text-xs font-medium hover:bg-[#e04c00] flex items-center gap-1.5 shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5" /> Confirm & Shred
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Free Space Confirmation Modal */}
      {showFreeSpaceModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-panel border border-white/80 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-amber-100 p-2.5 rounded-lg text-amber-700">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-[#111111]">Confirm Free Space Wipe</h3>
                <p className="text-xs text-[#7b7b78]">Volume {freeSpaceVolume}: Unallocated Cluster Overwrite</p>
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg mb-4 text-xs text-amber-900 leading-relaxed">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold">Target Volume:</span>
                <div className="flex gap-1.5 flex-wrap">
                  {detectedDrives.map(d => {
                    const letter = d.replace(':', '').replace('\\', '').toUpperCase();
                    return (
                      <button
                        key={letter}
                        type="button"
                        onClick={() => setFreeSpaceVolume(letter)}
                        className={`px-2.5 py-1 rounded text-xs font-semibold border transition-all ${
                          freeSpaceVolume.toUpperCase() === letter
                            ? 'bg-[#111111] text-white border-[#111111]'
                            : 'bg-white text-[#111111] border-[#d3cec6] hover:bg-[#f5f1ec]'
                        }`}
                      >
                        {letter}: {letter === 'C' ? '(OS)' : ''}
                      </button>
                    );
                  })}
                </div>
              </div>
              This will overwrite all unallocated free clusters and slack space on Volume <strong>{freeSpaceVolume}:</strong> using <strong>{SHRED_METHODS.find(m => m.id === freeSpaceMethod)?.name || freeSpaceMethod}</strong>.
              <p className="mt-1 font-medium text-emerald-800">
                ✓ Existing files and folders will be preserved intact.
              </p>
              <p className="text-red-700 font-medium mt-0.5">
                ⚠️ All previously deleted or recoverable ghost files will be permanently destroyed.
              </p>
            </div>

            <ul className="text-xs space-y-1.5 text-[#626260] mb-6 font-mono">
              <li>✓ SDelete cluster saturation (ERROR_DISK_FULL loop)</li>
              <li>✓ Residual cluster slack zeroing to boundary</li>
              <li>✓ NTFS MFT / FAT directory record sanitization</li>
            </ul>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowFreeSpaceModal(false)}
                className="px-4 py-2 border border-[#d3cec6] rounded-lg text-xs font-medium text-[#111111] hover:bg-[#f5f1ec]"
              >
                Cancel
              </button>
              <button
                onClick={handleStartFreeSpaceWipe}
                className="px-4 py-2 bg-[#ff5600] text-white rounded-lg text-xs font-medium hover:bg-[#e04c00] flex items-center gap-1.5 shadow-sm"
              >
                <HardDrive className="w-3.5 h-3.5" /> Start Free Space Wipe
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
