---
title: "Audit Ledger"
version: "0.1.0"
date: "2026-09-21"
build_of_record: "pending"
status: "Draft"
ps_clauses: ["ps-reporting"]
evidence: ["samples/evidence-bundle/"]
---

# Audit Ledger

The Audit Ledger forms the cryptographic backbone of Void Vault's operational verification. It replaces traditional plain-text logging with a mathematically verifiable chain of custody, assuring evaluators and technical examiners of the system's operational history.

## Cryptographic Architecture

### Hash Chain
The ledger employs a strictly tamper-evident, signed hash chain. Each sequential operation is mathematically bound to the operation preceding it using the formula:
**$H_i = SHA-256(D_i || H_{i-1})$**
Where $D_i$ represents the canonical JSON serialization of the audit entry $i$.

### Merkle Tree and Session Roots
In addition to the linear hash chain, session entries are modeled as leaves within a binary Merkle tree. A Merkle root is generated dynamically per session and stored separately.

### Entry Schema
Every entry $D_i$ adheres to a rigid JSON schema, consisting of:
- `id`: Unique sequential identifier.
- `timestamp`: High-precision operational timestamp.
- `operation`: The specific action taken (e.g., Sanitize, Carve).
- `target_device`: Hardware identifiers, serial numbers, and volume UUIDs.
- `standard_used`: The specific standard applied (e.g., DoD 5220.22-M).
- `verification_result`: Status of the carving/verification phase.
- `operator`: Identity token or username of the executing officer.
- `hash`: Current block hash ($H_i$).
- `prev_hash`: Previous block hash ($H_{i-1}$).

## Verification and Tamper Detection
The verification algorithm is deterministic: any third-party tool can recompute the chain from genesis and compare the resulting roots. Because of the avalanche effect of SHA-256, a single byte change—whether a modification, deletion, or truncation—causes a hash mismatch, breaking the chain and instantly flagging the ledger as compromised. It effectively detects post-hoc modification, deletion, reordering, truncation, or replay attacks.

*Note: The ledger cannot detect a real-time compromise of the signing key itself while operations are ongoing.*

## Signing and Timestamping
- **Signing:** The ledger supports optional PKCS#7 / CMS signature encapsulation over the final session root, utilizing the executing operator's own digital certificate (DSC/eSign).
- **Timestamping:** Currently relies on the local system clock, with planned future integration for RFC 3161 compliant Time-Stamp Protocol (TSP) servers.

## Blockchain Anchoring (Planned)
To combat completely offline destruction of the entire ledger, Void Vault plans to implement an offline anchor bundle. This allows a finalized session's Merkle roots to be exported securely via USB to a connected machine. From there, the root hash will be submitted to the MeitY National Blockchain Framework (NBF), Vishvasya, or NBFLite, cementing the timestamp and integrity of the session into a decentralized public record.

---
Independent SIH 2026 submission. Standards are referenced for alignment; no endorsement by NTRO, NIST, IEEE, CERT-In or STQC is implied.
