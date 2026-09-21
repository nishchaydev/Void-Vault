---
title: "System Architecture"
version: "0.1.0"
date: "2026-09-21"
build_of_record: "pending"
status: "Draft"
ps_clauses: ["ps-ui", "ps-reporting"]
evidence: ["diagrams/src/context.mmd", "diagrams/src/containers.mmd"]
---

# Architecture Overview

Void Vault is engineered as a zero-trust, highly isolated forensic utility. The design strictly prioritizes data security, operator safety, and audit integrity, operating completely independently of external network infrastructure. 

## System Context
The high-level operational context places the Void Vault application directly between the Operator and the Physical Storage Device. It is deployed as an offline, air-gapped application. There is zero external network egress, ensuring that highly sensitive operations (sanitization and carving) never transmit telemetry or data outside the local machine. This isolation is actively verified and enforced by Windows Job Object socket restrictions at runtime.

## Container Diagram
The platform is composed of securely isolated boundaries that communicate via tightly controlled IPC mechanisms:
- **Tauri Shell:** Provides the primary graphical interface, leveraging a Rust backend and a WebView frontend (React). 
- **Core Engine (Rust Library):** The heavily optimized, computationally intensive core managing device I/O, cryptography, and complex forensic logic.
- **Localhost REST API:** Facilitates structured communication between the Tauri GUI and the Core Engine.
- **CLI Binary:** An alternative execution medium for headless operations and automation.
- **Audit Ledger:** An append-only cryptographic log stored locally, anchoring the tamper-evident chain.

## Pipeline Topologies

### Module 1: Secure Drive Eraser Pipeline
1. **Drive Selection:** Operator securely enumerates and selects the target physical block device.
2. **Detection & Baseline:** The system identifies Host Protected Areas (HPA) and Device Configuration Overlays (DCO), and extracts a SMART baseline.
3. **Standard Selection:** Operator selects one of 17 supported sanitization protocols.
4. **Direct I/O Execution:** The system bypasses OS caching to execute multi-pass write operations directly on the hardware.
5. **Verification:** Executes a full logical readback or stratified statistical sampling to confirm the write patterns.
6. **Hash & Ledger Entry:** The operation concludes with cryptographic hashing and a committed entry into the audit ledger.

### Module 2: Secure File & Folder Eraser Pipeline
1. **File Selection:** Target files or directories are selected.
2. **NTFS Metadata Scan:** The engine extracts logical mapping and MFT records.
3. **ADS Enumeration:** Identifies Alternate Data Streams.
4. **Slack Space Mapping:** Maps out logical slack space using $DATA attributes.
5. **Multi-Pass Overwrite:** Securely overwrites the physical file extents on disk.
6. **MFT Cleanup:** Wipes residual metadata and standard information from the Master File Table.
7. **Verification & Ledger Entry:** Confirms the operation and commits the audit log.

### Module 3: Advanced File Carving Pipeline
1. **Disk Image / Raw Device Input:** The engine mounts the logical volume or physical device.
2. **Sector Scanning:** Rapid, raw unbuffered sequential sector reading.
3. **Header/Footer Signature Matching:** Traditional magic-byte boundary analysis.
4. **Fragment Classification:** BGC (Bi-gram Cosine Similarity) and BFD (Byte-Frequency Distribution) models evaluate headless fragments.
5. **Structural Validation:** Validation of known file-type structures (e.g., zip headers, PDF trailers).
6. **Confidence Scoring:** Outputs a deterministic confidence value for reassembled data.
7. **Reassembly & Report:** Compiles the recovered data and generates a detailed analytical report.

## Closed-Loop Verification Sequence
The unifying architecture of Void Vault is its closed-loop workflow:
1. **Erase:** M1 or M2 sanitizes the target space.
2. **Carve Back:** M3 immediately analyzes the purportedly clean space.
3. **Compare & Score:** Artifacts are evaluated; success dictates that no recoverable data detected at the logical layer.
4. **Certify:** A BSA s.63(4) Schedule-format certificate is generated as forensic proof.
5. **Ledger Seal:** The entire event, along with the certificate hash, is sealed into the audit ledger.

## Trust Boundaries & Security Enclaves
The architecture employs strict privilege separation:
- **Unprivileged Parsers:** The file carver (M3) and the UI operate without administrative privileges to isolate potentially malicious recovered payloads.
- **Privileged Device I/O:** The eraser (M1/M2) requires elevated capabilities to perform Direct I/O and interact with NVMe/ATA controllers.
- **IPC isolation:** The local REST API binds strictly to `127.0.0.1` on an ephemeral port.

## Ledger Cryptographic Flow
1. **Operation Completed:** An event occurs.
2. **JSON Entry:** A canonical JSON object is formed.
3. **Hash Chaining:** Computed as `SHA-256(Current_Entry || Previous_Hash)`.
4. **Merkle Tree:** Session entries act as leaves in a binary tree.
5. **Session Root:** The root hash is finalized upon session close.
6. **Optional Anchor:** The root can optionally be extracted to an external system.

## Air-Gapped Deployment
The entire platform is distributed as a single, statically linked binary. It is designed to be USB-deliverable, requires no traditional installation, and has no runtime dependencies (like external database servers or language runtimes). 

*(Note: Reference the Mermaid diagrams located in `diagrams/src/` for exact visual representations of these architectural boundaries.)*

---
Independent SIH 2026 submission. Standards are referenced for alignment; no endorsement by NTRO, NIST, IEEE, CERT-In or STQC is implied.
