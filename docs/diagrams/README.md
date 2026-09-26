# 📐 System Architecture & Forensic Pipeline Diagrams — PS-26149

This directory contains the complete set of native **Mermaid UML diagrams** for **PS-26149 (National Technical Research Organisation — NTRO)**. All diagrams render directly on GitHub and can be exported for SIH presentation slide decks.

---

## 📑 Diagram Catalog

| Diagram File | Category | Description | Primary Slide Placement |
| :--- | :--- | :--- | :---: |
| **[system-architecture.md](./system-architecture.md)** | System Design | Layered architecture showing all 3 core modules, kernel I/O, verification, blockchain, and AI layers | **Slide 3 (Technical Approach)** |
| **[closed-loop-flow.md](./closed-loop-flow.md)** | Core Concept | The closed-loop verification cycle (Erase $\to$ Carve $\to$ Certify) contrasted with traditional tools | **Slide 2 (Proposed Solution)** |
| **[shredder-pipeline.md](./shredder-pipeline.md)** | Anti-Forensics | 4-Phase forensic file shredding pipeline (ADS $\to$ Overwrite $\to$ Slack $\to$ MFT) | **Slide 3 (Technical Approach)** |
| **[battle-demo-and-internals.md](./battle-demo-and-internals.md)** | Live Demo & Algorithms | Sequence diagram of the 60s Live Battle Demo, batched-read Carver acceleration pipeline, and Merkle Hash Chain | **Slides 3, 4, 6** |

---

## 1. System Architecture Overview

```mermaid
graph TB
    subgraph UI["🖥️ INTERACTIVE CLI SHELL"]
        MAIN["main.rs — 24/7 Menu Loop<br/>Real-Time Progress Bars & Device Table"]
    end

    subgraph DISC["🔍 DEVICE DISCOVERY & SAFETY"]
        WMI["WMI Queries<br/>Win32_DiskDrive"]
        IOCTL_D["IOCTL_DISK_GET_DRIVE_GEOMETRY"]
        HOTPLUG["Real-Time USB<br/>Hotplug Watcher"]
        CLASSIFY["Device Classifier<br/>11 Device Types"]
        SAFETY["Safety Guard<br/>OS Drive Protection"]
    end

    subgraph M1["🛡️ MODULE 1 — SECURE DRIVE ERASER"]
        direction TB
        RAWIO["Raw Sector Direct I/O<br/>CreateFileW · \\\\.\\PhysicalDriveX"]
        PASS["17 Multi-Pass Algorithms<br/>NIST · DoD · Gutmann · VSITR"]
        SMART["⚡ Smart Secure Wipe™<br/>128MB Head + 128MB Tail + 1MB/GB<br/>67 sec vs 60 min"]
        TRIM["NVMe Hardware TRIM Purge<br/>IOCTL_STORAGE_MANAGE_DATA_SET_ATTRIBUTES<br/>DEVICE_DSM_ACTION_TRIM"]
        FORMAT["Auto Re-Format<br/>FAT32 · exFAT · NTFS"]
    end

    subgraph M2["🗑️ MODULE 2 — FILE & FOLDER SHREDDER"]
        direction TB
        ADS["Phase 1: ADS Purge<br/>FindFirstStreamW / FindNextStreamW"]
        OVERWRITE["Phase 2: Cluster Overwrite<br/>FILE_FLAG_WRITE_THROUGH"]
        SLACK["Phase 3: Slack Space Cleaning<br/>EOF → Cluster Boundary"]
        MFT["Phase 4: MFT Scramble<br/>5-Pass Rename Chain + Zero Timestamps"]
        FREESPACE["Free Space Envelope<br/>Balloon File Allocation"]
    end

    subgraph M3["🔎 MODULE 3 — DEEP FILE CARVER"]
        direction TB
        BATCH["4MB Batched Block Reader<br/>Sequential Streaming Pipeline"]
        ZERO["RAM Zero-Skip<br/>Skip 0x00 Sectors in Memory"]
        SIGS["Signature Database<br/>20+ Formats · Magic Bytes"]
        FOOTER["Reverse Linear Footer Search<br/>ZIP EOCD · JPEG EOI · PDF %%EOF"]
        BIFRAG["🧩 Bifragment Gap Carving<br/>2-Fragment Reconstruction<br/>Confidence Score 0.4–0.75"]
    end

    subgraph VERIFY["✅ VERIFICATION ENGINE"]
        ENTROPY["Shannon Entropy Analysis<br/>0.0 → 8.0 bits/byte"]
        HASH["SHA-256 Full Disk Hash"]
        CHI["Chi-Square Uniformity Test"]
        SAMPLE["Stratified Random Sampling"]
    end

    subgraph CHAIN["⛓️ BLOCKCHAIN AUDIT TRAIL"]
        MERKLE["SHA-256 Merkle Hash Chain<br/>prev_hash Linked Entries"]
        TAMPER["Runtime Tamper Detection<br/>Recompute & Verify"]
        BSA["📜 BSA 2023 Section 63<br/>Electronic Evidence Certificate"]
        ANCHOR["Optional Blockchain Anchoring<br/>Polygon / Sepolia Testnet"]
    end

    subgraph AI["🤖 AI FORENSIC COPILOT"]
        GROQ["Groq LLaMA 3.3 70B"]
        ADVISOR["Pre-Erasure Risk Advisor"]
        NARRATOR["Post-Erasure Forensic Narrative"]
        FALLBACK["Offline Deterministic Fallback<br/>Air-Gapped / SCIF Ready"]
    end

    MAIN --> DISC
    WMI --> CLASSIFY
    IOCTL_D --> CLASSIFY
    HOTPLUG --> CLASSIFY
    CLASSIFY --> SAFETY

    SAFETY --> M1
    SAFETY --> M2
    SAFETY --> M3

    RAWIO --> PASS
    PASS --> SMART
    PASS --> TRIM
    SMART --> FORMAT
    TRIM --> FORMAT

    ADS --> OVERWRITE
    OVERWRITE --> SLACK
    SLACK --> MFT
    MFT --> FREESPACE

    BATCH --> ZERO
    ZERO --> SIGS
    SIGS --> FOOTER
    FOOTER --> BIFRAG

    M1 --> VERIFY
    M2 --> VERIFY
    M3 --> VERIFY

    ENTROPY --> CHAIN
    HASH --> CHAIN
    CHI --> CHAIN
    SAMPLE --> CHAIN

    MERKLE --> TAMPER
    TAMPER --> BSA
    BSA --> ANCHOR

    CHAIN --> AI
    GROQ --> ADVISOR
    GROQ --> NARRATOR
    GROQ --> FALLBACK

    style UI fill:#1a1a2e,color:#fff,stroke:#16213e
    style M1 fill:#0a3d62,color:#fff,stroke:#3c6382
    style M2 fill:#1e6f5c,color:#fff,stroke:#289672
    style M3 fill:#e55039,color:#fff,stroke:#eb2f06
    style VERIFY fill:#3c40c6,color:#fff,stroke:#575fcf
    style CHAIN fill:#f39c12,color:#000,stroke:#e67e22
    style AI fill:#6c5ce7,color:#fff,stroke:#a29bfe
    style DISC fill:#2d3436,color:#fff,stroke:#636e72
    style SMART fill:#00b894,color:#fff,stroke:#00cec9
    style TRIM fill:#fdcb6e,color:#000,stroke:#ffeaa7
    style BIFRAG fill:#d63031,color:#fff,stroke:#ff7675
```

---

## 2. The Closed-Loop Verification Principle

```mermaid
graph LR
    subgraph LOOP["🔄 CLOSED-LOOP VERIFICATION ENGINE"]
        direction LR
        ERASE["🛡️ ERASE<br/><b>The Defense</b><br/>──────────────<br/>17 Global Standards<br/>Smart Secure Wipe™<br/>NVMe Hardware TRIM<br/>4-Phase File Shredder"]
        CARVE["🔍 CARVE<br/><b>The Offense</b><br/>──────────────<br/>20+ File Signatures<br/>Bifragment Gap Recovery<br/>4MB Batched Streaming<br/>RAM Zero-Skip"]
        CERTIFY["⛓️ CERTIFY<br/><b>The Proof</b><br/>──────────────<br/>SHA-256 Merkle Chain<br/>Shannon Entropy 7.99+<br/>BSA 2023 Section 63<br/>Tamper Detection"]
    end

    ERASE -->|"Sanitized Media"| CARVE
    CARVE -->|"0 Files = Verified"| CERTIFY
    CERTIFY -->|"Certificate Issued<br/>Ready for Next Operation"| ERASE

    style ERASE fill:#0a3d62,color:#fff,stroke:#3c6382,stroke-width:3px
    style CARVE fill:#c0392b,color:#fff,stroke:#e74c3c,stroke-width:3px
    style CERTIFY fill:#f39c12,color:#000,stroke:#e67e22,stroke-width:3px
    style LOOP fill:#1a1a2e,color:#fff,stroke:#16213e,stroke-width:2px
```

---

## 3. How to Use in Presentations

1. **GitHub Native Render:** Viewing these markdown files directly on GitHub renders the diagrams automatically in high resolution.
2. **Export to PNG/SVG:** You can paste the code into [mermaid.live](https://mermaid.live) to download high-resolution PNG or SVG assets for your official SIH presentation slides.
