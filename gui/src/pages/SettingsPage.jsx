import { useState, useEffect } from 'react';
import { Settings, Cpu, Zap, Shield, Bot, Server, Lock, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { fetchWriteProtect, setWriteProtect } from '../api';

export default function SettingsPage() {
  const [config, setConfig] = useState({
    pipeline: true,
    iouring: true,
    autoBuffer: true,
    bfd: true,
    bgc: false,
    groqKey: 'gsk_***********'
  });

  const [writeProtectState, setWriteProtectState] = useState({
    enabled: false,
    status: 'Checking policy...',
    registry_path: 'HKLM\\SYSTEM\\CurrentControlSet\\Control\\StorageDevicePolicies\\WriteProtect',
    message: ''
  });
  const [loadingWp, setLoadingWp] = useState(false);

  useEffect(() => {
    loadWriteProtect();
  }, []);

  const loadWriteProtect = async () => {
    try {
      const res = await fetchWriteProtect();
      if (res) {
        setWriteProtectState({
          enabled: !!res.write_protect_enabled,
          status: res.status || (res.write_protect_enabled ? 'Locked (Read-Only)' : 'Unlocked (Read-Write)'),
          registry_path: res.registry_policy_path || 'HKLM\\SYSTEM\\CurrentControlSet\\Control\\StorageDevicePolicies\\WriteProtect',
          message: res.description || ''
        });
      }
    } catch (err) {
      console.warn('Failed to query write protect policy:', err);
    }
  };

  const handleToggleWriteProtect = async () => {
    setLoadingWp(true);
    try {
      const next = !writeProtectState.enabled;
      const res = await setWriteProtect(next);
      if (res) {
        setWriteProtectState(prev => ({
          ...prev,
          enabled: !!res.write_protect_enabled,
          status: res.status || (res.write_protect_enabled ? 'Locked (Read-Only Forensic Mode)' : 'Unlocked (Read-Write)'),
          message: res.message || ''
        }));
      }
    } catch (err) {
      console.error('Failed to update write protect:', err);
    } finally {
      setLoadingWp(false);
    }
  };

  const toggle = (key) => setConfig(prev => ({ ...prev, [key]: !prev[key] }));

  const ToggleSwitch = ({ checked, onChange, disabled }) => (
    <button 
      onClick={onChange}
      disabled={disabled}
      className={`w-10 h-5 rounded-full relative transition-colors ${checked ? 'bg-[#111111]' : 'bg-[#d3cec6]'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
    </button>
  );

  return (
    <div className="h-full max-w-3xl mx-auto pb-10">
      <div className="mb-8 border-b border-[#d3cec6] pb-6">
        <h1 className="text-2xl font-medium tracking-tight text-[#111111] mb-1">Engine Configuration</h1>
        <p className="text-sm text-[#626260]">Advanced parameters, forensic write-blocking, and compliance settings.</p>
      </div>

      <div className="space-y-8">

        {/* Kernel Forensic Write-Blocking Policy */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#ff5600]" />
              <h2 className="text-sm font-medium text-[#111111]">Kernel-Level Forensic Write-Block Policy</h2>
            </div>
            <button
              onClick={loadWriteProtect}
              className="text-[#7b7b78] hover:text-[#111111] text-xs flex items-center gap-1 transition-colors"
              title="Rescan Windows Registry"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingWp ? 'animate-spin' : ''}`} />
              <span>Rescan Registry</span>
            </button>
          </div>

          <div className="glass-panel rounded-xl overflow-hidden shadow-sm border border-white/80 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-[#111111]">OS Automount &amp; Storage Write Protect</p>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                    writeProtectState.enabled 
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      : 'bg-stone-100 text-[#626260] border-[#d3cec6]'
                  }`}>
                    {writeProtectState.enabled ? 'Locked (Read-Only Active)' : 'Unlocked (Read-Write)'}
                  </span>
                </div>
                <p className="text-xs text-[#626260] mt-1 max-w-lg leading-relaxed">
                  Configures <code className="font-mono text-[11px] bg-[#f5f1ec] px-1 rounded text-[#111111]">HKLM\SYSTEM\CurrentControlSet\Control\StorageDevicePolicies\WriteProtect</code>.
                  Prevents Windows from touching evidence drives with automount artifacts (<code className="font-mono">$RECYCLE.BIN</code>, <code className="font-mono">System Volume Information</code>, volume dirty bits).
                </p>
              </div>
              <ToggleSwitch 
                checked={writeProtectState.enabled} 
                onChange={handleToggleWriteProtect}
                disabled={loadingWp}
              />
            </div>

            {writeProtectState.message && (
              <div className="p-3 bg-[#faf8f5] border border-[#d3cec6] rounded-lg text-xs font-mono text-[#626260]">
                {writeProtectState.message}
              </div>
            )}
          </div>
        </section>
        
        {/* Core Performance */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-[#111111]" />
            <h2 className="text-sm font-medium text-[#111111]">Core Performance</h2>
          </div>
          <div className="glass-panel rounded-xl overflow-hidden shadow-sm border border-white/80">
            <div className="p-4 flex items-center justify-between border-b border-[#d3cec6]/60">
              <div>
                <p className="text-sm font-medium text-[#111111]">Pipeline I/O Architecture</p>
                <p className="text-xs text-[#626260] mt-0.5">Enable concurrent double-buffered fill/write worker threads (&gt;4 GB/s fill speed).</p>
              </div>
              <ToggleSwitch checked={config.pipeline} onChange={() => toggle('pipeline')} />
            </div>
            <div className="p-4 flex items-center justify-between border-b border-[#d3cec6]/60">
              <div>
                <p className="text-sm font-medium text-[#111111]">xxHash3-128 Fast Verification</p>
                <p className="text-xs text-[#626260] mt-0.5">Use SIMD xxHash3 for 28.5 GB/s streaming verification readback.</p>
              </div>
              <ToggleSwitch checked={config.iouring} onChange={() => toggle('iouring')} />
            </div>
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#111111]">Dynamic Buffer Allocation</p>
                <p className="text-xs text-[#626260] mt-0.5">Auto-scale sector buffers based on target geometry (1MB USB / 4MB SSD / 8MB HDD).</p>
              </div>
              <ToggleSwitch checked={config.autoBuffer} onChange={() => toggle('autoBuffer')} />
            </div>
          </div>
        </section>

        {/* AI & Logic */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Bot className="w-5 h-5 text-[#111111]" />
            <h2 className="text-sm font-medium text-[#111111]">Analysis Modules</h2>
          </div>
          <div className="glass-panel rounded-xl overflow-hidden shadow-sm border border-white/80">
            <div className="p-4 flex items-center justify-between border-b border-[#d3cec6]/60">
              <div>
                <p className="text-sm font-medium text-[#111111]">Byte Frequency Distribution (BFD) Classifier</p>
                <p className="text-xs text-[#626260] mt-0.5">Histogram cosine-similarity classification without magic headers (97.4% accuracy).</p>
              </div>
              <ToggleSwitch checked={config.bfd} onChange={() => toggle('bfd')} />
            </div>
            <div className="p-4 flex items-center justify-between border-b border-[#d3cec6]/60">
              <div>
                <p className="text-sm font-medium text-[#111111]">Bifragment Gap Carving (BGC)</p>
                <p className="text-xs text-[#626260] mt-0.5">Reassemble fragmented clusters using cluster-gap hypothesis analysis.</p>
              </div>
              <ToggleSwitch checked={config.bgc} onChange={() => toggle('bgc')} />
            </div>
            <div className="p-4 border-t border-[#d3cec6]/60 bg-white/40">
              <p className="text-sm font-medium text-[#111111] mb-2">Groq API Key (AI Reconstruction)</p>
              <input 
                type="password" 
                value={config.groqKey}
                onChange={(e) => setConfig({...config, groqKey: e.target.value})}
                className="w-full bg-[#ffffff] border border-[#d3cec6] rounded-lg px-3 py-2 text-sm text-[#111111] font-mono focus:outline-none focus:border-[#111111]"
              />
            </div>
          </div>
        </section>

        {/* Compliance Certifications */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-[#111111]" />
            <h2 className="text-sm font-medium text-[#111111]">Compliance &amp; Legal Admissibility</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-panel glass-card-interactive rounded-xl p-4 shadow-sm flex items-start gap-3 border border-white/80">
              <div className="mt-1 w-2 h-2 rounded-full bg-[#16a34a] shadow-[0_0_8px_rgba(22,163,74,0.5)]"></div>
              <div>
                <p className="text-sm font-medium text-[#111111]">BSA 2023 Section 63</p>
                <p className="text-xs text-[#626260] mt-1">Schedule Part A &amp; Part B court admissibility certificate.</p>
              </div>
            </div>
            <div className="glass-panel glass-card-interactive rounded-xl p-4 shadow-sm flex items-start gap-3 border border-white/80">
              <div className="mt-1 w-2 h-2 rounded-full bg-[#16a34a] shadow-[0_0_8px_rgba(22,163,74,0.5)]"></div>
              <div>
                <p className="text-sm font-medium text-[#111111]">NIST SP 800-88 Rev. 1</p>
                <p className="text-xs text-[#626260] mt-1">Clear &amp; Purge operations with SMART G-List audit.</p>
              </div>
            </div>
            <div className="glass-panel glass-card-interactive rounded-xl p-4 shadow-sm flex items-start gap-3 border border-white/80">
              <div className="mt-1 w-2 h-2 rounded-full bg-[#16a34a] shadow-[0_0_8px_rgba(22,163,74,0.5)]"></div>
              <div>
                <p className="text-sm font-medium text-[#111111]">IEEE 2883-2022</p>
                <p className="text-xs text-[#626260] mt-1">Sanitization of logical &amp; physical flash media storage.</p>
              </div>
            </div>
            <div className="glass-panel glass-card-interactive rounded-xl p-4 shadow-sm flex items-start gap-3 border border-white/80">
              <div className="mt-1 w-2 h-2 rounded-full bg-[#16a34a] shadow-[0_0_8px_rgba(22,163,74,0.5)]"></div>
              <div>
                <p className="text-sm font-medium text-[#111111]">RFC 3161 / ISO 18014-3</p>
                <p className="text-xs text-[#626260] mt-1">Trusted time-stamping &amp; EVM public Merkle root anchor.</p>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
