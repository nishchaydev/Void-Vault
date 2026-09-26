//! Low-level TCG Opal SSC session + method-invocation protocol, built on
//! top of the raw IF-SEND/IF-RECV primitives in `discovery::ioctl`.
//!
//! ## Why this exists
//! `sanitize::opal::detect_opal_support` already does a real, working,
//! unauthenticated TCG Level 0 Discovery query. Actually erasing a drive
//! via Opal — "RevertTPer" in the industry's common shorthand for the reset
//! triggered by an authenticated PSID Revert call, even though the TCG
//! method itself is literally just named "Revert" — requires establishing
//! an authenticated session and invoking a method on the Admin SP: a real
//! protocol stack (packet framing, a token encoder, a session state
//! machine, UID/method tables). That stack is implemented here.
//!
//! ## Provenance — this was not written from memory
//! Every UID, method UID, token value, atom bit-layout, and the packet
//! framing/response-parsing algorithm below is a direct, close port of the
//! Linux kernel's in-tree, shipping SED Opal driver (`block/sed-opal.c` +
//! `block/opal_proto.h`), fetched and read before writing a single byte of
//! this file — not reconstructed from the TCG specification text or from
//! memory. Where a name here differs from the kernel's own (e.g. one
//! `finalize_packet` here vs. a split `cmd_finalize` + `opal_send_recv`
//! there), the *byte-level output* is kept identical. This matters because
//! a subtle framing or index error here would silently produce a command
//! the drive rejects — a safe failure, since Opal's own access control
//! (you must supply the correct PSID) is the actual safety net, not this
//! code — but "fails safely" still isn't the goal; matching a proven
//! implementation byte-for-byte is, and that's what the comments below
//! cite at each step.
//!
//! ## What this does and does not do
//! - Implements: Level 0 Discovery ComID extraction, a StartSession call
//!   against the Admin SP authenticated as PSID, and the `Revert` method
//!   call on the Admin SP (the "RevertTPer" reset) — the single most common
//!   real-world Opal erase path, since the PSID is a physical drive-label
//!   value that works even on a never-provisioned ("not owned") drive.
//! - Does NOT implement: SID/Admin1-authenticated sessions (erasing a
//!   drive that already has an admin password set, as opposed to using the
//!   physical PSID), Locking SP range operations, MBR shadow table
//!   handling, or the `RevertSP` method (a different, lesser reset invoked
//!   *inside* a Locking SP session rather than on the Admin SP). Those are
//!   real gaps, not silently assumed away — `crypto_erase` in `opal.rs`
//!   only claims a PSID revert, and says so.
//! - **Never compiled or run against real Opal hardware.** There is no
//!   Opal drive, and no Windows environment at all, available in the
//!   session that wrote this (see `REMAINING_WORK.md`). Treat this exactly
//!   like the other from-first-principles-but-unverified hardware paths
//!   flagged there — it needs confirming against `sedutil-cli
//!   --PSIDrevert` or `msed --PSIDrevert` on the same real drive before
//!   it's trusted for an actual forensic erase.
//!
//! ## References consulted
//! - Linux kernel `block/sed-opal.c` / `block/opal_proto.h` (primary
//!   source for every constant and algorithm here).
//! - TCG Storage Architecture Core Specification / Opal SSC (for the
//!   general session/method-invocation model this implements).
//! - Drive-Trust-Alliance `sedutil` (`DtaStructures.h`) — cross-referenced
//!   for the same UID table when detection was added earlier; consistent
//!   with the kernel's table used here.

use anyhow::{anyhow, bail, Result};

use crate::discovery::ioctl;

// ---------------------------------------------------------------------
// UID / method tables — verbatim byte values from the Linux kernel's
// `static const u8 opaluid[][OPAL_UID_LENGTH]` and
// `static const u8 opalmethod[][OPAL_METHOD_LENGTH]` in block/sed-opal.c.
// Only the entries this module actually uses are reproduced.
// ---------------------------------------------------------------------

/// `OPAL_SMUID_UID` — the Session Manager object every `StartSession` call
/// is invoked on (not the SP itself).
const UID_SMUID: [u8; 8] = [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff];
/// `OPAL_ADMINSP_UID`.
const UID_ADMINSP: [u8; 8] = [0x00, 0x00, 0x02, 0x05, 0x00, 0x00, 0x00, 0x01];
/// `OPAL_PSID_UID` — the PSID authority object, used as the
/// `HostSigningAuthority` when authenticating a session with the drive's
/// physical PSID value.
const UID_PSID: [u8; 8] = [0x00, 0x00, 0x00, 0x09, 0x00, 0x01, 0xff, 0x01];

/// `OPAL_STARTSESSION` method UID.
const METHOD_STARTSESSION: [u8; 8] = [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff, 0x02];
/// `OPAL_REVERT` method UID — invoked on the SP object itself
/// (`UID_ADMINSP`) once authenticated; this is the actual "RevertTPer"
/// factory-reset call.
const METHOD_REVERT: [u8; 8] = [0x00, 0x00, 0x00, 0x06, 0x00, 0x00, 0x02, 0x02];

// Structural token bytes (`block/opal_proto.h` `enum opal_token`).
const TOK_STARTLIST: u8 = 0xf0;
const TOK_ENDLIST: u8 = 0xf1;
const TOK_STARTNAME: u8 = 0xf2;
const TOK_ENDNAME: u8 = 0xf3;
const TOK_CALL: u8 = 0xf8;
const TOK_ENDOFDATA: u8 = 0xf9;
const TOK_ENDOFSESSION: u8 = 0xfa;

// Atom-family boundaries (`block/opal_proto.h`): a token byte's own value
// says which family it belongs to.
const TINY_ATOM_BYTE: u8 = 0x7f;
const SHORT_ATOM_BYTE: u8 = 0xbf;
const MEDIUM_ATOM_BYTE: u8 = 0xdf;
const EMPTY_ATOM_BYTE: u8 = 0xff;

// Short-atom header bit layout.
const SHORT_ATOM_ID: u8 = 0x80;
const SHORT_ATOM_BYTESTRING: u8 = 0x20;
const SHORT_ATOM_SIGNED: u8 = 0x10;
const SHORT_ATOM_LEN_MASK: u8 = 0x0f;

// Medium-atom header bit layout (an 11-bit length split across 2 bytes).
const MEDIUM_ATOM_ID: u8 = 0xc0;
const MEDIUM_ATOM_BYTESTRING: u8 = 0x10;
const MEDIUM_ATOM_LEN_MASK: u16 = 0x07; // top 3 bits of the length, in header byte 0

// Tiny-atom bit layout (the whole atom is a single byte).
const TINY_ATOM_SIGNED: u8 = 0x40;
const TINY_ATOM_DATA_MASK: u8 = 0x3f;

/// `GENERIC_HOST_SESSION_NUM` — the fixed host session number this client
/// always requests (not session-specific; the kernel driver uses the same
/// constant for every session it opens).
const GENERIC_HOST_SESSION_NUM: u32 = 0x41;
/// `FIRST_TPER_SESSION_NUM` — real TPer-assigned session numbers start at
/// or above this; used as a sanity check on the drive's `StartSession`
/// response, same as the kernel driver does.
const FIRST_TPER_SESSION_NUM: u32 = 4096;

/// A method call with no explicit status code and no properly-formed
/// status trailer at all — `block/opal_proto.h`'s `DTAERROR_NO_METHOD_STATUS`.
const DTAERROR_NO_METHOD_STATUS: u64 = 0x89;

/// `IO_BUFFER_LENGTH` — every Opal IF-SEND/IF-RECV packet (after Level 0
/// Discovery) is this fixed size.
const IO_BUFFER_LENGTH: usize = 2048;

// Byte offsets and sizes of the 56-byte ComPacket+Packet+SubPacket header
// (`block/sed-opal.c` `struct opal_header`), all fields big-endian. Written
// out as explicit offsets into a flat buffer rather than a #[repr(C)]
// struct — the ComPacket's `extendedComID` is a raw 4-byte array sitting
// between two `__be32`s, and hand-placing bytes at known offsets is more
// obviously correct here than trusting Rust/C struct layout to agree with
// a spec that was itself written assuming C's field order with no padding.
//
// ComPacket (20 bytes): reserved0(4) extendedComID(4) outstandingData(4)
//                       minTransfer(4) length(4)
// Packet (24 bytes):    tsn(4) hsn(4) seq_number(4) reserved0(2)
//                       ack_type(2) acknowledgment(4) length(4)
// SubPacket (12 bytes): reserved0(6) kind(2) length(4)
const COMPACKET_LEN: usize = 20;
const PACKET_LEN: usize = 24;
const SUBPACKET_LEN: usize = 12;
const HEADER_LEN: usize = COMPACKET_LEN + PACKET_LEN + SUBPACKET_LEN; // 56

const OFF_EXTENDED_COMID: usize = 4;
const OFF_PKT_TSN: usize = COMPACKET_LEN; // 20
const OFF_PKT_HSN: usize = COMPACKET_LEN + 4; // 24
const OFF_PKT_LENGTH: usize = COMPACKET_LEN + 20; // 40
const OFF_SUBPKT_LENGTH: usize = COMPACKET_LEN + PACKET_LEN + 8; // 52
const OFF_CP_LENGTH: usize = 16;

// ---------------------------------------------------------------------
// Token encoder — a close port of `add_token_u8`, `add_short_atom_header`,
// `add_medium_atom_header`, `add_bytestring_header`, `add_token_bytestring`
// and `add_token_u64` from `block/sed-opal.c`.
// ---------------------------------------------------------------------

/// Builds one Opal packet's payload, starting right after the 56-byte
/// header (mirrors `clear_opal_cmd` setting `cmd->pos = sizeof(header)` on
/// a zeroed buffer).
struct PacketBuilder {
    buf: Vec<u8>,
}

impl PacketBuilder {
    fn new() -> Self {
        Self {
            buf: vec![0u8; HEADER_LEN],
        }
    }

    fn add_u8(&mut self, b: u8) {
        self.buf.push(b);
    }

    /// `add_short_atom_header`: header byte = 0x80 | bytestring<<5 |
    /// signed<<4 | (len & 0xF). `len` must be <= 15.
    fn add_short_atom_header(&mut self, bytestring: bool, signed: bool, len: usize) {
        let mut atom = SHORT_ATOM_ID;
        if bytestring {
            atom |= SHORT_ATOM_BYTESTRING;
        }
        if signed {
            atom |= SHORT_ATOM_SIGNED;
        }
        atom |= (len as u8) & SHORT_ATOM_LEN_MASK;
        self.add_u8(atom);
    }

    /// `add_medium_atom_header`: an 11-bit length split as 3 high bits in
    /// header byte 0 and the low 8 bits in header byte 1. `len` must be
    /// <= 0x7FF (2047) — comfortably more than a PSID string ever needs.
    fn add_medium_atom_header(&mut self, bytestring: bool, len: usize) {
        let mut header0 = MEDIUM_ATOM_ID;
        if bytestring {
            header0 |= MEDIUM_ATOM_BYTESTRING;
        }
        header0 |= ((len as u16 >> 8) & MEDIUM_ATOM_LEN_MASK) as u8;
        self.buf.push(header0);
        self.buf.push((len & 0xff) as u8);
    }

    /// `add_bytestring_header`: short-atom header for len <= 15, else a
    /// medium-atom header.
    fn add_bytestring_header(&mut self, len: usize) {
        if len > SHORT_ATOM_LEN_MASK as usize {
            self.add_medium_atom_header(true, len);
        } else {
            self.add_short_atom_header(true, false, len);
        }
    }

    /// `add_token_bytestring`.
    fn add_bytestring(&mut self, data: &[u8]) {
        self.add_bytestring_header(data.len());
        self.buf.extend_from_slice(data);
    }

    /// `add_token_u64`: values that fit in 6 bits go out as a single tiny
    /// atom (the raw value byte itself, since `TINY_ATOM_SIGNED` is unset
    /// and the data occupies the low 6 bits); larger values go out as a
    /// short atom holding the minimal big-endian byte count needed.
    fn add_u64(&mut self, number: u64) {
        if number & !(TINY_ATOM_DATA_MASK as u64) == 0 {
            self.add_u8(number as u8);
            return;
        }
        let bits = 64 - number.leading_zeros() as usize; // fls64 equivalent
        let len = (bits + 7) / 8; // DIV_ROUND_UP(bits, 8)
        self.add_short_atom_header(false, false, len);
        for i in (0..len).rev() {
            self.add_u8((number >> (i * 8)) as u8);
        }
    }

    /// `cmd_start`: opens a method call — `Call` token, invoking UID,
    /// method UID, then the parameter list is opened and left open (closed
    /// later by `finalize`, matching the kernel's split between
    /// `cmd_start` and `cmd_finalize`).
    fn start_call(&mut self, invoking_uid: &[u8; 8], method_uid: &[u8; 8]) {
        self.add_u8(TOK_CALL);
        self.add_bytestring(invoking_uid);
        self.add_bytestring(method_uid);
        self.add_u8(TOK_STARTLIST);
    }

    /// `cmd_finalize`: closes the parameter list opened by `start_call`,
    /// appends the fixed `[EndOfData, StartList, 0, 0, 0, EndList]` method
    /// status trailer every call ends with, zero-pads to a 4-byte
    /// boundary, then fills in the ComPacket/Packet/SubPacket header
    /// fields (`comid`, `tsn`, `hsn`, and the three length fields) at
    /// their fixed offsets. Returns the full fixed 2048-byte buffer ready
    /// for `discovery::ioctl::opal_send` — matching the reference driver
    /// sending the whole allocated buffer, not just the "used" prefix.
    fn finalize(mut self, comid: u16, hsn: u32, tsn: u32) -> [u8; IO_BUFFER_LENGTH] {
        self.add_u8(TOK_ENDLIST);
        self.add_u8(TOK_ENDOFDATA);
        self.add_u8(TOK_STARTLIST);
        self.add_u8(0);
        self.add_u8(0);
        self.add_u8(0);
        self.add_u8(TOK_ENDLIST);

        while self.buf.len() % 4 != 0 {
            self.buf.push(0);
        }

        let pos = self.buf.len();
        self.buf[OFF_EXTENDED_COMID] = (comid >> 8) as u8;
        self.buf[OFF_EXTENDED_COMID + 1] = (comid & 0xff) as u8;
        self.buf[OFF_EXTENDED_COMID + 2] = 0;
        self.buf[OFF_EXTENDED_COMID + 3] = 0;

        self.buf[OFF_PKT_TSN..OFF_PKT_TSN + 4].copy_from_slice(&tsn.to_be_bytes());
        self.buf[OFF_PKT_HSN..OFF_PKT_HSN + 4].copy_from_slice(&hsn.to_be_bytes());

        let subpkt_length = (pos - HEADER_LEN) as u32;
        let pkt_length = (pos - COMPACKET_LEN - PACKET_LEN) as u32;
        let cp_length = (pos - COMPACKET_LEN) as u32;
        self.buf[OFF_SUBPKT_LENGTH..OFF_SUBPKT_LENGTH + 4]
            .copy_from_slice(&subpkt_length.to_be_bytes());
        self.buf[OFF_PKT_LENGTH..OFF_PKT_LENGTH + 4].copy_from_slice(&pkt_length.to_be_bytes());
        self.buf[OFF_CP_LENGTH..OFF_CP_LENGTH + 4].copy_from_slice(&cp_length.to_be_bytes());

        let mut out = [0u8; IO_BUFFER_LENGTH];
        let n = self.buf.len().min(IO_BUFFER_LENGTH);
        out[..n].copy_from_slice(&self.buf[..n]);
        out
    }
}

// ---------------------------------------------------------------------
// Response decoder — a close port of `response_parse`,
// `response_parse_tiny/short/medium`, `response_get_token`,
// `response_get_u64`, `response_token_matches`, and `response_status`.
// ---------------------------------------------------------------------

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum TokenKind {
    Uint,
    Bytestring,
    /// A structural single-byte token (StartList, EndList, Call, ...).
    Token,
    /// Anything this decoder doesn't need to interpret further (signed
    /// integers, empty atoms) — recorded only so token indices still line
    /// up correctly with the reference parser's.
    Other,
}

struct RespToken {
    kind: TokenKind,
    /// Raw byte value for `TokenKind::Token` (for structural matching).
    raw: u8,
    /// Decoded value for `TokenKind::Uint`.
    value: u64,
}

/// `response_parse`: walks the response subpacket's declared length,
/// splitting it into a flat token array exactly the way the kernel does —
/// which is what lets fixed token indices (like "HSN is token 4") work at
/// all, since both sides derive the same indexing from the same bytes.
fn parse_tokens(resp: &[u8; IO_BUFFER_LENGTH]) -> Result<Vec<RespToken>> {
    if resp.len() < HEADER_LEN {
        bail!("Opal response shorter than the fixed header");
    }
    let cp_len = u32::from_be_bytes(resp[OFF_CP_LENGTH..OFF_CP_LENGTH + 4].try_into().unwrap());
    let pkt_len =
        u32::from_be_bytes(resp[OFF_PKT_LENGTH..OFF_PKT_LENGTH + 4].try_into().unwrap());
    let subpkt_len = u32::from_be_bytes(
        resp[OFF_SUBPKT_LENGTH..OFF_SUBPKT_LENGTH + 4]
            .try_into()
            .unwrap(),
    ) as usize;

    if cp_len == 0 || pkt_len == 0 || subpkt_len == 0 || subpkt_len > IO_BUFFER_LENGTH - HEADER_LEN
    {
        bail!(
            "Opal response has an invalid/empty header (cp={}, pkt={}, subpkt={}) — \
             the drive likely rejected the request or isn't Opal-compliant here",
            cp_len,
            pkt_len,
            subpkt_len
        );
    }

    let mut pos = HEADER_LEN;
    let end = HEADER_LEN + subpkt_len;
    let mut tokens = Vec::new();

    while pos < end {
        let b = resp[pos];
        if b <= TINY_ATOM_BYTE {
            // Matches the kernel's own type split: a signed tiny atom is
            // tagged distinctly from an unsigned one (SINT vs UINT), so
            // `get_u64` correctly refuses to read a value out of it rather
            // than silently treating "signed" and "unsigned zero" alike.
            if b & TINY_ATOM_SIGNED != 0 {
                tokens.push(RespToken {
                    kind: TokenKind::Other,
                    raw: b,
                    value: 0,
                });
            } else {
                tokens.push(RespToken {
                    kind: TokenKind::Uint,
                    raw: b,
                    value: (b & TINY_ATOM_DATA_MASK) as u64,
                });
            }
            pos += 1;
        } else if b <= SHORT_ATOM_BYTE {
            let len = (b & SHORT_ATOM_LEN_MASK) as usize + 1;
            if pos + len > IO_BUFFER_LENGTH {
                bail!("Opal response short atom overruns the buffer");
            }
            if b & SHORT_ATOM_BYTESTRING != 0 {
                tokens.push(RespToken {
                    kind: TokenKind::Bytestring,
                    raw: 0,
                    value: 0,
                });
            } else if b & SHORT_ATOM_SIGNED != 0 {
                tokens.push(RespToken {
                    kind: TokenKind::Other,
                    raw: 0,
                    value: 0,
                });
            } else if len > 9 {
                // More than 8 data bytes doesn't fit a u64 — the kernel
                // rejects this too (`tok->len > 9` check in
                // `response_parse_short`) rather than silently truncating.
                bail!("Opal response short-atom integer wider than 8 bytes");
            } else {
                // Big-endian integer in the len-1 bytes following the header.
                let mut v: u64 = 0;
                for i in 1..len {
                    v = (v << 8) | resp[pos + i] as u64;
                }
                tokens.push(RespToken {
                    kind: TokenKind::Uint,
                    raw: 0,
                    value: v,
                });
            }
            pos += len;
        } else if b <= MEDIUM_ATOM_BYTE {
            if pos + 1 >= IO_BUFFER_LENGTH {
                bail!("Opal response medium atom header overruns the buffer");
            }
            let len = (((b as u16 & MEDIUM_ATOM_LEN_MASK) << 8) | resp[pos + 1] as u16) as usize
                + 2;
            if pos + len > IO_BUFFER_LENGTH {
                bail!("Opal response medium atom overruns the buffer");
            }
            let kind = if b & MEDIUM_ATOM_BYTESTRING != 0 {
                TokenKind::Bytestring
            } else {
                TokenKind::Other
            };
            tokens.push(RespToken {
                kind,
                raw: 0,
                value: 0,
            });
            pos += len;
        } else if b == EMPTY_ATOM_BYTE {
            tokens.push(RespToken {
                kind: TokenKind::Other,
                raw: b,
                value: 0,
            });
            pos += 1;
        } else {
            // Long atom (0xe0-0xe3) or a structural token (0xf0-0xfa).
            // This module never needs to decode a long atom's contents
            // (StartSession/Revert responses only ever carry small
            // integers and short bytestrings), so anything in the long-
            // atom range is only skipped correctly for the specific
            // encodings this code emits/expects — it is not a general
            // long-atom decoder. Every response this module actually
            // parses only exercises the structural-token branch below.
            tokens.push(RespToken {
                kind: TokenKind::Token,
                raw: b,
                value: 0,
            });
            pos += 1;
        }
    }

    Ok(tokens)
}

fn token_matches(tokens: &[RespToken], idx: usize, expect: u8) -> bool {
    tokens
        .get(idx)
        .map(|t| t.kind == TokenKind::Token && t.raw == expect)
        .unwrap_or(false)
}

fn get_u64(tokens: &[RespToken], idx: usize) -> Option<u64> {
    tokens.get(idx).and_then(|t| {
        if t.kind == TokenKind::Uint {
            Some(t.value)
        } else {
            None
        }
    })
}

/// `response_status`: every method response ends with a fixed
/// `[StartList, status, reserved, reserved, EndList]` trailer (the same
/// shape `PacketBuilder::finalize` appends when *sending* a call) — a
/// status of 0 means success.
///
/// Deliberate simplification vs. the kernel driver this is ported from:
/// the kernel's `resp->num` excludes `EMPTY_ATOM` tokens from its count
/// while still advancing its array index past them (an omitted-optional-
/// parameter encoding), so `resp->num` and "physical token position" can
/// diverge if a response contains an empty atom. This function uses
/// `tokens.len()` (physical count) directly instead. That's equivalent to
/// the kernel's behavior for every response this module actually parses
/// (a `SyncSession` result and a bare `Revert` status trailer, neither of
/// which has any reason to carry an omitted-optional-parameter atom) —
/// but it is not a general-purpose reimplementation of that quirk, so
/// don't reuse this helper for a response type that might legitimately
/// contain one.
fn response_status(tokens: &[RespToken]) -> u64 {
    if token_matches(tokens, 0, TOK_ENDOFSESSION) {
        return 0;
    }
    if tokens.len() < 5 {
        return DTAERROR_NO_METHOD_STATUS;
    }
    let n = tokens.len();
    if !token_matches(tokens, n - 5, TOK_STARTLIST) {
        return DTAERROR_NO_METHOD_STATUS;
    }
    if !token_matches(tokens, n - 1, TOK_ENDLIST) {
        return DTAERROR_NO_METHOD_STATUS;
    }
    get_u64(tokens, n - 4).unwrap_or(DTAERROR_NO_METHOD_STATUS)
}

/// Human-readable form of an Opal method status code
/// (`block/sed-opal.c`'s `opal_errors` table).
fn status_to_str(status: u64) -> &'static str {
    const NAMES: &[&str] = &[
        "Success",
        "Not Authorized",
        "Unknown Error",
        "SP Busy",
        "SP Failed",
        "SP Disabled",
        "SP Frozen",
        "No Sessions Available",
        "Uniqueness Conflict",
        "Insufficient Space",
        "Insufficient Rows",
        "Invalid Function",
        "Invalid Parameter",
        "Invalid Reference",
        "Unknown Error",
        "TPER Malfunction",
        "Transaction Failure",
        "Response Overflow",
        "Authority Locked Out",
    ];
    if status == 0x3f {
        return "Failed";
    }
    NAMES.get(status as usize).copied().unwrap_or("Unknown Error")
}

// ---------------------------------------------------------------------
// High-level session flow.
// ---------------------------------------------------------------------

fn send_and_receive(disk_index: u32, comid: u16, packet: &[u8; IO_BUFFER_LENGTH]) -> Result<Vec<RespToken>> {
    ioctl::opal_send(disk_index, comid, packet)?;
    let resp = ioctl::opal_receive(disk_index, comid)?;
    parse_tokens(&resp)
}

/// Runs Level 0 Discovery (reusing `discovery::ioctl::opal_discovery0`,
/// the already-working detection path) purely to extract the session
/// ComID — the OPAL SSC v1.00/v2.00 feature descriptor carries a
/// `baseComID` field directly in its body (`struct d0_opal_v100`/
/// `d0_opal_v200` in the kernel source: a `__be16 baseComID` as the first
/// two bytes after the generic 4-byte feature-descriptor header), so no
/// separate "get ComID" exchange is needed — the same discovery response
/// `detect_opal_support` already parses for feature codes also carries the
/// ComID to use for everything after it.
fn discover_comid(disk_index: u32) -> Result<u16> {
    let data = ioctl::opal_discovery0(disk_index)
        .map_err(|e| anyhow!("Level 0 Discovery failed: {}", e))?;

    const FC_OPAL_V100: u16 = 0x0200;
    const FC_OPAL_V200: u16 = 0x0203;

    let mut offset = 48usize;
    let mut comid_v100: Option<u16> = None;
    let mut comid_v200: Option<u16> = None;
    while offset + 4 <= data.len() {
        let code = u16::from_be_bytes([data[offset], data[offset + 1]]);
        let len = data[offset + 3] as usize;
        if code == 0 && len == 0 {
            break;
        }
        let body_start = offset + 4;
        if body_start + len > data.len() {
            break;
        }
        if code == FC_OPAL_V200 && len >= 2 {
            comid_v200 = Some(u16::from_be_bytes([data[body_start], data[body_start + 1]]));
        } else if code == FC_OPAL_V100 && len >= 2 {
            comid_v100 = Some(u16::from_be_bytes([data[body_start], data[body_start + 1]]));
        }
        offset = body_start + len;
    }

    comid_v200
        .or(comid_v100)
        .ok_or_else(|| anyhow!("Drive did not advertise an Opal v1.00/v2.00 ComID in Level 0 Discovery"))
}

/// Opens a session on the Admin SP authenticated as the PSID authority,
/// mirroring `start_generic_opal_session(dev, OPAL_PSID_UID,
/// OPAL_ADMINSP_UID, psid, psid_len)` in the kernel driver. Returns the
/// `(hsn, tsn)` pair needed to frame every subsequent packet in this
/// session.
fn start_psid_session(disk_index: u32, comid: u16, psid: &[u8]) -> Result<(u32, u32)> {
    let mut pb = PacketBuilder::new();
    pb.start_call(&UID_SMUID, &METHOD_STARTSESSION);
    pb.add_u64(GENERIC_HOST_SESSION_NUM as u64);
    pb.add_bytestring(&UID_ADMINSP);
    pb.add_u8(1); // write=true — a revert needs write access to the SP

    pb.add_u8(TOK_STARTNAME);
    pb.add_u8(0); // "HostChallenge"
    pb.add_bytestring(psid);
    pb.add_u8(TOK_ENDNAME);
    pb.add_u8(TOK_STARTNAME);
    pb.add_u8(3); // "HostSigningAuthority"
    pb.add_bytestring(&UID_PSID);
    pb.add_u8(TOK_ENDNAME);

    // hsn/tsn are 0 for the very first packet of a session — the drive
    // hasn't assigned a TSN yet.
    let packet = pb.finalize(comid, 0, 0);
    let tokens = send_and_receive(disk_index, comid, &packet)?;

    let status = response_status(&tokens);
    if status != 0 {
        bail!(
            "PSID StartSession failed: {} (status 0x{:02x}) — the PSID is \
             almost always wrong when this happens (it's the physical \
             value printed on the drive's label, not any password ever \
             set on it)",
            status_to_str(status),
            status
        );
    }

    let hsn = get_u64(&tokens, 4)
        .ok_or_else(|| anyhow!("StartSession response missing HSN at the expected position"))?
        as u32;
    let tsn = get_u64(&tokens, 5)
        .ok_or_else(|| anyhow!("StartSession response missing TSN at the expected position"))?
        as u32;

    if hsn != GENERIC_HOST_SESSION_NUM || tsn < FIRST_TPER_SESSION_NUM {
        bail!(
            "StartSession response looks malformed (hsn={}, tsn={}) — \
             refusing to proceed with an erase on an unconfirmed session",
            hsn,
            tsn
        );
    }

    Ok((hsn, tsn))
}

/// Invokes the `Revert` method on the Admin SP within an already-
/// authenticated session — the actual "RevertTPer" factory reset. Per the
/// TCG Opal SSC, a successful Admin SP revert also resets the Locking SP
/// (and therefore all locking ranges and their keys) back to
/// Original Manufacturing State — this is the actual crypto-erase: any
/// data encrypted under the old media encryption keys becomes
/// permanently unrecoverable the moment the drive generates new ones.
fn revert_tper(disk_index: u32, comid: u16, hsn: u32, tsn: u32) -> Result<()> {
    let mut pb = PacketBuilder::new();
    pb.start_call(&UID_ADMINSP, &METHOD_REVERT);
    let packet = pb.finalize(comid, hsn, tsn);

    let tokens = send_and_receive(disk_index, comid, &packet)?;
    let status = response_status(&tokens);
    if status != 0 {
        bail!(
            "Revert (RevertTPer) failed: {} (status 0x{:02x})",
            status_to_str(status),
            status
        );
    }
    Ok(())
}

/// Full PSID-based Opal crypto-erase: Level 0 Discovery → extract ComID →
/// StartSession on the Admin SP authenticated as PSID → Revert. On success
/// the drive has generated fresh internal media encryption keys and reset
/// itself to factory state — a real cryptographic erase, not a software
/// overwrite. `psid` is the raw ASCII bytes of the PSID string printed on
/// the drive's physical label (commonly 32 characters); it is used
/// directly as the authentication challenge, per the Opal SSC — there is
/// no separate hashing step for PSID authentication.
///
/// A successful `Revert` invalidates the session it was called in (the SP
/// that owned it no longer exists in its prior form), so this
/// deliberately does not attempt a graceful session close afterward —
/// there is nothing left to close, and the reference tools this was
/// ported from don't attempt one either.
pub fn psid_revert(disk_index: u32, psid: &[u8]) -> Result<()> {
    let comid = discover_comid(disk_index)?;
    let (hsn, tsn) = start_psid_session(disk_index, comid, psid)?;
    revert_tper(disk_index, comid, hsn, tsn)
}

#[cfg(test)]
mod tests {
    use super::*;

    // These tests exercise only the pure encode/decode logic (no ATA I/O),
    // which is the part of this module that can actually be checked
    // without real Opal hardware — they confirm the token builder and
    // response parser agree with each other and with the kernel's
    // documented bit layouts, not that a real drive accepts the output.

    #[test]
    fn tiny_atom_roundtrip() {
        let mut pb = PacketBuilder::new();
        pb.add_u64(5);
        assert_eq!(*pb.buf.last().unwrap(), 5);
    }

    #[test]
    fn short_atom_u64_encoding() {
        let mut pb = PacketBuilder::new();
        pb.add_u64(0x41); // GENERIC_HOST_SESSION_NUM — exceeds the 6-bit tiny range
        let tail = &pb.buf[pb.buf.len() - 2..];
        // Short atom header: SHORT_ATOM_ID | len=1 -> 0x81, then the byte 0x41.
        assert_eq!(tail, &[0x81, 0x41]);
    }

    #[test]
    fn bytestring_header_picks_short_for_8_byte_uid() {
        let mut pb = PacketBuilder::new();
        pb.add_bytestring(&UID_ADMINSP);
        let header_pos = pb.buf.len() - 8 - 1;
        // 8-byte UID: SHORT_ATOM_ID | BYTESTRING | len=8 -> 0x80|0x20|0x08 = 0xA8
        assert_eq!(pb.buf[header_pos], 0xA8);
        assert_eq!(&pb.buf[header_pos + 1..], &UID_ADMINSP);
    }

    #[test]
    fn bytestring_header_picks_medium_for_32_byte_psid() {
        let psid = [0x41u8; 32]; // typical PSID length
        let mut pb = PacketBuilder::new();
        pb.add_bytestring(&psid);
        let header_pos = pb.buf.len() - 32 - 2;
        // Medium atom: MEDIUM_ATOM_ID | BYTESTRING | len_hi, len_lo = 0xD0, 0x20
        assert_eq!(pb.buf[header_pos], 0xD0);
        assert_eq!(pb.buf[header_pos + 1], 0x20);
    }

    #[test]
    fn finalize_produces_fixed_size_buffer_with_header_fields_set() {
        let mut pb = PacketBuilder::new();
        pb.start_call(&UID_ADMINSP, &METHOD_REVERT);
        // finalize(comid, hsn, tsn) — hsn=0x41 (GENERIC_HOST_SESSION_NUM),
        // tsn=4096 (FIRST_TPER_SESSION_NUM), kept distinct on purpose so a
        // swapped-field bug here would fail loudly instead of coincidentally
        // matching.
        let out = pb.finalize(0x07fe, 0x41, 4096);
        assert_eq!(out.len(), IO_BUFFER_LENGTH);
        assert_eq!(out[OFF_EXTENDED_COMID], 0x07);
        assert_eq!(out[OFF_EXTENDED_COMID + 1], 0xfe);
        assert_eq!(
            u32::from_be_bytes(out[OFF_PKT_HSN..OFF_PKT_HSN + 4].try_into().unwrap()),
            0x41
        );
        assert_eq!(
            u32::from_be_bytes(out[OFF_PKT_TSN..OFF_PKT_TSN + 4].try_into().unwrap()),
            4096
        );
        let subpkt_len = u32::from_be_bytes(
            out[OFF_SUBPKT_LENGTH..OFF_SUBPKT_LENGTH + 4]
                .try_into()
                .unwrap(),
        );
        assert!(subpkt_len > 0);
    }

    #[test]
    fn response_status_reads_success_trailer() {
        // A minimal, hand-built [StartList, 0, 0, 0, EndList] trailer —
        // the exact shape `PacketBuilder::finalize` appends to every call.
        let tokens = vec![
            RespToken { kind: TokenKind::Token, raw: TOK_STARTLIST, value: 0 },
            RespToken { kind: TokenKind::Uint, raw: 0, value: 0 },
            RespToken { kind: TokenKind::Uint, raw: 0, value: 0 },
            RespToken { kind: TokenKind::Uint, raw: 0, value: 0 },
            RespToken { kind: TokenKind::Token, raw: TOK_ENDLIST, value: 0 },
        ];
        assert_eq!(response_status(&tokens), 0);
    }

    #[test]
    fn response_status_reports_no_method_status_when_too_short() {
        let tokens = vec![RespToken { kind: TokenKind::Uint, raw: 0, value: 0 }];
        assert_eq!(response_status(&tokens), DTAERROR_NO_METHOD_STATUS);
    }

    #[test]
    fn status_names_match_kernel_table_for_common_codes() {
        assert_eq!(status_to_str(0), "Success");
        assert_eq!(status_to_str(1), "Not Authorized");
        assert_eq!(status_to_str(0x3f), "Failed");
    }
}
