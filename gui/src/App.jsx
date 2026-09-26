import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ShieldAlert, RefreshCw } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import ErasurePage from './pages/ErasurePage';
import ShredderPage from './pages/ShredderPage';
import RecoveryPage from './pages/RecoveryPage';
import DevicesPage from './pages/DevicesPage';
import CompliancePage from './pages/CompliancePage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import { fetchAdminStatus, requestElevation } from './api';
import { DeviceProvider } from './context/DeviceContext';

function App() {
  const [isAdmin, setIsAdmin] = useState(true);
  const [elevating, setElevating] = useState(false);

  useEffect(() => {
    async function checkAdmin() {
      const res = await fetchAdminStatus();
      if (res && res.is_admin === false) {
        setIsAdmin(false);
      }
    }
    checkAdmin();
  }, []);

  const handleElevate = async () => {
    setElevating(true);
    try {
      await requestElevation();
    } catch (err) {
      console.warn("Elevation request error:", err);
    } finally {
      setElevating(false);
    }
  };

  return (
    <DeviceProvider>
      <div className="flex flex-col h-screen bg-[#f5f1ec] text-[#111111] font-sans">
        {!isAdmin && (
          <div className="bg-amber-600 text-white px-5 py-2.5 text-xs flex items-center justify-between font-medium shadow-sm z-50">
            <div className="flex items-center gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-200 flex-shrink-0" />
              <span>
                <strong>Administrator Permissions Required:</strong> Void Vault is running with standard user privileges. Low-level drive enumeration, write-blocking, and disk sanitization require elevated rights.
              </span>
            </div>
            <button
              onClick={handleElevate}
              disabled={elevating}
              className="bg-white text-amber-950 font-semibold px-3 py-1 rounded text-xs hover:bg-amber-100 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer flex-shrink-0 shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${elevating ? 'animate-spin' : ''}`} />
              {elevating ? 'Prompting UAC...' : 'Restart as Administrator'}
            </button>
          </div>
        )}
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-auto p-8">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/erasure" element={<ErasurePage />} />
              <Route path="/shredder" element={<ShredderPage />} />
              <Route path="/recovery" element={<RecoveryPage />} />
              <Route path="/devices" element={<DevicesPage />} />
              <Route path="/compliance" element={<CompliancePage />} />
              <Route path="/reports" element={<ReportsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </DeviceProvider>
  );
}

export default App;

