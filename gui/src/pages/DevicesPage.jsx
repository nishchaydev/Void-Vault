import { HardDrive, Usb, RefreshCw, Shield, Key, AlertTriangle } from 'lucide-react';
import { useDevices } from '../context/DeviceContext';

function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export default function DevicesPage() {
  const { devices, loading: isScanning, refreshDevices } = useDevices();

  if (devices.length === 0 && !isScanning) {
    return (
      <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto">
        <div className="glass-panel p-5 rounded-xl border border-white/80 mb-6 shadow-sm">
          <Usb className="w-12 h-12 text-[#111111]" />
        </div>
        <h2 className="text-2xl font-medium tracking-tight text-[#111111] mb-2">No Target Devices Detected</h2>
        <p className="text-sm text-[#626260] text-center mb-8 leading-relaxed">
          Please connect your USB drive, external disk, or flash media. The forensic daemon will discover and mount it automatically.
        </p>
        <button 
          onClick={refreshDevices}
          disabled={isScanning}
          className="bg-[#111111] text-white rounded-lg px-6 py-2.5 text-sm font-medium hover:scale-[0.98] transition-transform flex items-center gap-2 disabled:opacity-50 shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
          {isScanning ? 'Probing Hardware Busses...' : 'Scan for Devices'}
        </button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-medium tracking-tight text-[#111111] mb-1">Hardware & Media Devices</h1>
          <p className="text-sm text-[#626260]">Physical storage media detected via WMI / IOCTL kernel subsystems.</p>
        </div>
        <button 
          onClick={refreshDevices}
          disabled={isScanning}
          className="glass-panel text-[#111111] rounded-lg px-4 py-2 text-sm font-medium hover:bg-white transition-colors flex items-center gap-2 shadow-xs disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
          {isScanning ? 'Scanning...' : 'Rescan Hardware'}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {devices.map(dev => {
          const isUsb = dev.device_type?.toLowerCase().includes('usb') || dev.interface_type === 'USB';
          const isProtected = dev.is_boot_disk || dev.safety_status === 'Protected';

          return (
            <div key={dev.device_id || dev.index} className="glass-panel glass-card-interactive rounded-xl overflow-hidden shadow-sm flex flex-col border border-white/80">
              <div className="p-5 border-b border-[#d3cec6] flex justify-between items-start">
                <div className="flex gap-4">
                  <div className="bg-[#f5f1ec] p-3 rounded-lg h-fit">
                    {isUsb ? <Usb className="w-6 h-6 text-[#111111]" /> : <HardDrive className="w-6 h-6 text-[#111111]" />}
                  </div>
                  <div>
                    <h3 className="text-base font-medium text-[#111111]">{dev.model || `PhysicalDrive ${dev.index}`}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-[#f5f1ec] text-[#626260] px-2 py-0.5 rounded font-medium">{dev.device_type || dev.interface_type}</span>
                      <span className="text-xs text-[#7b7b78] font-mono">{formatBytes(dev.capacity)}</span>
                    </div>
                    <p className="text-[11px] text-[#7b7b78] font-mono mt-2">ID: {dev.device_id}</p>
                    {dev.serial_number && (
                      <p className="text-[10px] text-[#7b7b78] font-mono">S/N: {dev.serial_number}</p>
                    )}
                    {dev.smart_health && (
                      <div className="mt-2.5 pt-2 border-t border-[#d3cec6]/60 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${dev.smart_health.purge_mandated ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                          <span className="text-[11px] font-medium text-[#111111]">
                            SMART 0x05 (G-List): {dev.smart_health.reallocated_sectors} Bad Sectors
                          </span>
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                          dev.smart_health.purge_mandated 
                            ? 'bg-amber-50 text-amber-900 border-amber-200'
                            : 'bg-emerald-50 text-emerald-900 border-emerald-200'
                        }`}>
                          {dev.smart_health.purge_mandated ? 'Purge Mandated' : 'NIST Clear Approved'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                {isProtected ? (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200">
                    <Shield className="w-3.5 h-3.5 text-amber-600" />
                    <span className="text-[10px] font-medium uppercase tracking-wider">System Protected</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <Key className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-[10px] font-medium uppercase tracking-wider">Target Ready</span>
                  </div>
                )}
              </div>
              
              <div className="bg-[#f5f1ec] p-4 flex-1">
                <p className="text-xs font-medium text-[#111111] mb-2 uppercase tracking-wider">Partitions & Logical Volumes</p>
                {dev.partitions && dev.partitions.length > 0 ? (
                  <div className="space-y-1.5">
                    {dev.partitions.map((p, i) => {
                      const vols = p.volumes && p.volumes.length > 0 ? p.volumes : null;
                      return (
                        <div key={i} className="bg-[#ffffff] border border-[#d3cec6] rounded px-3 py-2 text-xs text-[#626260] flex justify-between items-center">
                          <div>
                            <span className="font-medium text-[#111111]">
                              {vols ? vols.map(v => v.drive_letter || v.label).join(', ') : `Partition ${p.index}`}
                            </span>
                            {vols && vols[0]?.filesystem && (
                              <span className="ml-2 text-[10px] bg-[#f5f1ec] px-1.5 py-0.5 rounded text-[#7b7b78]">
                                {vols[0].filesystem}
                              </span>
                            )}
                          </div>
                          <span className="font-mono text-[10px] text-[#7b7b78]">{formatBytes(p.size)}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-[#7b7b78] italic">Raw unpartitioned media</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
