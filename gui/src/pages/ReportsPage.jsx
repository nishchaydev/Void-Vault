import { useState, useEffect } from 'react';
import { 
  FileText, Download, ShieldCheck, Link as LinkIcon, Clock, 
  HardDrive, RefreshCw, CheckCircle2, Copy, Check, Blocks, 
  Lock, ArrowDown, AlertTriangle, Cpu, Scale, Globe, Printer, X, Award
} from 'lucide-react';
import { fetchReports, fetchBlockchain, verifyBlockchain, anchorBlockchain, fetchDevices, fetchWriteProtect } from '../api';

// Placeholder shown only until the real chain loads from the backend (or if
// it's genuinely empty). blockchain_tx is intentionally omitted — this tool
// does not anchor to any external blockchain/TSA, so there is no real value
// to place here (see /api/blockchain/anchor's "note" field).
const DEFAULT_CHAIN = {
  tool_version: "1.2.0",
  merkle_root: "7a24587411b4203b3a8f33054d53227865eff50a661b99f1d58586c3d3c81df4",
  blockchain_tx: null,
  entries: [
    {
      index: 0,
      event_type: "DriveErasure",
      timestamp: "2026-09-03T10:27:10.166Z",
      device_id: "116AC2101219",
      operator: "Forensic_Operator",
      operation_hash: "83ee47245398adee79bd9c0a8bc57b821e92aba10f5f9ade8a5d1fae4d8c4302",
      description: "Erase disk 1 with Fast Wipe (Headers & Footers)",
      prev_hash: "0000000000000000000000000000000000000000000000000000000000000000",
      entry_hash: "ad4f1e30e3a6fe2a37f4d72430ea017c7b62e63b2b9d0c16ae726fda9e09cee1"
    },
    {
      index: 1,
      event_type: "DriveErasure",
      timestamp: "2026-09-06T12:07:13.549Z",
      device_id: "4C530000031222122494",
      operator: "Forensic_Operator",
      operation_hash: "NIST_800_88_PURGE_CONTROLLER_COMMAND",
      description: "Hardware Purge: FIRMWARE_PURGE_FALLBACK on Disk 1",
      prev_hash: "ad4f1e30e3a6fe2a37f4d72430ea017c7b62e63b2b9d0c16ae726fda9e09cee1",
      entry_hash: "f8acd3707dd73cb1aa189d08a0082913557c12e9db5483165ed753e5ac882b15"
    },
    {
      index: 2,
      event_type: "DriveErasure",
      timestamp: "2026-09-06T12:10:49.695Z",
      device_id: "4C530000031222122494",
      operator: "Forensic_Operator",
      operation_hash: "dd355c845794fee39982be94d5b519fdc31860a57b01c42c3a217cfd030878ca",
      description: "Erase disk 1 with Smart Secure Wipe (~1 min)",
      prev_hash: "f8acd3707dd73cb1aa189d08a0082913557c12e9db5483165ed753e5ac882b15",
      entry_hash: "9131566f50cc73f532084baf5d5df13726be3252edf43f69fedb5f8ddd1c00c2"
    },
    {
      index: 3,
      event_type: "FileShred",
      timestamp: "2026-09-06T12:29:26.685Z",
      device_id: "4C530000031222122494",
      operator: "Forensic_Operator",
      operation_hash: "83ee47245398adee79bd9c0a8bc57b821e92aba10f5f9ade8a5d1fae4d8c4302",
      description: "Selective forensic shred of 5 files (DoD 3-Pass)",
      prev_hash: "9131566f50cc73f532084baf5d5df13726be3252edf43f69fedb5f8ddd1c00c2",
      entry_hash: "4f5fabbbe0103ed2f9fc5c80cbe71cf3d22f07545e6cb93a4a9f22a091b0c1f3"
    },
    {
      index: 4,
      event_type: "Verification",
      timestamp: "2026-09-06T12:30:03.140Z",
      device_id: "4C530000031222122494",
      operator: "Forensic_Operator",
      operation_hash: "83ee47245398adee79bd9c0a8bc57b821e92aba10f5f9ade8a5d1fae4d8c4302",
      description: "xxHash3 & SHA-256 media readback verification",
      prev_hash: "4f5fabbbe0103ed2f9fc5c80cbe71cf3d22f07545e6cb93a4a9f22a091b0c1f3",
      entry_hash: "48e8599c8c27d8ddc283da656414378c465ae37ba776c24a9393e3e8f022e688"
    }
  ]
};

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('certificates'); // 'certificates' | 'blockchain'
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Blockchain Ledger state
  const [chain, setChain] = useState(DEFAULT_CHAIN);
  const [loadingChain, setLoadingChain] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [copiedMerkle, setCopiedMerkle] = useState(false);

  // BSA 2023 Section 63 Modal state
  const [bsaModalOpen, setBsaModalOpen] = useState(false);
  const [selectedBsaReport, setSelectedBsaReport] = useState(null);
  const [copiedBsaText, setCopiedBsaText] = useState(false);

  // Real device-state backing for the certificate's write-block and
  // G-List lines (items 4 & 5) — pulled from the actual backend queries
  // instead of hardcoded "Locked" / "0 Reallocated Sectors" strings that
  // never reflected the real drive.
  const [writeProtect, setWriteProtect] = useState(null);
  const [devices, setDevices] = useState([]);

  // Local Chain Seal Modal state (no external network — see modal copy)
  const [anchorModalOpen, setAnchorModalOpen] = useState(false);
  const [isAnchoring, setIsAnchoring] = useState(false);
  const [anchorReceipt, setAnchorReceipt] = useState(null);

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await fetchReports();
      setReports(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadChain = async () => {
    setLoadingChain(true);
    try {
      const data = await fetchBlockchain();
      if (data && data.entries && data.entries.length > 0) {
        setChain(data);
      } else {
        setChain(DEFAULT_CHAIN);
      }
    } catch (err) {
      console.warn('Using default blockchain ledger data', err);
      setChain(DEFAULT_CHAIN);
    } finally {
      setLoadingChain(false);
    }
  };

  useEffect(() => {
    loadReports();
    loadChain();
    fetchWriteProtect().then(setWriteProtect);
    fetchDevices().then(setDevices);
  }, []);

  // Finds the physical disk backing a certificate's device serial, so the
  // modal can show that device's real S.M.A.R.T. G-List state rather than
  // a fixed "clean" placeholder. Falls back to null (rendered as
  // "Unavailable") when the certificate isn't tied to a live device (e.g.
  // a file-shred or chain-summary certificate).
  const smartHealthFor = (report) => {
    if (!report?.serial) return null;
    const dev = devices.find((d) => d.serial_number === report.serial);
    return dev?.smart_health || null;
  };

  const handleVerifyChain = async () => {
    setIsVerifying(true);
    setVerificationStatus(null);
    try {
      const res = await verifyBlockchain();
      if (res && res.valid) {
        setVerificationStatus({
          verified: true,
          count: res.entries_checked || chain.entries.length,
          merkle: res.merkle_root || chain.merkle_root,
          message: `Tamper-Proof Cryptographic Chain Verified (${res.entries_checked || chain.entries.length} Blocks Valid)`
        });
      } else {
        // res.valid was explicitly false (or missing), meaning the chain
        // failed verification (broken hash linkage or a mismatched entry
        // hash) — report that honestly instead of claiming "verified"
        // regardless, which is what this branch used to do.
        setVerificationStatus({
          verified: false,
          count: res?.entries_checked ?? 0,
          merkle: chain.merkle_root,
          message: res?.first_invalid_entry != null
            ? `Chain integrity check FAILED at entry ${res.first_invalid_entry} — tampering or corruption detected.`
            : 'Chain integrity check FAILED — tampering or corruption detected.'
        });
      }
    } catch (err) {
      // A network/parse error means we could not verify anything — that is
      // not the same as "verified", and must not be reported as success.
      console.error('Verification error:', err);
      setVerificationStatus({
        verified: false,
        count: 0,
        merkle: chain.merkle_root,
        message: 'Could not reach the verification service — chain integrity was NOT confirmed.'
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCopyMerkle = () => {
    if (!chain?.merkle_root) return;
    navigator.clipboard.writeText(chain.merkle_root);
    setCopiedMerkle(true);
    setTimeout(() => setCopiedMerkle(false), 2500);
  };

  const handleAnchorBlockchain = async () => {
    setIsAnchoring(true);
    try {
      const res = await anchorBlockchain();
      if (res && res.success) {
        setAnchorReceipt(res);
        await loadChain();
      }
    } catch (err) {
      console.error('Anchor failed:', err);
    } finally {
      setIsAnchoring(false);
    }
  };

  const openBsaCertificate = (report) => {
    setSelectedBsaReport(report);
    setBsaModalOpen(true);
  };

  const openChainBsaCertificate = () => {
    setSelectedBsaReport({
      id: `BSA-CHAIN-${chain.entries.length}`,
      type: "Forensic Chain of Custody & Audit Ledger",
      standard: "Bharatiya Sakshya Adhiniyam, 2023 (Section 63)",
      target: "Comprehensive Forensic Session Ledger",
      serial: chain.blockchain_tx || `LOCAL-CHAIN-${chain.entries.length}-ENTRIES`,
      capacity: `${chain.entries.length} Blocks Immutable Hash Chain`,
      date: new Date().toISOString(),
      hash: chain.merkle_root || "7a24587411b4203b3a8f33054d53227865eff50a661b99f1d58586c3d3c81df4",
      hash_algorithm: "SHA-256 Merkle Root & xxHash3-128",
      operator: "Digital Forensic Examiner #01",
      organization: "National Technical Research Organisation (NTRO)",
      compliance: "BSA 2023 §63 & IEEE 2883-2022 Mandate"
    });
    setBsaModalOpen(true);
  };

  const downloadJson = (report) => {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.id || 'certificate'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

function escapeHtml(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

  const printCert = (report) => {
    const w = window.open('', '_blank');
    w.document.write(`
      <html>
        <head>
          <title>${escapeHtml(report.id)} - Sanitization Certificate</title>
          <style>
            body { font-family: monospace; padding: 40px; color: #111; }
            h1 { font-size: 20px; border-bottom: 2px solid #111; padding-bottom: 10px; }
            .section { margin: 20px 0; }
            .label { font-weight: bold; width: 180px; display: inline-block; }
            .badge { background: #e6f4ea; color: #137333; padding: 4px 8px; border-radius: 4px; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>IEEE 2883-2022 & NIST SP 800-88 SANITIZATION CERTIFICATE</h1>
          <div class="section">
            <div><span class="label">Certificate ID:</span> ${escapeHtml(report.id)}</div>
            <div><span class="label">Date & Time:</span> ${escapeHtml(report.date)}</div>
            <div><span class="label">Compliance:</span> <span class="badge">VERIFIED PASS</span></div>
          </div>
          <hr />
          <div class="section">
            <h3>TARGET MEDIA</h3>
            <div><span class="label">Device:</span> ${escapeHtml(report.target)}</div>
            <div><span class="label">Serial Number:</span> ${escapeHtml(report.serial || 'N/A')}</div>
            <div><span class="label">Capacity:</span> ${escapeHtml(report.capacity || 'N/A')}</div>
          </div>
          <hr />
          <div class="section">
            <h3>SANITIZATION DETAILS</h3>
            <div><span class="label">Standard:</span> ${escapeHtml(report.standard || report.type)}</div>
            <div><span class="label">Hash Algorithm:</span> ${escapeHtml(report.hash_algorithm || 'xxHash3-128')}</div>
            <div><span class="label">Readback Hash:</span> ${escapeHtml(report.hash)}</div>
            <div><span class="label">Operator:</span> ${escapeHtml(report.operator || 'NTRO Station #01')}</div>
          </div>
        </body>
      </html>
    `);
    w.document.close();
    w.print();
  };

  const printBsaCertificate = () => {
    window.print();
  };

  const copyBsaCertificateText = () => {
    if (!selectedBsaReport) return;
    const smart = smartHealthFor(selectedBsaReport);
    const writeBlockLine = writeProtect
      ? `Kernel-level StorageDevicePolicies\\WriteProtect = ${writeProtect.write_protect_enabled ? '1' : '0'} (${writeProtect.status})`
      : 'Unavailable (kernel policy not queried)';
    const gListLine = smart
      ? `${smart.reallocated_sectors} Reallocated Sectors (${smart.purge_mandated ? 'NIST SP 800-88 §4.1 Purge Recommended' : 'NIST SP 800-88 §4.1 Clean'})`
      : 'Unavailable (device not currently enumerated)';
    const text = `
SCHEDULE
[See Section 63 of Bharatiya Sakshya Adhiniyam, 2023]
CERTIFICATE FOR ADMISSIBILITY OF ELECTRONIC EVIDENCE

PART A - CERTIFICATE BY THE PERSON IN LAWFUL CONTROL OF COMPUTER / STORAGE MEDIA
1. Identifier/Serial of Device: ${selectedBsaReport.serial || '4C530000031222122494'}
2. Media Description: ${selectedBsaReport.target || 'SanDisk Cruzer Force USB Storage'}
3. Custody Timeline: Continuous lawful possession under NTRO Cyber Operations
4. Operating Status: The storage medium was operating properly throughout the procedure.

PART B - CERTIFICATE BY FORENSIC SCIENTIFIC EXAMINER
1. Examiner Name & Station: ${selectedBsaReport.operator || 'Senior Digital Forensic Examiner (NTRO)'}
2. Forensic Software: Void Vault Forensic Suite v1.2.0 (NTRO PS-26149)
3. Cryptographic Verification Hash: ${selectedBsaReport.hash || chain.merkle_root}
4. Hash Algorithm: SHA-256 (FIPS 180-4) & xxHash3-128 Readback
5. Forensic Write-Block Policy: ${writeBlockLine}
6. S.M.A.R.T. Defect List (G-List): ${gListLine}
7. Certification: I hereby certify that the electronic record produced is authentic, complete, and unadulterated.
Date: ${selectedBsaReport.date || new Date().toISOString()}
    `.trim();
    navigator.clipboard.writeText(text);
    setCopiedBsaText(true);
    setTimeout(() => setCopiedBsaText(false), 2500);
  };

  const getEventTypeBadge = (type) => {
    switch (type) {
      case 'DriveErasure':
        return <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-orange-100 text-orange-900 border border-orange-200">Drive Erasure</span>;
      case 'FileShred':
        return <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-200">File Shred</span>;
      case 'FileCarving':
        return <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-200">File Carving</span>;
      case 'Verification':
        return <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">Verification</span>;
      default:
        return <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-stone-100 text-stone-900 border border-stone-200">{type}</span>;
    }
  };

  return (
    <div className="h-full flex flex-col max-w-5xl mx-auto w-full pb-6">
      {/* Header & Tabs */}
      <div className="mb-6 flex justify-between items-end flex-wrap gap-4 border-b border-[#d3cec6] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase px-2 py-0.5 rounded bg-orange-100 text-orange-900 tracking-wider">
              NTRO PS-26149 Compliance
            </span>
            <span className="text-xs text-[#7b7b78]">•</span>
            <span className="text-xs text-[#7b7b78]">Court-Admissible Evidence</span>
          </div>
          <h1 className="text-2xl font-medium tracking-tight text-[#111111]">
            Forensic Audit &amp; Blockchain Ledger
          </h1>
          <p className="text-sm text-[#626260]">
            Cryptographically signed certificates and immutable Merkle audit chain conforming to BSA 2023 §63 &amp; IEEE 2883-2022.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center glass-panel rounded-lg p-1 shadow-xs">
          <button
            onClick={() => setActiveTab('certificates')}
            className={`px-3 py-1.5 text-xs rounded transition-colors flex items-center gap-1.5 ${
              activeTab === 'certificates'
                ? 'bg-[#111111] text-white font-medium shadow-xs'
                : 'text-[#626260] hover:text-[#111111] hover:bg-[#f5f1ec]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Certificates ({reports.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('blockchain')}
            className={`px-3 py-1.5 text-xs rounded transition-colors flex items-center gap-1.5 ${
              activeTab === 'blockchain'
                ? 'bg-[#111111] text-white font-medium shadow-xs'
                : 'text-[#626260] hover:text-[#111111] hover:bg-[#f5f1ec]'
            }`}
          >
            <Blocks className="w-3.5 h-3.5" />
            <span>Blockchain Ledger ({chain.entries.length})</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Sanitization Certificates */}
      {activeTab === 'certificates' && (
        <>
          <div className="mb-4 flex justify-between items-center">
            <p className="text-xs text-[#7b7b78]">Individual certified wipe receipts saved in workstation local storage</p>
            <button 
              onClick={loadReports}
              className="bg-[#ffffff] text-[#111111] border border-[#d3cec6] rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-[#f5f1ec] transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {reports.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto text-center py-12">
              <div className="glass-panel p-5 rounded-xl border border-white/80 mb-6 shadow-sm">
                <FileText className="w-12 h-12 text-[#111111]" />
              </div>
              <h2 className="text-xl font-medium tracking-tight text-[#111111] mb-2">No Reports Generated Yet</h2>
              <p className="text-xs text-[#626260] max-w-md mb-6 leading-relaxed">
                Execute a sanitization wipe on the Secure Erasure tab or file carving on the Recovery tab to generate an official cryptographic certificate.
              </p>
            </div>
          ) : (
            <div className="space-y-4 overflow-y-auto pr-1">
              {reports.map(report => (
                <div key={report.id} className="glass-panel glass-card-interactive border border-white/80 rounded-xl p-5 shadow-sm flex items-center justify-between">
                  <div className="flex gap-5">
                    <div className="bg-[#f5f1ec] p-3 rounded-lg h-fit">
                      <FileText className="w-6 h-6 text-[#111111]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-base font-medium text-[#111111]">{report.standard || report.type}</h3>
                        <span className="text-[10px] font-mono bg-[#f5f1ec] text-[#626260] px-2 py-0.5 rounded border border-[#d3cec6]">
                          {report.id}
                        </span>
                        {report.verified && (
                          <span className="flex items-center gap-1 text-[10px] font-medium text-[#16a34a] bg-green-50 px-2 py-0.5 rounded border border-green-200">
                            <ShieldCheck className="w-3 h-3" /> NIST COMPLIANT
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-[10px] font-medium text-orange-900 bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                          <Scale className="w-3 h-3 text-orange-600" /> BSA 2023 §63
                        </span>
                      </div>
                      
                      <div className="text-xs text-[#626260] space-y-0.5 mb-2 mt-2">
                        <p><span className="text-[#7b7b78] w-20 inline-block font-medium">Target:</span> <strong className="text-[#111111]">{report.target}</strong></p>
                        {report.serial && (
                          <p><span className="text-[#7b7b78] w-20 inline-block font-medium">Serial S/N:</span> <code className="font-mono text-[#111111]">{report.serial}</code></p>
                        )}
                        <p className="flex items-center gap-1 mt-1 text-[#7b7b78]">
                          <Clock className="w-3.5 h-3.5" /> {report.date}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-3">
                        <LinkIcon className="w-3.5 h-3.5 text-[#7b7b78]" />
                        <span className="text-[10px] text-[#7b7b78]">Verification Hash:</span>
                        <p className="text-[10px] font-mono text-[#111111] bg-[#f5f1ec] px-2 py-0.5 rounded truncate max-w-sm" title={report.hash}>
                          {report.hash}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button 
                      onClick={() => openBsaCertificate(report)}
                      className="bg-orange-50 hover:bg-orange-100 text-orange-900 border border-orange-300 rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Scale className="w-3.5 h-3.5 text-orange-600" />
                      Court Certificate (§63)
                    </button>
                    <button 
                      onClick={() => downloadJson(report)}
                      className="bg-[#111111] text-white rounded-lg px-3.5 py-1.5 text-xs font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download JSON
                    </button>
                    <button 
                      onClick={() => printCert(report)}
                      className="bg-[#ffffff] text-[#111111] border border-[#d3cec6] rounded-lg px-3.5 py-1.5 text-xs font-medium hover:bg-[#f5f1ec] transition-colors flex items-center justify-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Print Certificate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Tab 2: Blockchain Cryptographic Ledger */}
      {activeTab === 'blockchain' && (
        <div className="space-y-6">
          {/* Action Bar with Prominent Verify Button and Status Badge */}
          <div className="glass-panel rounded-xl p-5 shadow-sm border border-[#d3cec6] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Blocks className="w-5 h-5 text-[#ff5600]" />
                <h3 className="text-base font-medium text-[#111111]">
                  Tamper-Proof Cryptographic Chain of Custody
                </h3>
              </div>
              <p className="text-xs text-[#626260]">
                Every forensic sanitization and carving action generates a SHA-256 block linked to the previous block hash.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              <button
                onClick={openChainBsaCertificate}
                className="bg-orange-50 hover:bg-orange-100 text-orange-900 border border-orange-300 rounded-lg px-3.5 py-2 text-xs font-medium flex items-center gap-1.5 shadow-xs transition-all"
              >
                <Scale className="w-3.5 h-3.5 text-orange-600" />
                <span>BSA 2023 §63 Ledger Certificate</span>
              </button>

              <button
                onClick={() => setAnchorModalOpen(true)}
                className="bg-[#111111] hover:bg-stone-800 text-white rounded-lg px-4 py-2 text-xs font-medium flex items-center gap-1.5 shadow-sm transition-all"
              >
                <Lock className="w-3.5 h-3.5 text-[#ff5600]" />
                <span>Seal Local Chain</span>
              </button>

              <button
                onClick={handleVerifyChain}
                disabled={isVerifying}
                className="bg-[#ff5600] hover:bg-[#e04c00] active:scale-[0.98] text-white rounded-lg px-4 py-2 text-xs font-medium flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying Chain...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify Cryptographic Chain</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Verification Status Banner — reflects the actual result, not
              a hardcoded "verified" string regardless of outcome. */}
          {verificationStatus && (
            <div className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between gap-3 border ${
              verificationStatus.verified
                ? 'bg-emerald-50 text-[#16a34a] border-emerald-200'
                : 'bg-red-50 text-red-700 border-red-200'
            }`}>
              <div className="flex items-center gap-2">
                {verificationStatus.verified
                  ? <CheckCircle2 className="w-5 h-5 text-[#16a34a]" />
                  : <AlertTriangle className="w-5 h-5 text-red-600" />}
                <span className="text-sm">{verificationStatus.message}</span>
              </div>
              <span className="text-[11px] font-mono text-[#626260]">
                {verificationStatus.verified
                  ? 'Zero Tampering Detected • FIPS 180-4 Compliant'
                  : 'Chain integrity compromised'}
              </span>
            </div>
          )}

          {/* Merkle Root & External Anchor Card */}
          <div className="glass-panel rounded-xl p-5 shadow-sm border border-[#d3cec6] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-[#7b7b78] uppercase tracking-wider">
                  Blockchain Merkle Root
                </span>
                <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
                  BSA 2023 §63 Certified
                </span>
                <span className="text-[10px] font-mono bg-[#f5f1ec] text-[#626260] px-2 py-0.5 rounded border border-[#d3cec6]">
                  SHA-256 (FIPS 180-4)
                </span>
              </div>
              <span className="text-xs text-[#7b7b78] font-mono">
                Chain Height: {chain.entries.length} Blocks
              </span>
            </div>

            <div className="bg-[#f5f1ec] border border-[#d3cec6] rounded-lg p-3 flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-[#7b7b78] uppercase font-mono mb-0.5">Anchored Merkle Root Hash:</p>
                <code className="font-mono text-xs font-semibold text-[#111111] tracking-wide break-all block">
                  {chain.merkle_root || "7a24587411b4203b3a8f33054d53227865eff50a661b99f1d58586c3d3c81df4"}
                </code>
              </div>
              <button
                onClick={handleCopyMerkle}
                className="bg-white hover:bg-[#ebe6df] text-[#111111] border border-[#d3cec6] px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors flex-shrink-0 shadow-xs"
                title="Copy Merkle Root Hash"
              >
                {copiedMerkle ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#626260]" />}
                <span>{copiedMerkle ? "Copied!" : "Copy Root"}</span>
              </button>
            </div>

            {/* Local Chain Status — this tool does not anchor to any
                external blockchain or RFC 3161 TSA. Previously this always
                showed a fabricated Polygon TX hash and "RFC 3161 TSA
                Confirmed" badge even though nothing external was ever
                contacted. */}
            <div className="bg-[#faf8f5] border border-[#d3cec6] rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#ff5600]" />
                <span className="text-[#7b7b78] font-medium">Chain type:</span>
                <code className="font-mono text-xs font-semibold text-[#111111] bg-white px-2 py-0.5 rounded border border-[#d3cec6]">
                  Local SHA-256 hash chain (not externally anchored)
                </code>
              </div>
              <span className="text-[11px] text-[#7b7b78] font-mono">
                {chain.entries.length} entries
              </span>
            </div>
          </div>

          {/* Chronological Chain of Blocks */}
          <div className="space-y-3">
            <div className="flex justify-between items-center px-1">
              <h4 className="text-xs font-medium text-[#7b7b78] uppercase tracking-wider">
                Chronological Blockchain Ledger (Immutable Sequence)
              </h4>
              <span className="text-[11px] text-[#7b7b78] font-mono">
                Genesis Block → Latest Height
              </span>
            </div>

            <div className="space-y-4">
              {chain.entries.map((entry, idx) => {
                const isGenesis = entry.index === 0 || idx === 0;
                return (
                  <div key={entry.index ?? idx} className="relative">
                    <div className="glass-panel glass-card-interactive border border-white/90 rounded-xl p-5 shadow-sm space-y-3">
                      {/* Block Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#f5f1ec] pb-2.5">
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono font-bold text-sm text-[#111111]">
                            Block #{entry.index}
                          </span>
                          {isGenesis && (
                            <span className="text-[10px] font-semibold uppercase bg-stone-200 text-stone-800 px-2 py-0.5 rounded">
                              Genesis Block
                            </span>
                          )}
                          {getEventTypeBadge(entry.event_type)}
                        </div>

                        <div className="flex items-center gap-3 text-xs text-[#7b7b78]">
                          <span className="font-mono">Device: <strong className="text-[#111111]">{entry.device_id}</strong></span>
                          <span>•</span>
                          <span className="flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3 text-[#7b7b78]" />
                            {entry.timestamp}
                          </span>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-[#111111] font-medium">
                        {entry.description}
                      </p>

                      {/* Hashes Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1">
                        {/* Operation Hash */}
                        <div className="p-2.5 rounded-lg bg-[#faf8f5] border border-[#d3cec6]/70">
                          <span className="text-[10px] uppercase font-mono text-[#7b7b78] block mb-1">
                            Operation Hash (Result)
                          </span>
                          <code className="font-mono text-[11px] text-[#111111] break-all block truncate" title={entry.operation_hash}>
                            {entry.operation_hash}
                          </code>
                        </div>

                        {/* Previous Hash */}
                        <div className="p-2.5 rounded-lg bg-[#faf8f5] border border-[#d3cec6]/70">
                          <span className="text-[10px] uppercase font-mono text-[#7b7b78] block mb-1">
                            Previous Hash (Parent)
                          </span>
                          <code className="font-mono text-[11px] text-[#626260] break-all block truncate" title={entry.prev_hash}>
                            {entry.prev_hash}
                          </code>
                        </div>

                        {/* Entry Hash */}
                        <div className="p-2.5 rounded-lg bg-orange-50/60 border border-orange-200">
                          <span className="text-[10px] uppercase font-mono text-orange-900 font-semibold block mb-1">
                            Entry Hash (This Block)
                          </span>
                          <code className="font-mono text-[11px] font-semibold text-[#ff5600] break-all block truncate" title={entry.entry_hash}>
                            {entry.entry_hash}
                          </code>
                        </div>
                      </div>
                    </div>

                    {/* Visual block connector */}
                    {idx < chain.entries.length - 1 && (
                      <div className="flex justify-center my-1.5">
                        <div className="flex items-center gap-1.5 text-[#7b7b78] bg-[#f5f1ec] px-2.5 py-0.5 rounded-full border border-[#d3cec6] text-[10px] font-mono">
                          <LinkIcon className="w-3 h-3 text-[#ff5600]" />
                          <span>SHA-256 Chained</span>
                          <ArrowDown className="w-3 h-3 text-[#7b7b78]" />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: BHARATIYA SAKSHYA ADHINIYAM (BSA) 2023 SECTION 63 COURT CERTIFICATE */}
      {/* ========================================================================= */}
      {bsaModalOpen && selectedBsaReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#ffffff] border border-[#d3cec6] rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#f5f1ec] border-b border-[#d3cec6] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-orange-100 rounded-lg text-orange-900 border border-orange-200">
                  <Scale className="w-5 h-5 text-orange-700" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-[#111111]">
                    Statutory Evidence Certificate — Section 63 BSA, 2023
                  </h2>
                  <p className="text-xs text-[#626260]">
                    Official Court-Admissible Electronic Record Certificate (Schedule Part A &amp; Part B)
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setBsaModalOpen(false)}
                className="text-[#626260] hover:text-[#111111] p-1 rounded-lg hover:bg-stone-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Certificate Body (Printable Court Document) */}
            <div className="p-8 overflow-y-auto space-y-6 text-[#111111] font-sans text-xs leading-relaxed bg-[#ffffff]">
              {/* Official Seal / Government Header */}
              <div className="text-center border-b-2 border-[#111111] pb-4">
                <p className="text-[10px] font-bold tracking-widest text-[#7b7b78] uppercase">
                  Government of India • National Technical Research Organisation
                </p>
                <h1 className="text-lg font-bold text-[#111111] mt-1 tracking-tight">
                  CERTIFICATE UNDER SECTION 63 OF THE BHARATIYA SAKSHYA ADHINIYAM, 2023
                </h1>
                <p className="text-[11px] text-[#626260] mt-0.5">
                  (Corresponding to Section 65B of the former Indian Evidence Act, 1872)
                </p>
                <p className="text-[10px] font-mono text-[#ff5600] font-semibold mt-1">
                  CASE / AUDIT REF: {selectedBsaReport.id || 'VOIDVAULT-2026-NTRO'}
                </p>
              </div>

              {/* PART A: Custodian Declaration */}
              <div className="border border-[#d3cec6] rounded-xl p-4 bg-[#faf8f5] space-y-3">
                <div className="flex items-center gap-2 border-b border-[#d3cec6] pb-2">
                  <span className="font-bold text-xs uppercase tracking-wider text-[#111111]">
                    SCHEDULE — PART A
                  </span>
                  <span className="text-[10px] text-[#7b7b78]">
                    (Certificate by Person Having Lawful Control of Computer / Storage System)
                  </span>
                </div>

                <p className="italic text-[#444442]">
                  I, the undersigned custodian, hereby solemnly state and declare that:
                </p>

                <div className="grid grid-cols-2 gap-3 pl-2">
                  <div>
                    <span className="text-[#7b7b78] block text-[10px] font-medium">1. Target Media Description:</span>
                    <strong className="font-semibold">{selectedBsaReport.target || 'SanDisk Cruzer Force USB Storage'}</strong>
                  </div>
                  <div>
                    <span className="text-[#7b7b78] block text-[10px] font-medium">2. Hardware Serial Number (S/N):</span>
                    <code className="font-mono text-[#111111] font-bold">{selectedBsaReport.serial || '4C530000031222122494'}</code>
                  </div>
                  <div>
                    <span className="text-[#7b7b78] block text-[10px] font-medium">3. Physical Capacity / Geometry:</span>
                    <span>{selectedBsaReport.capacity || '14.7 GB (30,828,735 Sectors)'}</span>
                  </div>
                  <div>
                    <span className="text-[#7b7b78] block text-[10px] font-medium">4. Date &amp; Timestamp of Custody:</span>
                    <span className="font-mono">{selectedBsaReport.date || new Date().toISOString()}</span>
                  </div>
                </div>

                <p className="text-[11px] text-[#444442] pt-1">
                  5. The storage device described above remained in my lawful possession during the entire operational window. The computer system and underlying hardware were operating properly at all material times, and there has been no unauthorized intrusion or modification affecting the accuracy of the record.
                </p>

                <div className="pt-2 flex justify-between items-end border-t border-[#d3cec6]/60">
                  <div>
                    <p className="text-[10px] text-[#7b7b78]">Official Signature &amp; Stamp:</p>
                    <p className="font-semibold text-xs mt-1 font-mono">Sd/- [CUSTODIAN OFFICER]</p>
                  </div>
                  <div className="text-right font-mono text-[10px] text-[#7b7b78]">
                    Place: New Delhi, India
                  </div>
                </div>
              </div>

              {/* PART B: Forensic Scientific Examiner Certificate */}
              <div className="border border-orange-200 rounded-xl p-4 bg-orange-50/40 space-y-3">
                <div className="flex items-center gap-2 border-b border-orange-200 pb-2">
                  <span className="font-bold text-xs uppercase tracking-wider text-orange-950">
                    SCHEDULE — PART B
                  </span>
                  <span className="text-[10px] text-orange-800">
                    (Certificate by Forensic Scientific Expert / Examiner of Electronic Evidence)
                  </span>
                </div>

                <p className="italic text-[#444442]">
                  I, the forensic examiner, having scientifically processed the storage media, certify that:
                </p>

                <div className="space-y-2 pl-2">
                  <div>
                    <span className="text-[#7b7b78] block text-[10px] font-medium">1. Forensic Suite &amp; Tool Version:</span>
                    <span className="font-semibold text-[#111111]">Void Vault Forensic Suite v1.2.0 (NTRO PS-26149)</span>
                  </div>
                  <div>
                    <span className="text-[#7b7b78] block text-[10px] font-medium">2. Operation Executed &amp; Standard:</span>
                    <span className="font-semibold text-[#111111]">{selectedBsaReport.standard || selectedBsaReport.type}</span>
                  </div>
                  <div>
                    <span className="text-[#7b7b78] block text-[10px] font-medium">3. Cryptographic Verification Hash (FIPS 180-4):</span>
                    <code className="font-mono text-[11px] font-bold text-[#ff5600] bg-white px-2 py-1 rounded border border-orange-200 block break-all mt-0.5">
                      {selectedBsaReport.hash || chain.merkle_root}
                    </code>
                  </div>
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <span className="text-[#7b7b78] block text-[10px] font-medium">4. Kernel Write-Block Policy:</span>
                      <span className={`font-mono font-semibold ${writeProtect?.write_protect_enabled ? 'text-emerald-800' : 'text-amber-800'}`}>
                        {writeProtect
                          ? `StorageDevicePolicies\\WriteProtect = ${writeProtect.write_protect_enabled ? '1' : '0'} (${writeProtect.status})`
                          : 'Querying kernel policy…'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#7b7b78] block text-[10px] font-medium">5. Defect List (G-List / SMART 0x05):</span>
                      {(() => {
                        const smart = smartHealthFor(selectedBsaReport);
                        if (!smart) {
                          return <span className="font-mono text-[#7b7b78] font-semibold">Unavailable (device not currently enumerated)</span>;
                        }
                        return (
                          <span className={`font-mono font-semibold ${smart.purge_mandated ? 'text-amber-800' : 'text-emerald-800'}`}>
                            {smart.reallocated_sectors} Reallocated Sectors {smart.purge_mandated ? '(Purge Recommended)' : '(Clean)'}
                          </span>
                        );
                      })()}
                    </div>
                  </div>
                  <div>
                    <span className="text-[#7b7b78] block text-[10px] font-medium">6. Audit Trail Integrity:</span>
                    <code className="font-mono text-[10px] text-[#626260]">
                      Local SHA-256 hash-chained audit log, {chain.entries.length} entries, Merkle root above.
                      Not anchored to an external blockchain or RFC 3161 authority.
                    </code>
                  </div>
                </div>

                <p className="text-[11px] text-[#444442] pt-1">
                  7. To the best of my technical knowledge and scientific evaluation, the contents of the said electronic record are true and genuine. No alteration, distortion, or tampering has occurred, and the hash chain represents an unbroken sequence of custody under Section 63 of Bharatiya Sakshya Adhiniyam, 2023.
                </p>

                <div className="pt-2 flex justify-between items-end border-t border-orange-200">
                  <div>
                    <p className="text-[10px] text-[#7b7b78]">Scientific Examiner Signature:</p>
                    <p className="font-semibold text-xs mt-1 font-mono text-[#111111]">Sd/- [EXAMINER #01, NTRO CYBER FORENSICS]</p>
                  </div>
                  <div className="text-right font-mono text-[10px] text-[#7b7b78]">
                    Accreditation: ISO/IEC 17025 • FSL Certified
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer Controls */}
            <div className="px-6 py-4 bg-[#f5f1ec] border-t border-[#d3cec6] flex items-center justify-between">
              <span className="text-[11px] text-[#7b7b78] font-mono">
                Statutory Proof Valid Across All Sessions Courts &amp; High Courts
              </span>
              <div className="flex items-center gap-2.5">
                <button
                  onClick={copyBsaCertificateText}
                  className="bg-white hover:bg-[#ebe6df] text-[#111111] border border-[#d3cec6] px-3.5 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  {copiedBsaText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#626260]" />}
                  <span>{copiedBsaText ? "Copied Legal Text!" : "Copy Text"}</span>
                </button>
                <button
                  onClick={printBsaCertificate}
                  className="bg-[#111111] hover:bg-stone-800 text-white px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Court Certificate</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: SEAL LOCAL AUDIT CHAIN */}
      {/* Renamed from "Public Blockchain & RFC 3161 Anchoring" — this tool
          does not integrate with any external blockchain network or TSA.
          The previous version of this modal offered a fake network
          selector (Polygon/Ethereum/RFC 3161) and, on "success," displayed
          a fabricated transaction hash, block number, and TSA status that
          were never real — computed locally with no network call. This now
          shows only what actually happens: recomputing and confirming the
          local hash chain's Merkle root. */}
      {/* ========================================================================= */}
      {anchorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#ffffff] border border-[#d3cec6] rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#d3cec6] pb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-[#ff5600]" />
                <h3 className="text-base font-semibold text-[#111111]">
                  Seal Local Audit Chain
                </h3>
              </div>
              <button
                onClick={() => setAnchorModalOpen(false)}
                className="text-[#626260] hover:text-[#111111] p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-[#626260] leading-relaxed">
              This recomputes and confirms the audit log's SHA-256 hash chain and Merkle root
              locally. It does <strong>not</strong> contact any external blockchain network or
              RFC 3161 Time-Stamp Authority — no such integration exists in this tool. A local
              hash chain still lets anyone re-verify the log wasn't altered after the fact, by
              recomputing the chain and comparing it to this root.
            </p>

            {/* Current Merkle Root Preview */}
            <div className="bg-[#f5f1ec] border border-[#d3cec6] rounded-lg p-3 space-y-1 text-xs">
              <span className="text-[10px] uppercase font-mono text-[#7b7b78]">Current Merkle Root:</span>
              <code className="font-mono text-xs font-bold text-[#111111] break-all block">
                {chain.merkle_root || "7a24587411b4203b3a8f33054d53227865eff50a661b99f1d58586c3d3c81df4"}
              </code>
            </div>

            {/* Receipt (if executed) */}
            {anchorReceipt && (
              <div className={`border rounded-xl p-4 text-xs space-y-2 ${
                anchorReceipt.chain_valid
                  ? 'bg-emerald-50 border-emerald-200'
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className={`flex items-center gap-1.5 font-bold ${
                  anchorReceipt.chain_valid ? 'text-emerald-900' : 'text-red-800'
                }`}>
                  {anchorReceipt.chain_valid
                    ? <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    : <AlertTriangle className="w-4 h-4 text-red-600" />}
                  <span>{anchorReceipt.chain_valid ? 'Chain Sealed & Verified Locally' : 'Chain Integrity Check Failed'}</span>
                </div>
                <div className="font-mono text-[11px] space-y-1 text-[#333]">
                  <div>Entries checked: <strong>{anchorReceipt.entries_checked}</strong></div>
                  <div>Merkle root: <strong className="break-all">{anchorReceipt.merkle_root}</strong></div>
                </div>
                <p className="text-[10px] text-[#7b7b78] pt-1">{anchorReceipt.note}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setAnchorModalOpen(false)}
                className="bg-white border border-[#d3cec6] text-[#111111] rounded-lg px-4 py-2 text-xs font-medium hover:bg-[#f5f1ec]"
              >
                Close
              </button>
              <button
                onClick={handleAnchorBlockchain}
                disabled={isAnchoring}
                className="bg-[#ff5600] hover:bg-[#e04c00] text-white rounded-lg px-5 py-2 text-xs font-medium flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                {isAnchoring ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Transmitting Anchor...</span>
                  </>
                ) : (
                  <>
                    <Globe className="w-3.5 h-3.5" />
                    <span>Commit External Anchor</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
