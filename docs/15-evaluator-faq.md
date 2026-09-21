---
title: "Evaluator FAQ"
version: "0.1.0"
date: "2026-09-21"
build_of_record: "pending"
status: "Draft"
ps_clauses: ["all"]
evidence: []
---

# Evaluator FAQ

Answers are kept to five lines or fewer. For deeper detail, see the linked documents.

---

**1. Why isn't TRIM considered sanitization?**
TRIM is an advisory hint to the SSD controller that certain LBAs are no longer in use. The controller may or may not erase the underlying NAND pages, and the timing is unpredictable. Void Vault treats TRIM as an assist that supplements a hardware sanitize command, never as a standalone wipe method. No certificate is issued for TRIM-only operations. See [04 — Sanitization Methods](04-sanitization-methods.md).

**2. How does Void Vault handle wear-leveling and over-provisioning on SSDs?**
Software overwrite patterns address only the logical LBA space and cannot reach pages remapped by the Flash Translation Layer (FTL) or held in over-provisioned reserves. For NVMe drives, Void Vault issues a native Sanitize Crypto Erase command that forces the controller to purge all NAND — including remapped and reserved blocks. For SATA/USB drives, advisory TRIM is issued alongside the overwrite, and the certificate states the achieved level (Clear vs Purge) honestly. The residual risk on flash media is disclosed in [14 — Limitations](14-limitations.md).

**3. What about frozen drives and USB bridges that block ATA/NVMe commands?**
Some USB-to-SATA/NVMe bridge chips intercept or silently drop hardware sanitize commands. Void Vault detects this condition by checking whether the drive's security state is "frozen" or whether the sanitize command returns an error. When blocked, the tool falls back to software overwrite and labels the certificate as "Clear" level rather than "Purge." The limitation is recorded in the audit ledger. See [14 — Limitations](14-limitations.md).

**4. How is the host OS disk protected during decommissioning?**
Void Vault hard-locks the system boot drive using WMI detection plus a visual lockout badge in the UI. Even if an operator selects the boot drive, a mandatory typed confirmation prompt blocks the operation. The tool refuses to proceed unless the operator types the exact target drive identifier. This three-tier safety lock prevents accidental erasure of the forensic workstation. See [03 — Technical Specification](03-technical-specification.md).

**5. Does anything leave the machine? What does AI do?**
Void Vault operates offline with verified network egress of zero bytes (enforced by Windows Job Object socket restrictions). The optional AI copilot (Groq LLaMA 3.3) is disabled by default in the evaluator build and can be replaced by a local model. AI generates advisory narratives only — never inside hashed evidence, signed certificates, or the audit chain. See [08 — Security and Threat Model](08-security-and-threat-model.md).

**6. Why no kernel driver? What privileges are required?**
Void Vault runs entirely in user mode. It accesses physical drives through documented Win32 APIs (`CreateFileW` on `\\.\PhysicalDriveN`) and Linux device nodes, requiring only Administrator/root privileges — no custom `.sys` kernel driver. This eliminates supply-chain risk from kernel-mode code and simplifies deployment. See [research/decisions/no-kernel-driver.md](../research/decisions/no-kernel-driver.md).

**7. Who signs the certificate? How is tampering detected?**
Void Vault generates an unsigned BSA s.63(4) Schedule-format certificate (Part A for the custodian, Part B for the technical examiner). The human signers apply their own Digital Signature Certificate (DSC) or Aadhaar eSign. Tampering with the audit chain is detected by recomputing the sequential SHA-256 hash chain and verifying the Merkle root. A single altered byte breaks the chain. See [07 — Audit Ledger](07-audit-ledger.md).

**8. What does verification prove, and what doesn't it?**
Full readback with hash verification confirms that every logical sector contains the expected pattern. Stratified sampling provides statistical confidence that no recoverable data exists at a given confidence level. Neither method can access remapped flash pages behind the FTL — that requires a hardware-level purge. Void Vault states precisely what layer was verified and at what confidence. See [05 — Verification and Assurance](05-verification-and-assurance.md).

**9. How are confidence scores computed and calibrated?**
The file carver assigns a confidence score (0.0–1.0) based on header/footer signature match, structural AST validation, and byte-frequency-distribution cosine similarity against known file-type profiles. Calibration is performed on held-out data from the GovDocs1 corpus; per-decile accuracy is reported with sample sizes. Bins with n < 20 are flagged. See [10 — Performance Evaluation](10-performance-evaluation.md).

**10. How is misuse or evidence spoliation prevented?**
The audit ledger records every operation with timestamps and operator identity. Case binding links each session to a case number. Two-person approval can be configured for destructive operations. A legal-hold flag prevents erasure of drives under active investigation. The tamper-evident hash chain makes it computationally infeasible to alter past entries without detection. See [08 — Security and Threat Model](08-security-and-threat-model.md).

**11. What OS, filesystem, and media types are supported today vs planned?**
Today: Windows 10/11, NTFS, FAT32, exFAT; NVMe, SATA, USB mass storage. Planned: Linux (io_uring path implemented, erase write-path held for testing), ext4, bootable USB media, SD cards. The full matrix is in [03 — Technical Specification](03-technical-specification.md).

**12. How does Void Vault compare with Blancco, BitRaser, Autopsy, and PhotoRec?**
See the sourced comparison in [12 — Competitive Analysis](12-competitive-analysis.md). In summary: Blancco and BitRaser are erasure-only commercial tools with per-drive licensing and no carving capability. Autopsy and PhotoRec are carving/recovery tools with no sanitization capability. Void Vault combines both functions in a single offline binary. Comparative claims are sourced from vendor documentation with retrieval dates; cells without a verified source are marked "not assessed."

**13. What was tested, and on which hardware?**
The validation suite is self-run against NIST public CFTT test plans — not NIST-reviewed or NIST-certified. Hardware tested is listed in [validation/hardware-matrix.csv](../validation/hardware-matrix.csv). Pending team input for the complete device list from the build of record.

**14. How is the supply chain secured?**
The tool compiles to a single native Rust binary with zero runtime dependencies. `cargo-audit` and `cargo-deny` are run against the advisory database. An SBOM in CycloneDX format is generated for each tagged build. The binary self-verifies its own SHA-256 hash at startup. See [08 — Security and Threat Model](08-security-and-threat-model.md).

**15. What is the path from prototype to an NTRO pilot deployment?**
The proposed roadmap targets STQC evaluation at 3–9 months, a CERT-In-empanelled security audit at 9–12 months, and a pilot deployment in a forensic science laboratory at 12–18 months. Each gate has defined entry criteria. See [13 — Feasibility, Impact and Roadmap](13-feasibility-impact-roadmap.md).

---

> Independent SIH 2026 submission. Standards are referenced for alignment; no endorsement by NTRO, NIST, IEEE, CERT-In or STQC is implied.
