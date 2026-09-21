---
title: "Limitations"
version: "0.1.0"
date: "2026-09-21"
build_of_record: "pending"
status: "Draft"
ps_clauses: ["all"]
evidence: []
---

# Limitations

To maintain absolute transparency regarding the platform's current maturity and physical hardware constraints, the following limitations are formally documented:

- **Flash Residual Risk:** Solid State Drives (SSDs) utilize aggressive wear-leveling, over-provisioning, and internal Flash Translation Layer (FTL) remapping. Logical overwrites (Clear) cannot ensure the sanitization of reallocated or unmapped sectors.
- **OS Support:** The current application is heavily optimized for Windows. Native Linux execution is planned but not currently available in the mainline build.
- **Filesystem Support:** Granular File Eraser operations (M2) currently support NTFS, FAT32, and exFAT. Support for ext4 is planned.
- **USB-Bridge Limitations:** Direct storage commands (e.g., NVMe Sanitize or ATA Secure Erase) are frequently dropped or misinterpreted by USB-to-SATA/NVMe bridge controllers, which can prevent Purge-level operations on external drives. Furthermore, many systems freeze ATA drives at boot, requiring power-cycle bypasses.
- **Host-Disk Constraints:** The platform actively enforces a boot-drive safety lock via WMI detection to prevent accidental system suicide. This reliance on WMI may occasionally restrict intentional sanitization in highly customized multi-boot environments.
- **Virtualization Variances:** Virtual disk (VHD/VMDK) testing does not perfectly replicate hardware controller behavior, specifically concerning Direct I/O and unbuffered caching limits.
- **AI Capabilities:** The generative AI copilot is entirely optional, disabled by default, and heavily constrained to advisory actions only. It lacks advanced autonomous context generation.
- **Certificate Signatures:** The generated BSA s.63(4) Schedule-format certificate is fundamentally unsigned by default. It inherently requires the operator's own DSC/eSign workflow for non-repudiation.
- **Blockchain Anchoring:** Integration with the MeitY National Blockchain Framework is Planned, not yet implemented.
- **Validation Authority:** CFTT-style testing metrics presented in development are strictly self-validated and have not been NIST-reviewed or externally audited.
- **Operational Mode:** The system assumes a single-operator mode by default (though two-person approval workflows are configurable in the backend).
- **Delivery Format:** There is currently no live, bootable USB media (e.g., a custom Linux ISO) for bare-metal deployment; it is actively planned.
- **Extended Media Types:** Deep physical interaction with SD cards and embedded eMMC chips is not yet fully implemented.

---
Independent SIH 2026 submission. Standards are referenced for alignment; no endorsement by NTRO, NIST, IEEE, CERT-In or STQC is implied.
