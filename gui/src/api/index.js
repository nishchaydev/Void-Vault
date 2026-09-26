// PS-26149 Forensic API Client
const API_BASE = 'http://127.0.0.1:5001';

export async function fetchDevices() {
  try {
    const res = await fetch(`${API_BASE}/api/devices`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn('Backend query error:', err);
    return [];
  }
}

export async function fetchCfttReport() {
  try {
    const res = await fetch(`${API_BASE}/api/cftt`);
    if (!res.ok) throw new Error('Failed to query CFTT');
    return await res.json();
  } catch (err) {
    console.warn('CFTT query error:', err);
    return null;
  }
}

export async function fetchStatus() {
  try {
    const res = await fetch(`${API_BASE}/api/status`);
    if (!res.ok) throw new Error('Failed to query status');
    return await res.json();
  } catch (err) {
    return { status: 'offline' };
  }
}

export async function executeCarve(devicePath, mode = 'deep') {
  try {
    const res = await fetch(`${API_BASE}/api/carve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        device_path: devicePath || "\\\\.\\D:",
        mode: mode
      })
    });
    if (!res.ok) throw new Error('Carve failed');
    return await res.json();
  } catch (err) {
    console.error('Operation failed:', err);
    throw err;
  }
}

export async function executeWipe(devicePath, methodId = 'nist_clear', scope = 'quick') {
  try {
    const res = await fetch(`${API_BASE}/api/wipe?method=${encodeURIComponent(methodId)}&scope=${encodeURIComponent(scope)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        device_path: devicePath || "\\\\.\\PHYSICALDRIVE1",
        method_id: methodId,
        scope: scope
      })
    });
    if (!res.ok) throw new Error('Wipe failed');
    return await res.json();
  } catch (err) {
    console.error('Operation failed:', err);
    throw err;
  }
}

export async function openRecoveredFolder() {
  try {
    const res = await fetch(`${API_BASE}/api/open_folder`, { method: 'POST' });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Failed to open folder:', err);
  }
  return { opened: false, path: 'recovered_files' };
}

export async function fetchCarveManifest() {
  try {
    const res = await fetch(`${API_BASE}/api/carve/manifest`);
    if (!res.ok) throw new Error('Failed to fetch manifest');
    return await res.json();
  } catch (err) {
    console.warn('Manifest fetch error:', err);
    return null;
  }
}

export async function formatDrive(filesystem = 'exfat', label = 'CLEAN_USB') {
  try {
    const res = await fetch(`${API_BASE}/api/format?filesystem=${encodeURIComponent(filesystem)}&label=${encodeURIComponent(label)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filesystem, label })
    });
    return await res.json();
  } catch (err) {
    console.error('Format drive error:', err);
    return { success: false, message: err.message };
  }
}

export async function openDriveFolder() {
  try {
    const res = await fetch(`${API_BASE}/api/open_folder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target: 'drive' })
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Failed to open drive:', err);
  }
  return { opened: false };
}

export async function fetchReports() {
  try {
    const res = await fetch(`${API_BASE}/api/reports`);
    if (!res.ok) throw new Error('Failed to query reports');
    return await res.json();
  } catch (err) {
    console.warn('Reports query error:', err);
    return [];
  }
}

export async function createReport(reportData) {
  try {
    const res = await fetch(`${API_BASE}/api/reports/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reportData)
    });
    return await res.json();
  } catch (err) {
    console.error('Failed to create report:', err);
    return null;
  }
}

export function getDownloadUrl(relPath) {
  return `${API_BASE}/api/download?file=${encodeURIComponent(relPath)}`;
}

export async function seedTestEvidence() {
  try {
    const res = await fetch(`${API_BASE}/api/seed_test_evidence`, { method: 'POST' });
    return await res.json();
  } catch (err) {
    console.warn('Failed to seed evidence:', err);
    return null;
  }
}

export async function fetchTelemetry() {
  try {
    const res = await fetch(`${API_BASE}/api/job/telemetry`);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function fetchDirectoryContents(path = 'D:\\') {
  try {
    const res = await fetch(`${API_BASE}/api/fs/list?path=${encodeURIComponent(path)}`);
    if (!res.ok) throw new Error('Failed to list directory contents');
    return await res.json();
  } catch (err) {
    console.warn('Directory list error:', err);
    return { current_path: path, entries: [] };
  }
}

export async function seedDemoFiles(folder = 'D:\\') {
  try {
    const res = await fetch(`${API_BASE}/api/seed_demo_files?folder=${encodeURIComponent(folder)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folder })
    });
    if (!res.ok) throw new Error('Failed to seed demo files');
    return await res.json();
  } catch (err) {
    console.error('Seed demo files error:', err);
    return { success: false, seeded_files: [] };
  }
}

export async function executeShred({ paths, method = 'dod_3', wipeSlack = true, wipeAds = true, obfuscateMft = true }) {
  try {
    const res = await fetch(`${API_BASE}/api/shred`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        paths,
        method,
        wipe_slack: wipeSlack,
        wipe_ads: wipeAds,
        obfuscate_mft: obfuscateMft
      })
    });
    if (!res.ok) throw new Error('File shred failed');
    return await res.json();
  } catch (err) {
    console.error('Operation failed:', err);
    throw err;
  }
}

export async function wipeFreeSpace(volume = 'D', method = 'dod_3') {
  try {
    const res = await fetch(`${API_BASE}/api/shred/free_space`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ volume, method })
    });
    if (!res.ok) throw new Error('Free space wipe failed');
    return await res.json();
  } catch (err) {
    console.error('Free space wipe error:', err);
    return {
      success: false,
      volume,
      method,
      message: err.message
    };
  }
}

export async function fetchBlockchain() {
  try {
    const res = await fetch(`${API_BASE}/api/blockchain`);
    if (!res.ok) throw new Error('Failed to query blockchain');
    return await res.json();
  } catch (err) {
    console.warn('Blockchain query error:', err);
    return null;
  }
}

export async function verifyBlockchain() {
  try {
    const res = await fetch(`${API_BASE}/api/blockchain/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error('Blockchain verification failed');
    return await res.json();
  } catch (err) {
    console.error('Blockchain verification error:', err);
    return { verified: false, message: err.message };
  }
}

export async function fetchHpaDco(devicePath) {
  try {
    const query = devicePath ? `?device_path=${encodeURIComponent(devicePath)}` : '';
    const res = await fetch(`${API_BASE}/api/forensic/hpa_dco${query}`);
    if (!res.ok) throw new Error('Failed to query HPA/DCO');
    return await res.json();
  } catch (err) {
    console.warn('HPA/DCO query error:', err);
    return null;
  }
}

export async function fetchSsdGuard(deviceType = 'usb', method = 'dod_3') {
  try {
    const res = await fetch(`${API_BASE}/api/safety/ssd_guard?device_type=${encodeURIComponent(deviceType)}&method=${encodeURIComponent(method)}`);
    if (!res.ok) throw new Error('Failed to query SSD guard');
    return await res.json();
  } catch (err) {
    console.warn('SSD guard query error:', err);
    return null;
  }
}

export async function fetchMftEntries() {
  try {
    const res = await fetch(`${API_BASE}/api/recovery/mft`);
    if (!res.ok) throw new Error('Failed to query MFT entries');
    return await res.json();
  } catch (err) {
    console.warn('MFT entries query error:', err);
    return [];
  }
}

export async function fetchWriteProtect() {
  try {
    const res = await fetch(`${API_BASE}/api/forensic/write_protect`);
    if (!res.ok) throw new Error('Failed to query write protect policy');
    return await res.json();
  } catch (err) {
    console.warn('Write protect query error:', err);
    return { write_protect_enabled: false, status: 'Unlocked (Read-Write)' };
  }
}

export async function setWriteProtect(enabled = true) {
  try {
    const res = await fetch(`${API_BASE}/api/forensic/write_protect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled })
    });
    if (!res.ok) throw new Error('Failed to set write protect policy');
    return await res.json();
  } catch (err) {
    console.error('Write protect set error:', err);
    return { success: false, write_protect_enabled: false, message: err.message };
  }
}

export async function anchorBlockchain(network = 'polygon') {
  try {
    const res = await fetch(`${API_BASE}/api/blockchain/anchor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ network })
    });
    if (!res.ok) throw new Error('Failed to anchor blockchain');
    return await res.json();
  } catch (err) {
    console.error('Blockchain anchor error:', err);
    return { success: false, message: err.message };
  }
}
export async function fetchAdminStatus() {
  try {
    const res = await fetch(`${API_BASE}/api/admin/status`);
    if (!res.ok) return { is_admin: true };
    return await res.json();
  } catch (err) {
    return { is_admin: true };
  }
}

export async function requestElevation() {
  try {
    const res = await fetch(`${API_BASE}/api/admin/elevate`, { method: 'POST' });
    return await res.json();
  } catch (err) {
    return { success: false, message: err.message };
  }
}

