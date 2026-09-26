# Module 1: Physical Drive Sanitizer Engine
## Low-Level Technical Specification & Implementation Guide

---

## 1. Overview & Capabilities
Module 1 (`ps149::sanitize`) is the hardware-level disk sanitization engine of VoidVault. It executes verified, tamper-evident data sanitization across physical storage media (NVMe, SATA SSD, Spinning HDD, USB Flash, SD/eMMC cards) complying with 17 international data erasure standards.

### Supported Sanitization Standards
1. **NIST SP 800-88 Rev 1 Clear:** Single-pass overwrite with zero (`0x00`) or pseudorandom bytes.
2. **NIST SP 800-88 Rev 1 Purge:** Cryptographic Erase, ATA Secure Erase, or NVMe Sanitize.
3. **DoD 5220.22-M (3-Pass):** Pass 1: Fixed byte (`0x00`), Pass 2: Complement (`0xFF`), Pass 3: Random pattern + verification.
4. **DoD 5220.22-M ECE (7-Pass):** Extended 7-pass algorithm with alternating bitwise complements and pseudorandom streams.
5. **BSI IT-Grundschutz (German BSI):** Standard German federal security overwrite patterns.
6. **HMG IS5 (Enhanced):** UK Government standard (Zero, One, Random).
7. **GOST R 50739-95:** Russian Federation security standard.
8. **Gutmann 35-Pass Algorithm:** Legacy MFM/RLL magnetic drive sanitization.
9. **Zero-Fill Fast Pass:** Direct kernel unbuffered zero write.
10. **Pseudorandom One-Pass:** Cryptographically secure PRNG overwrite (ChaCha20 / OS CSPRNG).

---

## 2. Direct I/O Architecture & OS Kernel Bypass

Operating system write caches (Windows system cache, Linux page cache) introduce forensic vulnerabilities: data written to a device handle may reside in volatile RAM without being physically committed to NAND flash cells or magnetic platters.

### Windows Implementation (`Win32 Direct I/O`)
```rust
// Windows CreateFileW flags for unbuffered hardware I/O
let handle = unsafe {
    CreateFileW(
        PCWSTR(path_w.as_ptr()),
        GENERIC_READ.0 | GENERIC_WRITE.0,
        FILE_SHARE_READ | FILE_SHARE_WRITE,
        None,
        OPEN_EXISTING,
        FILE_FLAG_NO_BUFFERING | FILE_FLAG_WRITE_THROUGH,
        None,
    )
}?;
```
*   `FILE_FLAG_NO_BUFFERING`: Bypasses Windows file cache completely. Every write command requires sector-aligned buffers (typically 4096-byte alignment).
*   `FILE_FLAG_WRITE_THROUGH`: Inhibits delayed caching; write operations return only after the hardware device controller confirms physical commit.
*   `FSCTL_LOCK_VOLUME` / `FSCTL_DISMOUNT_VOLUME`: Prevents filesystem drivers or userland applications from holding open file handles or modifying sectors during sanitization.

### Linux Implementation (`O_DIRECT` & `io_uring`)
*   `O_DIRECT`: Bypasses kernel page cache for direct block layer submission.
*   `io_uring`: Asynchronous zero-copy Submission Queue (SQ) and Completion Queue (CQ) rings achieving transfer speeds exceeding 2.8 GB/s on PCIe Gen4 NVMe media.
*   `BLKDISCARD`: Linux kernel ioctl triggering physical flash block deallocation / TRIM.

---

## 3. Hardware-Level Firmware Erase Protocols

When supported by hardware, firmware-level commands erase flash translation layers (FTL), overprovisioned sectors, and reallocated bad blocks that cannot be addressed by logical sector overwrites.

### 3.1 NVMe Sanitize & Format (NVM Express Specification)
*   **Block Erase (NVMe Sanitize):** Low-level electrical reset of all NAND blocks in the NVM subsystem.
*   **Cryptographic Erase (Crypto Scramble):** Changes the internal AES-256 media encryption key (MEK). Within <500 milliseconds, all historical ciphertext becomes mathematically unrecoverable ($2^{256}$ keyspace).

### 3.2 ATA Secure Erase & Enhanced Secure Erase
*   Direct ATA command `SECURITY ERASE UNIT` (`0xF4`) dispatched via `IOCTL_ATA_PASS_THROUGH` (Windows) or `hdparm --user-master u --security-erase` (Linux).
*   Enhanced Secure Erase writes manufacturer-defined test patterns to all user data areas, spare sectors, and retired blocks.

### 3.3 TCG Opal 2.0 PSID Revert
*   For Self-Encrypting Drives (SED), VoidVault uses the Physical Security ID (PSID) 32-character string located on the drive label to invoke `RevertTper`, securely erasing the hardware cryptographic key.

---

## 4. Safety Interlocks & NVMe OS Protection

To ensure absolute safety in production and laboratory environments:
1. **Physical Drive 0 Interlock:** VoidVault strictly blocks sanitization requests targeted at the primary OS drive containing active boot/system volumes (`C:` or `/`).
2. **Read-Only Probe Phase:** Drive geometry, SMART health, serial numbers, and bus interfaces are queried with non-destructive inquiry commands prior to arming the write pipeline.
3. **Double Cryptographic Confirmation:** Execution requires an explicit user verification token.
