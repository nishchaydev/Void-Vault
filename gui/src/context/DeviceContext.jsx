import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { fetchDevices } from '../api';
import { Usb } from 'lucide-react';

const DeviceContext = createContext(null);

export function DeviceProvider({ children }) {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hotplugNotice, setHotplugNotice] = useState(null);
  const prevDeviceKeysRef = useRef(new Set());
  const isInitialLoadRef = useRef(true);

  const loadDevices = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const data = await fetchDevices();
      const currentDevices = Array.isArray(data) ? data : [];
      setDevices(currentDevices);

      // Create unique fingerprint keys for each physical device and its volumes
      const currentKeys = new Set(
        currentDevices.map(d => {
          const vols = (d.partitions || [])
            .flatMap(p => p.volumes || [])
            .map(v => v.drive_letter || '')
            .join(',');
          return `${d.device_id}|${d.capacity}|${vols}`;
        })
      );

      // Detect newly connected devices
      if (!isInitialLoadRef.current) {
        for (const dev of currentDevices) {
          const vols = (dev.partitions || [])
            .flatMap(p => p.volumes || [])
            .map(v => v.drive_letter || '')
            .join(',');
          const key = `${dev.device_id}|${dev.capacity}|${vols}`;

          if (!prevDeviceKeysRef.current.has(key)) {
            const firstVol = dev.partitions?.[0]?.volumes?.[0];
            const letter = firstVol?.drive_letter;
            const label = firstVol?.label;
            const modelName = dev.model || 'Removable Storage Media';

            setHotplugNotice({
              id: Date.now(),
              model: modelName,
              letter: letter || null,
              label: label || null,
              capacity: dev.capacity,
              isTarget: !dev.is_boot_disk && dev.safety_status !== 'Protected',
              timestamp: Date.now()
            });
            break;
          }
        }
      } else {
        isInitialLoadRef.current = false;
      }

      prevDeviceKeysRef.current = currentKeys;
    } catch (err) {
      console.warn('Auto-refresh device query failed:', err);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    // Initial hardware scan
    loadDevices(false);

    // Fast polling: check every 1500ms for hotplugged drives
    const interval = setInterval(() => {
      loadDevices(true);
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  // Auto-dismiss the hotplug toast notification after 4.5 seconds
  useEffect(() => {
    if (hotplugNotice) {
      const timer = setTimeout(() => {
        setHotplugNotice(null);
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [hotplugNotice]);

  // Derived collections
  const allVolumes = devices.flatMap(d =>
    (d.partitions || []).flatMap(p =>
      (p.volumes || []).map(v => ({
        ...v,
        parentDiskId: d.device_id,
        parentDiskModel: d.model,
        isBoot: v.drive_letter?.toUpperCase() === 'C:' || p.is_boot || d.is_boot_disk
      }))
    )
  );

  const targetDisks = devices.filter(d => !d.is_boot_disk && d.safety_status !== 'Protected');
  const systemDisks = devices.filter(d => d.is_boot_disk || d.safety_status === 'Protected');
  const targetVolumes = allVolumes.filter(v => !v.isBoot);

  return (
    <DeviceContext.Provider
      value={{
        devices,
        loading,
        targetDisks,
        systemDisks,
        allVolumes,
        targetVolumes,
        hotplugNotice,
        refreshDevices: () => loadDevices(false)
      }}
    >
      {children}

      {/* Floating Hotplug Toast Alert */}
      {hotplugNotice && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#111111] text-white px-4 py-3 rounded-xl shadow-2xl border border-neutral-700 pointer-events-auto transition-all">
          <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg flex-shrink-0">
            <Usb className="w-5 h-5" />
          </div>
          <div className="pr-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">
                Storage Media Connected
              </span>
              <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-700/50 px-1.5 py-0.2 rounded font-mono">
                AUTO-DETECTED
              </span>
            </div>
            <p className="text-xs text-neutral-200 mt-0.5 font-medium">
              {hotplugNotice.model}
              {hotplugNotice.letter ? ` • Volume ${hotplugNotice.letter}` : ''}
              {hotplugNotice.label ? ` "${hotplugNotice.label}"` : ''}
            </p>
          </div>
          <button
            onClick={() => setHotplugNotice(null)}
            className="text-neutral-400 hover:text-white text-xs px-1.5 py-1 rounded cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}
    </DeviceContext.Provider>
  );
}

export function useDevices() {
  const ctx = useContext(DeviceContext);
  if (!ctx) {
    throw new Error('useDevices must be used within a DeviceProvider');
  }
  return ctx;
}
