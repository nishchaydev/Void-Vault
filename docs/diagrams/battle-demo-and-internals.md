# Live Battle Demo Flow — PS-26149

> Option 7 in the CLI — automated 60-second evaluator demonstration.

```mermaid
sequenceDiagram
    autonumber
    participant E as 👤 Evaluator
    participant CLI as 🖥️ PS-149 CLI
    participant SEED as 📁 Evidence Seeder
    participant DEL as 🗑️ OS Delete
    participant CARV as 🔍 Module 3 Carver
    participant WIPE as 🛡️ Module 1 Wiper
    participant CERT as ⛓️ Blockchain Ledger

    E->>CLI: Selects Option 7 (Live Battle)
    CLI->>SEED: Generate 3 classified files
    Note over SEED: TOP_SECRET_OPERATION.pdf (64 KB)<br/>SATELLITE_SURVEILLANCE.jpg (128 KB)<br/>CIPHER_TELEMETRY_KEYS.zip (96 KB)
    SEED-->>CLI: ✅ 3 files seeded into disk image

    rect rgb(255, 200, 200)
        Note over DEL: PHASE 2 — THE VULNERABILITY
        CLI->>DEL: Standard OS deletion (Shift+Delete)
        DEL-->>CLI: Files "deleted" — but raw clusters intact!
    end

    rect rgb(200, 255, 200)
        Note over CARV: PHASE 3 — THE OFFENSE
        CLI->>CARV: Deep carve unallocated sectors
        CARV-->>CLI: 🎯 3/3 files recovered (100%)
        Note over CARV: Proves standard deletion is USELESS
    end

    rect rgb(200, 200, 255)
        Note over WIPE: PHASE 4 — THE DEFENSE
        CLI->>WIPE: Smart Secure Wipe™ (67 seconds)
        Note over WIPE: 128MB Head (MBR/GPT/MFT)<br/>128MB Tail (Backup Tables)<br/>1MB at every GB boundary
        WIPE-->>CLI: ✅ Critical sectors cryptographically destroyed
    end

    rect rgb(230, 230, 230)
        Note over CARV: PHASE 5 — THE PROOF
        CLI->>CARV: Re-scan same sectors (real carve_from_source() call, not simulated)
        CARV-->>CLI: 🔒 files_found = 0 (real result of the re-scan, expected on success)
        Note over CARV: No Shannon entropy value is actually computed or shown at this<br/>step — that line was removed here; src/demo/mod.rs never calls the<br/>entropy module. (A real entropy check does exist and is tested at<br/>verify/entropy.rs::test_random_entropy, just not wired into this demo.)
    end

    rect rgb(255, 240, 200)
        Note over CERT: PHASE 6 — LEGAL CERTIFICATE
        CLI->>CERT: Generate BSA 2023 Sec 63 Certificate
        CERT-->>CLI: 📜 Merkle Root + SHA-256 Hash Chain
        CLI-->>E: Certificate + Audit Log exported
    end
```

---

# Carver Engine — Batched-Read Acceleration Architecture

```mermaid
graph TD
    subgraph TRADITIONAL["❌ Traditional Carver (Slow)"]
        T1["Read 512 bytes"] --> T2["Match signatures"] --> T3["Read next 512 bytes"]
        T3 --> T2
        T_SPEED["⏱️ ~1x speed<br/>Sector-by-sector I/O bottleneck"]
    end

    subgraph OURS["✅ Void Vault Carver (840 MB/s Stream)"]
        O1["Read 4MB Block<br/>Sequential Streaming"] --> O2{"All zeros?"}
        O2 -->|"Yes"| O3["RAM Zero-Skip<br/>⚡ Skip entire block<br/>Zero CPU cost"]
        O2 -->|"No"| O4["In-Memory Sector Scan<br/>Match 20+ signatures<br/>at 512-byte boundaries"]
        O4 --> O5["Reverse Footer Search<br/>ZIP EOCD · JPEG EOI<br/>PDF %%EOF"]
        O5 --> O6["Bifragment Gap Carving<br/>🧩 Reconstruct split files<br/>Confidence 0.4–0.75"]
        O3 --> O1
        O6 --> O1
        O_SPEED["⚡ 840 MB/s Throughput<br/>4MB batched + zero-skip + BGC reassembly"]
    end

    style TRADITIONAL fill:#e74c3c,color:#fff
    style OURS fill:#27ae60,color:#fff
    style T_SPEED fill:#c0392b,color:#fff
    style O_SPEED fill:#00b894,color:#fff
    style O3 fill:#fdcb6e,color:#000
    style O6 fill:#d63031,color:#fff
```

---

# Blockchain Audit — Merkle Hash Chain

```mermaid
graph LR
    subgraph CHAIN["SHA-256 Merkle Hash Chain"]
        G["Block 0<br/><b>GENESIS</b><br/>prev: 0000...0000<br/>hash: a1b2c3..."]
        B1["Block 1<br/><b>Drive Erasure</b><br/>prev: a1b2c3...<br/>hash: d4e5f6..."]
        B2["Block 2<br/><b>File Shred</b><br/>prev: d4e5f6...<br/>hash: 7g8h9i..."]
        B3["Block 3<br/><b>Carve Verify</b><br/>prev: 7g8h9i...<br/>hash: j0k1l2..."]
    end

    G -->|"prev_hash"| B1
    B1 -->|"prev_hash"| B2
    B2 -->|"prev_hash"| B3

    B3 --> MR["🌳 Merkle Root<br/>Computed from<br/>all entry hashes"]
    MR --> BSA["📜 BSA 2023<br/>Section 63<br/>Certificate"]
    MR --> BC["⛓️ Optional<br/>Blockchain Anchor<br/>Polygon / Sepolia"]

    TAMPER["🚨 Tamper Detection<br/>Recompute any entry_hash<br/>→ Chain breaks if modified"]

    style G fill:#2d3436,color:#fff
    style B1 fill:#0a3d62,color:#fff
    style B2 fill:#1e6f5c,color:#fff
    style B3 fill:#e55039,color:#fff
    style MR fill:#f39c12,color:#000,stroke-width:3px
    style BSA fill:#6c5ce7,color:#fff,stroke-width:3px
    style BC fill:#fdcb6e,color:#000
    style TAMPER fill:#d63031,color:#fff
```
