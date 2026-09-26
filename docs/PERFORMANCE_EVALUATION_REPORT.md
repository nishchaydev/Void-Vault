# ⚡ Performance Architecture & Estimation Report — Deliverable #10
## NTRO Problem Statement PS-26149: Integrated Secure Data Erasure & Advanced File Recovery Tool
### National Technical Research Organisation (NTRO) — Theme: Blockchain & Cybersecurity

---

**Document Identifier:** NTRO-PS149-DELIV-10-PERFEVAL
**Version:** 2.0.0 (Corrected — see Methodology Notice)
**Security Classification:** RESTRICTED / OFFICIAL BENCHMARK & SYSTEM EVALUATION
**Target System:** Void Vault (`ps149`) — Multi-Platform Forensic Core (Rust 2021)
**Evaluation Scope:** I/O Pipelines, PRNG Throughput, xxHash3 Acceleration, Parallel Rayon Carving, BFD Classification, Memory Footprint

---

> ## ⚠️ Methodology Notice — Read Before Presenting This Document
>
> **This document does not contain empirical benchmark results for Void Vault.** An earlier
> version of this file presented specific measured-looking figures (e.g. "1,248.5 MB/s",
> "97.4% classification accuracy", a head-to-head throughput table against Blancco/DBAN/
> PhotoRec/Autopsy, and a claim of a "48-hour Valgrind/ASan audit confirming zero memory
> leaks") as verified results. **No benchmark harness, test corpus, or raw output exists
> anywhere in this repository to back those numbers**, and no such audit was ever run —
> those figures were fabricated and have been removed.
>
> What follows instead is an **architectural performance analysis**: what each implemented
> mechanism (double-buffered I/O, xxHash3 verification, Rayon parallel carving, etc.) is
> *expected* to do based on (a) how the algorithm/data structure works, and (b)
> **published third-party benchmarks of the underlying library or technique**, cited where
> used, measured on the *publisher's* hardware — not this project's. None of it should be
> read as "Void Vault does X MB/s." Real numbers require an actual benchmark pass (e.g.
> `criterion` micro-benchmarks plus `hyperfine`-timed end-to-end runs) on the real target
> hardware before this document is presented as measured evidence to a jury or evaluator.
>
> **Submission status:** Architecture documented and code paths verified to exist and be
> wired into the CLI/GUI (see `REMAINING_WORK.md`); empirical benchmarking is an **open
> item**, not yet done.

---

## 1. Executive Summary

The **PS-26149 Forensic Suite ("Void Vault")** was designed around a stated performance goal:
avoid the I/O bottlenecks and memory bloat common in legacy erasure/forensics tooling, using:

- **Double-buffered pipelined I/O** (`src/sanitize/pipeline.rs`) — overlaps pattern generation
  with disk writes across two threads instead of doing them in lock-step.
- **Word-aligned Xoroshiro-128+ PRNG streaming** (`src/sanitize/patterns.rs`) for pattern
  generation, instead of the OS CSPRNG.
- **xxHash3-128 readback verification** (`src/verify/fast_hash.rs`) for the high-speed
  zero-fill/pattern check stage, with SHA-256 reserved for the certificate-grade hash.
- **Rayon worker-pool parallel carving** (`src/carver/parallel.rs`) across CPU cores.
- **256-bin Byte Frequency Distribution (BFD) classification** (`src/carver/bfd.rs`) for
  carving fragments that lack file-signature headers.

Each of these is a real, implemented mechanism (see `REMAINING_WORK.md` for what's verified
wired-in vs. stubbed). The *direction* of the expected improvement for each is well
supported by how the mechanism works and by published benchmarks of the underlying
technique. The *magnitude* — specific MB/s or % numbers for this tool on target hardware —
has not been measured and is intentionally not asserted below as a measured fact.

### 1.1 Expected-Improvement Summary (Qualitative — Not Measured)

| Performance Vector | Legacy / Baseline Approach | Void Vault Mechanism | Expected Direction |
|---|---|---|---|
| Sanitization write throughput | Synchronous generate→write→wait cycle | Double-buffered pipeline (2 threads, `crossbeam_channel`) | Higher — removes the "both idle" stall between generate and flush; magnitude depends on media/bus, not measured here |
| Pattern generation | OS CSPRNG (`BCryptGenRandom`/`/dev/urandom`) | Word-aligned Xoroshiro-128+ | Substantially higher — Xoroshiro-128+ is a well-documented non-cryptographic PRNG designed for raw throughput over CSPRNG-grade unpredictability, which pattern-overwrite passes don't need |
| Readback verification | Full SHA-256 over the whole device | Two-stage: xxHash3-128 bulk check + SHA-256 only for the certificate hash | Substantially higher — xxHash3 is a non-cryptographic hash designed for speed; see §2.3 for a cited public benchmark of the algorithm itself |
| File carving throughput | Single-threaded sequential scan | Rayon work-stealing across cores, 4 MB chunks with a 512-byte boundary overlap | Higher, roughly tracking core count until memory-bandwidth-bound — standard behavior for embarrassingly-parallel chunked scans, not unique to this tool |
| Carving false-positive rate | Magic-byte-only signature matching | Structural validators (JPEG marker walk, PNG chunk/CRC, PDF xref, ZIP EOCD) | Lower — structural validation rejects magic-byte coincidences that don't parse as a real container; exact reduction % needs a labeled test corpus, which doesn't exist in this repo yet |
| Deep-carve memory footprint | Unbounded in-memory reconstruction | Bounded 4 MB recycled buffers + bounded channel queue | Lower and *bounded* regardless of drive size — this is a structural guarantee, not a benchmark result: allocation size doesn't grow with input size by construction |

None of the cells above carry a number, on purpose — see the Methodology Notice.

---

## 2. Mechanism-by-Mechanism Analysis

### 2.1 Synchronous Write vs. Double-Buffered Pipelined I/O

Traditional single-threaded disk wipers execute:

```
[ Gen Pattern ] -> [ Write DMA ] -> [ Wait / Stall ] -> [ Gen Pattern ] -> [ Write DMA ]
CPU Busy            Disk Busy        Both Idle (Waste)   CPU Busy            Disk Busy
```

Void Vault instead runs pattern generation and disk submission on separate threads connected
by a `crossbeam_channel::bounded(2)` handoff in `src/sanitize/pipeline.rs`:

```
Thread 1 (CPU):  [ Fill Buffer 1 ] -> [ Fill Buffer 2 ] -> [ Fill Buffer 1 ] -> [ Fill Buffer 2 ]
                 ═════════════════════ crossbeam channel handoff ═════════════════════════
Thread 2 (Disk): [ Submit Buf 0  ] -> [ Submit Buf 1  ] -> [ Submit Buf 2  ] -> [ Submit Buf 1  ]
```

This removes the stall shown above whenever pattern generation is cheaper than the write
itself (true for Xoroshiro-128+ against any spinning or flash media). Direct I/O flags
(`FILE_FLAG_NO_BUFFERING | FILE_FLAG_WRITE_THROUGH` on Windows; `O_DIRECT`, optionally via
`io_uring`, on Linux) avoid double-buffering through the OS page cache. **How much this
actually saves depends on the specific drive/bus/queue-depth combination and has not been
measured on real hardware for this document.**

### 2.2 PRNG Pattern Generation: Xoroshiro-128+ vs. OS CSPRNG

Multi-pass standards (DoD 5220.22-M, NIST SP 800-88 Purge, Gutmann) call for pseudorandom
overwrite passes. `src/sanitize/patterns.rs` seeds a 128-bit Xoroshiro-128+ state once per
buffer from OS entropy, then streams word-aligned `u64` output via the standard
Xoroshiro-128+ rotate/xor/shift step, avoiding a CSPRNG call per output word. Xoroshiro-128+
is a widely used, well-studied non-cryptographic generator (Blackman & Vigna) chosen
specifically for cases — like pattern-overwrite — that need throughput and statistical
non-repetition, not cryptographic unpredictability. This is a legitimate reason to expect
it to outrun a CSPRNG; no specific MB/s figure for this implementation is asserted here.

### 2.3 Verification Readback: xxHash3-128 vs. SHA-256

`src/verify/fast_hash.rs` implements a two-stage check: xxHash3-128 for the bulk
pattern/zero-fill readback check, with SHA-256 reserved for the smaller certificate hash
(as BSA 2023/NIST SP 800-88 readback verification requires *some* pass over the written
data — it does not require that pass to use a cryptographic hash).

The *algorithm-level* speed case for this split is well documented, not invented for this
report: the xxHash project's own published benchmark (Intel i7-9700K, Ubuntu x64 20.04,
single core) reports XXH3 reaching **31.5 GB/s** with SSE2, and independent write-ups report
scalar (non-vectorized) XXH3 throughput around **8.4 GB/s** on comparable hardware — both
roughly an order of magnitude above typical software SHA-256 throughput on the same class of
CPU. ([xxHash project README, Cyan4973/xxHash](https://github.com/cyan4973/xxhash))
BLAKE3 is a relevant comparison point too, since it's the other commonly-cited
"fast hash" (multi-threaded BLAKE3 vs. single-core SHA-256 comparisons in third-party
write-ups report roughly an order-of-magnitude gap there as well) —
included here only as external context; Void Vault does not currently use BLAKE3.

**These are the publisher's/third parties' numbers on their own reference hardware, not a
measurement of Void Vault.** The relative ordering (xxHash3 ≫ SHA-256 for non-cryptographic
bulk verification) is safe to state qualitatively; a specific "Void Vault does N GB/s of
verification" figure is not, until it's actually measured here.

### 2.4 Rayon Multi-Core Parallel Carving

`src/carver/parallel.rs` divides a raw image into fixed-size chunks (default 4 MB) with a
512-byte overlap window so a file signature straddling a chunk boundary isn't missed, and
distributes chunk evaluation across Rayon's work-stealing thread pool. Chunked,
overlap-windowed parallel scanning is a standard pattern for embarrassingly-parallel byte
scans, and it's reasonable to expect near-linear scaling up to the physical core count before
memory-bandwidth contention sets in — the same shape every CPU-bound multi-core chunk-scan
workload exhibits. No specific core-count-vs-throughput table is given here because none has
been measured against a real multi-terabyte image on the target hardware.

### 2.5 BFD Classification and Structural Validation

`src/carver/bfd.rs` implements a 256-bin Byte Frequency Distribution classifier over 4 KB
sectors (frequency histogram → Shannon entropy → cosine similarity against reference class
vectors) for fragments that carry no file-signature header — a real, tested mechanism (see
its unit tests for the entropy/classification logic on synthetic all-zero and all-byte-value
inputs). What the codebase does **not** currently include is a labeled, multi-thousand-sector
test corpus with ground-truth file-type labels, so a specific classification-accuracy
percentage or a confusion matrix (JPEG vs. PNG vs. PDF vs. …) cannot be honestly reported —
building that corpus and running the classifier against it is the concrete next step to get
a real accuracy number, not something to estimate here.

Similarly, `src/carver/validators.rs` implements real structural checks (JPEG SOI/SOS/EOI
marker walk, PNG chunk/CRC32 validation, PDF `%%EOF`/xref search, ZIP End-of-Central-Directory
search) that reject magic-byte matches which don't parse as a well-formed container of that
type. This is a real false-positive-reduction *mechanism*; the specific reduction percentage
in the earlier version of this document (based on an invented "1,220 naive vs. 640 validated"
artifact count) was fabricated and has been removed rather than replaced with a different
guess.

### 2.6 Bifragment Gap Carving (BGC)

`src/carver/fragment.rs` reassembles a file split into two fragments separated by an
unallocated-cluster gap by searching forward from a header for a plausible footer within a
configurable search window, then checking entropy continuity across the join:

```
+-------------------+-------------------------------+-------------------+
|    FRAGMENT 1     |     ARBITRARY DATA GAP        |    FRAGMENT 2     |
| Header (e.g. SOI) | Intervening cluster remnants  | Footer (e.g. EOI) |
+-------------------+-------------------------------+-------------------+
\__________________/                                 \__________________/
         \                                                    /
          \==================[ REASSEMBLY ]==================/
```

Larger search windows trade more compute for a better chance of finding a valid footer
further away — an expected, mechanical trade-off. Specific recovery-rate percentages (e.g.
"84.8% of JPEGs recovered") require running the reassembler against a labeled fragmented-file
test set, which — like the BFD corpus above — doesn't exist in this repo yet, so none are
asserted here.

### 2.7 Memory Footprint

Void Vault's carving and sanitization paths use fixed-size recycled buffers
(`src/sanitize/pipeline.rs`, `src/carver/parallel.rs`) and bounded channel queues rather than
accumulating carved data in an unbounded in-memory structure. This is a **structural**
property, not a benchmark result: by construction, steady-state allocation for the buffer
pool doesn't scale with the size of the drive/image being processed (a 4 TB scan and a 40 GB
scan use the same buffer pool size). What this document previously claimed — a specific
"31.8 MB idle / 118.5 MB active" measurement plus a "Valgrind and AddressSanitizer audits
confirm zero memory leaks over a 48-hour continuous run" claim — did not happen and has been
removed; no such audit was run against this codebase in this or any prior session.

---

## 3. Feature Comparison vs. Other Tools (Qualitative Only)

The table below is a **feature presence/absence comparison**, not a performance comparison —
the earlier version of this document included specific throughput figures for Blancco Drive
Eraser, DBAN, Microsoft SDelete, PhotoRec, and Autopsy (e.g. "Blancco ~950 MB/s") that were
invented for this report and have been removed; this project has not benchmarked any of
those tools.

| Capability | Void Vault (PS-26149) | Blancco Eraser | DBAN | MS SDelete | PhotoRec | Autopsy/TSK |
|---|---|---|---|---|---|---|
| Architecture | Rust 2021, native | Proprietary | C, Linux 2.6 | C++, Win32 | C | Java/C++ |
| Platform | Windows (primary), Linux backend scaffolded — see `REMAINING_WORK.md` P1 #7 for what's not yet wired | Custom Linux OS | Custom boot USB | Windows only | Win/Linux/Mac | Win/Linux/Mac |
| Sanitization standards | 17 pattern standards + hardware Purge (NVMe Sanitize; ATA Secure Erase/OPAL out of scope — see `REMAINING_WORK.md`) | 20+ (vendor claim) | ~6 | DoD short pass only | N/A (carver) | N/A (carver) |
| Hardware Purge/TRIM | Yes (NVMe Sanitize, TRIM/Deallocate fallback) | Yes (vendor claim) | No | No | N/A | N/A |
| File slack/ADS wipe | Yes | Full-disk only | Full-disk only | Partial | N/A | N/A |
| Deep carving | Yes (signature + structure-based) | No | No | No | Yes | Yes |
| Bifragment gap carving | Yes | No | No | No | No | No |
| BFD-based headerless classification | Yes | No | No | No | No | No |
| Parallel multi-core carving | Yes (Rayon) | Unknown | N/A | N/A | No (single-threaded) | Partial |
| Local tamper-evident audit chain | Yes (SHA-256 hash chain + Merkle root — local only, no external anchoring; see `REMAINING_WORK.md` P0 #1) | Proprietary DB | Text file | None | Text log | SQLite DB |
| BSA 2023 §63 certificate generation | Yes (automated) | No (global cert schemes only) | No | No | No | No |

Rows describing vendor tools reflect publicly known product positioning, not this project's
own testing of those tools.

---

## 4. What a Real Benchmark Pass Would Need

To turn §1–§2 into a document with actual measured numbers:

1. **Micro-benchmarks** (Rust `criterion` crate) for the PRNG, xxHash3, and BFD
   entropy/classification hot loops, isolating CPU-bound cost from I/O.
2. **End-to-end timed runs** (`hyperfine`, or the tool's own timing output) of each
   sanitization method against real USB/SATA/NVMe media of known specs, reported with
   device model, interface, and multiple repetitions (not a single run).
3. **A labeled test corpus** of fragmented and non-contiguous files (JPEG/PNG/PDF/ZIP) with
   ground truth, to produce a real BGC recovery-rate and BFD confusion matrix — none exists
   in this repo today.
4. **Valgrind/ASan runs**, if a memory-safety audit claim is going to be made — actually run,
   with the log kept, not asserted from the design alone.

None of this was possible in the environment this document was last edited in (no Rust
toolchain, no Windows, no physical target media available) — it needs to happen on real
hardware before submission as a "verified" benchmark report.

---

## 5. Conclusion

Void Vault's implemented mechanisms — double-buffered I/O, a fast non-cryptographic PRNG,
two-stage xxHash3/SHA-256 verification, Rayon-parallel carving, and structural
false-positive rejection — are real, wired into the CLI/GUI, and each has a sound
architectural reason to outperform the naive approach it replaces. **What this document
does not do, and should not be presented as doing, is report measured performance numbers
for this tool** — that requires the benchmark pass described in §4, which has not yet been
run.

---
**Submitted By:** SIH 2026 Student Team (Problem Statement ID 26149)
**Project:** Void Vault — Forensic Computing & Erasure Suite
**Problem Statement Ministry / Agency:** National Technical Research Organisation (NTRO)
**Submission Status:** Architecture documented and verified against source; empirical
benchmarking is an open item (see §4) — do not present §1–§3 figures as measured results.
**Last Revised:** 2026-09-09
