---
experiment_id: "E06"
title: "System Performance & Resource Consumption Profile"
version: "1.0.0"
date: "2026-09-21"
status: "Draft"
author: "Team eMitra"
category: "Performance"
safety_classification: "Host / VM Analysis"
---

# E06 Protocol — System Performance & Resource Consumption Profile

## 1. Claim & Hypothesis
- **Claim:** Void Vault executes multi-threaded carving and Direct I/O overwriting with bounded resident memory ($\le 250$ MB RSS) and near line-rate sequential disk throughput.
- **Components:**
  - Agent-executable: Memory RSS and CPU profiling during 1 GB, 10 GB, and 50 GB disk image carving passes.
  - Human-executable: Physical hardware device throughput comparison against raw baseline (`fio`).

## 2. Procedure (Agent: Carving / Memory)
1. Mount synthetic raw disk images (1 GB, 10 GB, 50 GB) containing planted corpus.
2. Execute Void Vault Module 3 carver under Process Monitor / Python memory profiler.
3. Sample working set memory, handle count, and thread pool allocation every 500 ms.
4. Execute 3 repeat runs; compute mean $\pm$ standard deviation.
5. Record metrics: peak RSS (MB), mean throughput (MB/s), duration (s).

## 3. Human Runbook (Physical Device Throughput)
1. Execute baseline write throughput measurement using `fio`:
   ```cmd
   fio --name=baseline --ioengine=windowsaio --direct=1 --rw=write --bs=1M --size=10G --filename=\\.\PhysicalDrive1
   ```
2. Execute Void Vault 1-pass zero sanitization on identical physical drive:
   ```cmd
   void-vault.exe sanitize --device \\.\PhysicalDrive1 --standard "Write Zero"
   ```
3. Compare throughput ($T_{\text{VoidVault}} / T_{\text{fio}}$); verify overhead $\le 10\%$.
