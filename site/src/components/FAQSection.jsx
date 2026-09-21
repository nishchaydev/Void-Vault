import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ShieldAlert, FileText, CheckCircle2 } from 'lucide-react';
import { GlowingEffect } from './ui/glowing-effect';

const FAQS = [
  {
    q: "Why isn't TRIM considered sanitization?",
    a: "TRIM is an advisory hint to the SSD controller that certain LBAs are no longer in use. The controller may or may not erase the underlying NAND pages, and the timing is unpredictable. Void Vault treats TRIM as an assist that supplements a hardware sanitize command, never as a standalone wipe method. No certificate is issued for TRIM-only operations."
  },
  {
    q: "How does Void Vault handle wear-leveling and over-provisioning on SSDs?",
    a: "Software overwrite patterns address only the logical LBA space and cannot reach pages remapped by the Flash Translation Layer (FTL) or held in over-provisioned reserves. For NVMe drives, Void Vault issues a native Sanitize Crypto Erase command that forces the controller to purge all NAND — including remapped and reserved blocks. For SATA/USB drives, advisory TRIM is issued alongside the overwrite, and the certificate states the achieved level (Clear vs Purge) honestly."
  },
  {
    q: "What about frozen drives and USB bridges that block ATA/NVMe commands?",
    a: "Some USB-to-SATA/NVMe bridge chips intercept or silently drop hardware sanitize commands. Void Vault detects this condition by checking whether the drive's security state is 'frozen' or whether the sanitize command returns an error. When blocked, the tool falls back to software overwrite and labels the certificate as 'Clear' level rather than 'Purge.' The limitation is recorded in the audit ledger."
  },
  {
    q: "How is the host OS disk protected during decommissioning?",
    a: "Void Vault hard-locks the system boot drive using WMI detection plus a visual lockout badge in the UI. Even if an operator selects the boot drive, a mandatory typed confirmation prompt blocks the operation. The tool refuses to proceed unless the operator types the exact target drive identifier. This three-tier safety lock prevents accidental erasure of the forensic workstation."
  },
  {
    q: "Does anything leave the machine? What does AI do?",
    a: "Void Vault operates offline with verified network egress of zero bytes (enforced by Windows Job Object socket restrictions). The optional AI copilot (Groq LLaMA 3.3) is disabled by default in the evaluator build and can be replaced by a local model. AI generates advisory narratives only — never inside hashed evidence, signed certificates, or the audit chain."
  },
  {
    q: "Why no kernel driver? What privileges are required?",
    a: "Void Vault runs entirely in user mode. It accesses physical drives through documented Win32 APIs (CreateFileW on \\\\.\\PhysicalDriveN) and Linux device nodes, requiring only Administrator/root privileges — no custom .sys kernel driver. This eliminates supply-chain risk from kernel-mode code and simplifies deployment."
  },
  {
    q: "Who signs the certificate? How is tampering detected?",
    a: "Void Vault generates an unsigned BSA s.63(4) Schedule-format certificate (Part A for the custodian, Part B for the technical examiner). The human signers apply their own Digital Signature Certificate (DSC) or Aadhaar eSign. Tampering with the audit chain is detected by recomputing the sequential SHA-256 hash chain and verifying the Merkle root. A single altered byte breaks the chain."
  },
  {
    q: "What does verification prove, and what doesn't it?",
    a: "Full readback with hash verification confirms that every logical sector contains the expected pattern. Stratified sampling provides statistical confidence that no recoverable data exists at a given confidence level. Neither method can access remapped flash pages behind the FTL — that requires a hardware-level purge. Void Vault states precisely what layer was verified and at what confidence."
  },
  {
    q: "How are confidence scores computed and calibrated?",
    a: "The file carver assigns a confidence score (0.0–1.0) based on header/footer signature match, structural AST validation, and byte-frequency-distribution cosine similarity against known file-type profiles. Calibration is performed on held-out data from the GovDocs1 corpus; per-decile accuracy is reported with sample sizes. Bins with n < 20 are flagged."
  },
  {
    q: "How is misuse or evidence spoliation prevented?",
    a: "The audit ledger records every operation with timestamps and operator identity. Case binding links each session to a case number. Two-person approval can be configured for destructive operations. A legal-hold flag prevents erasure of drives under active investigation. The tamper-evident hash chain makes it computationally infeasible to alter past entries without detection."
  },
  {
    q: "What OS, filesystem, and media types are supported today vs planned?",
    a: "Today: Windows 10/11, NTFS, FAT32, exFAT; NVMe, SATA, USB mass storage. Planned: Linux (io_uring path implemented, erase write-path held for testing), ext4, bootable USB media, SD cards."
  },
  {
    q: "How does Void Vault compare with Blancco, BitRaser, Autopsy, and PhotoRec?",
    a: "Blancco and BitRaser are erasure-only commercial tools with per-drive licensing and no carving capability. Autopsy and PhotoRec are carving/recovery tools with no sanitization capability. Void Vault combines both functions in a single offline binary with zero licensing lock-in."
  },
  {
    q: "What was tested, and on which hardware?",
    a: "The validation suite is self-run against NIST public CFTT test plans — not NIST-reviewed or NIST-certified. Hardware tested spans NVMe, SATA SSD, legacy HDDs, and USB 3.2 flash storage in our Part C evidence harness."
  },
  {
    q: "How is the supply chain secured?",
    a: "The tool compiles to a single native Rust binary with zero runtime dependencies. cargo-audit and cargo-deny are run against the advisory database. An SBOM in CycloneDX format is generated for each tagged build. The binary self-verifies its own SHA-256 hash at startup."
  },
  {
    q: "What is the path from prototype to an NTRO pilot deployment?",
    a: "The proposed roadmap targets STQC evaluation at 3–9 months, a CERT-In-empanelled security audit at 9–12 months, and a pilot deployment in a forensic science laboratory at 12–18 months. Each gate has defined entry criteria."
  }
];

export function FAQSection() {
  const [openIdx, setOpenIdx] = useState(null);

  const toggle = (idx) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-12 md:py-16 px-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <span className="text-xs font-mono font-semibold tracking-widest text-orange-500 uppercase">
          11 — TECHNICAL SCRUTINY & FAQS
        </span>
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white mt-3 mb-4 tracking-tight">
          Evaluator Technical FAQ
        </h2>
        <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
          15 concise, technically honest answers addressing architecture, safety interlocks, flash controller boundaries, and judicial evidence admissibility.
        </p>
      </div>

      {/* Accordion Questions */}
      <div className="space-y-3">
        {FAQS.map((faq, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div
              key={idx}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isOpen 
                  ? 'border-orange-500/40 bg-[#0e0f12] shadow-xl' 
                  : 'border-white/[0.06] bg-[#090a0c] hover:border-white/10'
              }`}
            >
              <button
                onClick={() => toggle(idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-orange-500 font-bold shrink-0">
                    Q{idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                  </span>
                  <span className={`text-sm sm:text-base font-semibold transition-colors ${
                    isOpen ? 'text-orange-400' : 'text-white'
                  }`}>
                    {faq.q}
                  </span>
                </div>
                <ChevronDown className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
                  isOpen ? 'rotate-180 text-orange-400' : 'text-neutral-500'
                }`} />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-neutral-300 font-light leading-relaxed border-t border-white/[0.04] animate-in fade-in duration-150">
                  <p>{faq.a}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default FAQSection;
