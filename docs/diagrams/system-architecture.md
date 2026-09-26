# System Architecture — PS-26149

This document outlines the high-level and detailed architecture of the Void Vault platform, reflecting low-level kernel optimizations (`io_uring`, double-buffering) and forensic techniques (BFD histograms, NVMe Sanitize) from our research.

---

## 1. High-Level Architecture Overview

```mermaid
flowchart LR
    A["Storage Media<br/>(HDD / SSD / NVMe / USB)"] -->|"Raw Direct I/O"| B("Rust Core Engine")
    
    subgraph Processing ["Processing Pipeline"]
        B -->|"Async I/O Pipeline"| C{"Dual Subsystems"}
        C -->|"Sanitize"| D["17 Wiping Standards<br/>NVMe / ATA Erase"]
        C -->|"Carve"| E["BFD Classifier<br/>Bifragment Gap Recovery"]
    end
    
    Processing --> F["Tauri GUI / CLI Cockpit"]
    Processing --> G["Tamper-Evident<br/>Merkle Audit Ledger"]
    
    style A fill:#1a1a2e,color:#fff,stroke:#00cec9,stroke-width:2px
    style C fill:#0a3d62,color:#fff,stroke:#3c6382,stroke-width:2px
    style Processing fill:#0f172a,color:#fff,stroke:#334155,stroke-width:1px
```

---

## 2. Detailed System Architecture

```mermaid
flowchart TD
    subgraph UILayer ["User Interface Tier"]
        Tauri["Tauri Desktop GUI (React 19)"]
        CLI["High-Throughput Rust CLI"]
    end

    subgraph ControllerLayer ["Controller & Dispatcher Tier"]
        CoreRouter["Command Router & Safety Validation"]
        Tauri --> CoreRouter
        CLI --> CoreRouter
    end

    subgraph RustEngine ["Rust Core Processing Engine"]
        subgraph WorkerPool ["Parallel Worker Pool (Rayon Work-Stealing)"]
            direction TB
            W1("Worker Thread 1")
            W2("Worker Thread 2")
            W3("Worker Thread N")
        end
        
        subgraph FastIO ["Kernel Direct I/O Tier"]
            io_uring["Linux io_uring / Direct I/O<br/>Double-Buffered Pipeline"]
            WinAPI["Win32 Direct I/O<br/>FILE_FLAG_NO_BUFFERING"]
        end

        CoreRouter --> WorkerPool
        WorkerPool <--> FastIO
    end

    subgraph DomainEngines ["Domain Forensic Subsystems"]
        Erasure["Module 1: Drive Eraser<br/>(17 Standards, NVMe ASIC, OPAL)"]
        Recovery["Module 3: Deep Recovery Carver<br/>(BGC Engine, Structure Validation)"]
        BFD["Statistical BFD Fragment Classifier<br/>(256-Bin Histogram + Cosine Similarity)"]
        
        FastIO <--> Erasure
        FastIO <--> Recovery
        Recovery <--> BFD
    end

    subgraph HardwareLayer ["Physical Storage Media Tier"]
        SSD["NVMe / SATA Solid State Drive<br/>(TRIM & Hardware Sanitize)"]
        HDD["Magnetic Hard Disk Drive<br/>(HPA / DCO Firmware Detection)"]
        USB["UASP USB Drives & Flash Media<br/>(Smart Secure Wipe ~67s)"]
        
        Erasure <--> SSD
        Erasure <--> HDD
        Recovery <--> USB
    end
    
    style UILayer fill:#1a1a2e,color:#fff,stroke:#16213e
    style ControllerLayer fill:#16213e,color:#fff,stroke:#0f3460
    style RustEngine fill:#0a3d62,color:#fff,stroke:#3c6382
    style DomainEngines fill:#1e6f5c,color:#fff,stroke:#289672
    style HardwareLayer fill:#2d3436,color:#fff,stroke:#636e72
```

---

## 3. Component Interactions & Data Flow

1. **User Request Dispatch:** Operator initiates an operation via the Tauri desktop UI or CLI. The command passes through `CoreRouter` which verifies device state and enforces the **Host Boot Drive Safety Lock**.
2. **Asynchronous Parallel Processing:** Destructive write passes or parallel read sweeps are dispatched across the **Rayon work-stealing threadpool** with **24MB double-buffered Crossbeam channels**.
3. **Hardware-Direct I/O:** Commands interface directly with physical storage via unbuffered Win32 system APIs (`FILE_FLAG_NO_BUFFERING` and `FILE_FLAG_WRITE_THROUGH`) or Linux `io_uring`, completely bypassing the operating system file cache.
4. **Closed-Loop Verification:** Following sanitization, the engine triggers Module 3 to scan the wiped space. A **BSA 2023 Section 63 certificate** is generated and committed to the append-only SHA-256 Merkle audit chain.
