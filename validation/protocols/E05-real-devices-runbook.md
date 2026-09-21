---
experiment_id: "E05"
title: "Real Physical Storage Devices Verification Runbook"
version: "1.0.0"
date: "2026-09-21"
status: "Draft"
author: "Team eMitra"
category: "Hardware"
execution_type: "HUMAN-RUN ONLY"
safety_classification: "CRITICAL: Physical Storage Medium Destruction"
---

# E05 Protocol — Real Physical Devices Verification Runbook (HUMAN-RUN ONLY)

> **SAFETY MANDATE:** AI agents are strictly forbidden from executing destructive commands against real physical hardware. This experiment must be conducted exclusively by a human test engineer following this runbook in a controlled hardware testbench.

## 1. Objective
Measure Void Vault's performance and hardware-level controller commands (NVMe Sanitize Crypto Erase, ATA Secure Erase, DSM TRIM assist) against physical drives across interface types:
1. Native NVMe M.2 SSD (PCIe Gen 3 / Gen 4)
2. Native SATA SSD (AHCI mode, unfrozen)
3. Direct SATA HDD (Magnetic 7200 RPM)
4. USB 3.2 Gen 2 NVMe Bridge (Testing controller pass-through / freeze states)
5. Unsupported Legacy USB Flash Drive (Fallback to logical Clear)

## 2. Human Operator Pre-Flight Checklist
- [ ] Hardware testbench isolated from production workstations.
- [ ] Host boot drive physically disconnected or verified non-targetable via hardware write-blocker / BIOS lockout.
- [ ] Device allow-list populated in `configs/device_allowlist.json` with exact serial numbers:
  ```json
  {
    "allowed_devices": [
      {
        "serial": "S5G7NE0N...",
        "model": "Samsung SSD 980 500GB",
        "interface": "NVMe",
        "target_method": "NVMe Sanitize Crypto Erase"
      }
    ]
  }
  ```
- [ ] Target drive backed up (all contents will be destroyed).

## 3. Human Execution Procedure
1. Boot into test environment (Windows 11 Enterprise x64 with Administrator privileges).
2. Connect target device from allow-list.
3. Launch `void-vault.exe` CLI with human-confirmation flag:
   ```cmd
   void-vault.exe sanitize --device \\.\PhysicalDrive1 --standard "NIST-Purge-Crypto" --confirm-serial <EXACT_SERIAL>
   ```
4. Verify software requires manual re-entry of the target device serial number.
5. Record start timestamp, completion timestamp, and raw controller status registers.
6. Perform statistical readback verification pass:
   ```cmd
   void-vault.exe verify --device \\.\PhysicalDrive1 --mode full
   ```
7. Disconnect drive, reconnect to independent forensic analysis station, and run full raw disk entropy analysis.
8. Log results into `results/E05/<run-id>/summary.json`.

## 4. Expected Outcomes & Failure Modes
- **NVMe Native:** Executes within $<10$ seconds; returns Sanitize Success; readback returns random or zero bytes.
- **USB-Bridge:** Bridge chip intercepts command; tool displays warning: `NVMe Sanitize unsupported over USB bridge; falling back to multi-pass overwrite (Clear level)`.
- **Frozen SATA:** Tool displays warning: `Drive security state is FROZEN by BIOS; power-cycle drive or execute overwrite fallback`.
