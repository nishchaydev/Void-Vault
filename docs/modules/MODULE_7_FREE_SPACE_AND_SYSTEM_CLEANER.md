# Module 7: Free Space Wiper & System Artifact Cleaner
## Unallocated Space Flood, Cluster Slack Sanitization & Volume Shadow Copy Purge

---

## 1. Overview & Threat Model
In live operational systems, users frequently delete files through the standard operating system interface. While the directory index is updated, the underlying physical sectors remain in **unallocated free space**.

Forensic software (Disk Drill, FTK, EnCase) scans unallocated clusters to carve historical documents, browser caches, private keys, and emails.

Module 7 (`ps149::system_cleaner` & `free_space.rs`) purges all unallocated and remnant storage without disrupting the running operating system or active files.

---

## 2. Unallocated Space Wiping Modes

Module 7 supports two complementary wiping methods:

### 2.1 File-Based Free Space Flood (`free_space.rs`)
Used when volume locking is unavailable or the user is operating in user-space privileges:
1. Determines available free bytes on the target filesystem (`GetDiskFreeSpaceExW` / `statvfs`).
2. Creates temporary sparse/sequential files named `__vv_lf_*.tmp` inside the target drive.
3. Streams direct zero buffers (`0x00`) or pseudorandom bytes until the drive reports `0` bytes remaining (`ERROR_DISK_FULL`).
4. Invokes `FlushFileBuffers` to commit all blocks to physical NAND cells/platters.
5. Deletes and unlinks the temporary flood files.
*   *Forensic Impact:* 100% of unallocated clusters are overwritten with zero, rendering signature carvers completely blind.

### 2.2 Direct Raw Unallocated Cluster Overwrite
Used when administrative volume handles are open:
1. Queries filesystem cluster allocation bitmaps (`FSCTL_GET_VOLUME_BITMAP` on Windows).
2. Maps every unallocated cluster range.
3. Issues direct block overwrites strictly to unallocated LBA ranges without modifying any active file clusters.

---

## 3. Volume Shadow Copy (VSS) & System Restore Purge

On Windows systems, Volume Shadow Copies (VSS snapshots) store historical point-in-time diffs of deleted files:
*   Even if a file is shredded on disk, forensic examiners can mount a VSS snapshot to recover the file as it existed hours or days earlier.
*   Module 7 interfaces with Windows VSS Management API (`vssadmin delete shadows /all /quiet`) to purge orphaned shadow copies during sanitization passes.

---

## 4. USN Change Journal & Log File Cleaning
*   **NTFS `$LogFile` & `$UsnJrnl`:** Windows logs metadata updates, renames, and deletions in the Update Sequence Number (USN) journal.
*   Module 7 executes `FSCTL_DELETE_USN_JOURNAL` to reset the journal stream, wiping the timeline of historical file operations.
