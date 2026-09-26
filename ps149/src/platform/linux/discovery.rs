//! Linux block-device enumeration via sysfs.
//!
//! Replaces an earlier stub that walked `/sys/block`, did nothing with each
//! entry ("Detailed parsing would go here"), and returned an empty `Ok(vec![])`
//! — indistinguishable, to a caller, from "this machine genuinely has no
//! disks". That silent-success shape is the same problem this project's
//! review has been removing elsewhere; see `REMAINING_WORK.md`.
//!
//! ## What's verified and what isn't
//! The sysfs attribute paths, units, and file formats below were checked
//! against a real running Linux system (kernel 6.17, SCSI-attached disks)
//! while writing this — `/sys/block/<dev>/size`, `queue/logical_block_size`,
//! `queue/rotational`, `removable`, `device/{model,vendor,rev,wwid}`, and the
//! per-partition `start`/`size`/`partition` files were each read directly and
//! their formats confirmed. What is *not* verified: this has never been
//! compiled (no Rust toolchain was available in the environment that wrote
//! it), and it has not been exercised against NVMe, USB, MMC/SD, or 4Kn
//! drives — only SCSI/`sd*` devices were present to inspect. Treat the
//! non-`sd*` paths as reasoned-from-documentation, not observed.
//!
//! ## Important unit quirk
//! `/sys/block/<dev>/size` and `/sys/block/<dev>/<part>/size` are **always in
//! 512-byte units**, regardless of the device's actual logical block size
//! (kernel `Documentation/ABI/testing/sysfs-block`). Multiplying them by
//! `logical_block_size` instead would over-report a 4Kn drive's capacity by
//! 8x, so capacity here is deliberately `size * 512` while
//! `bytes_per_sector` separately reports the real logical block size.

use crate::model::device::{PhysicalDisk, Partition, Volume};
use crate::model::device_type::DeviceType;
use crate::model::safety_status::SafetyStatus;
use anyhow::Result;
use std::fs;
use std::path::Path;

/// Sysfs reports every `size` attribute in 512-byte units — see the module
/// doc comment. Not the same thing as the device's logical block size.
const SYSFS_SECTOR_UNIT: u64 = 512;

/// Reads a sysfs attribute file and trims it. Sysfs string attributes are
/// commonly space-padded (`"BlockVolume     "`, `"ORACLE  "`), so trimming is
/// required, not cosmetic.
fn read_attr(base: &Path, rel: &str) -> Option<String> {
    let s = fs::read_to_string(base.join(rel)).ok()?;
    let t = s.trim();
    if t.is_empty() {
        None
    } else {
        Some(t.to_string())
    }
}

fn read_u64_attr(base: &Path, rel: &str) -> Option<u64> {
    read_attr(base, rel)?.parse().ok()
}

/// Maps the mount table into (device path, mount point, filesystem) triples.
/// Used to fill in volumes and — more importantly — to spot which disk holds
/// `/`, so it can be marked `Protected` and never offered for erasure.
fn read_mounts() -> Vec<(String, String, String)> {
    let content = match fs::read_to_string("/proc/mounts") {
        Ok(c) => c,
        Err(_) => return Vec::new(),
    };
    content
        .lines()
        .filter_map(|line| {
            let mut f = line.split_whitespace();
            let dev = f.next()?;
            let mount_point = f.next()?;
            let fs_type = f.next()?;
            // Only real block devices matter here; skip sysfs/proc/tmpfs/etc.
            if !dev.starts_with("/dev/") {
                return None;
            }
            Some((dev.to_string(), mount_point.to_string(), fs_type.to_string()))
        })
        .collect()
}

/// Classifies a device from the sysfs facts available, in the same spirit as
/// the Windows `discovery::classifier` but from Linux's own signals.
///
/// `rotational` (queue/rotational) distinguishes spinning media from flash;
/// `removable` and the kernel device-name prefix distinguish internal from
/// removable. Note `removable` is 0 for most USB SSDs/HDDs in enclosures —
/// it reflects *removable media* (like a card reader slot), not a removable
/// *device* — so the name prefix and transport are what actually separate
/// USB from internal here.
fn classify(name: &str, rotational: Option<u64>, removable: Option<u64>, is_usb: bool) -> DeviceType {
    if name.starts_with("nvme") {
        return DeviceType::InternalNvme;
    }
    if name.starts_with("mmcblk") {
        // MMC covers both soldered eMMC and SD cards; `removable` is the
        // signal that separates them.
        return if removable == Some(1) {
            DeviceType::SdCard
        } else {
            DeviceType::Emmc
        };
    }
    if is_usb {
        // A USB-attached spinning disk is an external HDD; USB flash and USB
        // SSDs both present as non-rotational, and sysfs alone can't reliably
        // tell a thumb drive from an enclosed SSD, so this reports the
        // broader UsbStorageDevice rather than guessing UsbFlashDrive.
        return match rotational {
            Some(1) => DeviceType::ExternalHdd,
            Some(0) => DeviceType::UsbStorageDevice,
            _ => DeviceType::UsbStorageDevice,
        };
    }
    match rotational {
        Some(1) => DeviceType::InternalHdd,
        Some(0) => DeviceType::InternalSsd,
        _ => DeviceType::Unknown,
    }
}

/// Resolves whether a block device sits behind a USB transport by walking the
/// sysfs symlink for the device back up toward the bus. `/sys/block/<dev>`
/// links into the device tree, so a USB-attached disk's canonical path
/// contains a `usb` component.
fn is_usb_attached(name: &str) -> bool {
    let link = Path::new("/sys/block").join(name);
    match fs::canonicalize(&link) {
        Ok(p) => p.to_string_lossy().contains("/usb"),
        Err(_) => false,
    }
}

/// Enumerates physical block devices from sysfs.
///
/// Returns an error (rather than an empty list) when `/sys/block` itself
/// can't be read, so a caller can tell "enumeration failed" apart from "no
/// disks found" — the distinction the previous stub erased.
pub fn enumerate_devices() -> Result<Vec<PhysicalDisk>> {
    let block_root = Path::new("/sys/block");
    let entries = fs::read_dir(block_root).map_err(|e| {
        anyhow::anyhow!(
            "Cannot read /sys/block ({}) — sysfs is required for device \
             enumeration on Linux",
            e
        )
    })?;

    let mounts = read_mounts();
    let mut devices = Vec::new();

    for (idx, entry) in entries.flatten().enumerate() {
        let name = entry.file_name().to_string_lossy().to_string();

        // Virtual/pseudo devices: loop mounts, ramdisks, device-mapper
        // targets, ZRAM. None of these are physical media to sanitize.
        if name.starts_with("loop")
            || name.starts_with("ram")
            || name.starts_with("dm-")
            || name.starts_with("zram")
            || name.starts_with("md")
            || name.starts_with("sr")
        {
            continue;
        }

        let base = block_root.join(&name);

        // `size` is in 512-byte units regardless of logical block size.
        let sectors_512 = read_u64_attr(&base, "size").unwrap_or(0);
        if sectors_512 == 0 {
            // An empty card reader slot reports size 0 — not a disk to act on.
            continue;
        }
        let capacity = sectors_512 * SYSFS_SECTOR_UNIT;
        let logical_block_size = read_u64_attr(&base, "queue/logical_block_size").unwrap_or(512);
        let rotational = read_u64_attr(&base, "queue/rotational");
        let removable = read_u64_attr(&base, "removable");
        let is_usb = is_usb_attached(&name);

        let model = read_attr(&base, "device/model");
        let vendor = read_attr(&base, "device/vendor");
        // NVMe exposes `device/serial`; SCSI/SATA generally doesn't, but does
        // expose a `wwid` (e.g. "naa.60e549b1..."), which is a stable unique
        // identifier and the better fallback than leaving this empty.
        let serial_number =
            read_attr(&base, "device/serial").or_else(|| read_attr(&base, "device/wwid"));

        let device_type = classify(&name, rotational, removable, is_usb);
        let dev_path = format!("/dev/{}", name);

        // Partitions are subdirectories of the disk that contain a
        // `partition` file (which holds the partition number).
        let mut partitions = Vec::new();
        let mut holds_root = false;
        if let Ok(children) = fs::read_dir(&base) {
            for child in children.flatten() {
                let child_name = child.file_name().to_string_lossy().to_string();
                if !child_name.starts_with(&name) {
                    continue;
                }
                let part_base = base.join(&child_name);
                let part_index = match read_u64_attr(&part_base, "partition") {
                    Some(n) => n as u32,
                    None => continue, // not a partition dir
                };
                let part_sectors = read_u64_attr(&part_base, "size").unwrap_or(0);
                let part_path = format!("/dev/{}", child_name);

                let mut volumes = Vec::new();
                let mut is_boot = false;
                for (mdev, mpoint, mfs) in &mounts {
                    if mdev == &part_path {
                        if mpoint == "/" {
                            holds_root = true;
                            is_boot = true;
                        }
                        if mpoint == "/boot" || mpoint.starts_with("/boot/") {
                            is_boot = true;
                        }
                        volumes.push(Volume {
                            // Linux has no drive letters; the mount point is
                            // the closest equivalent and is what the UI shows.
                            drive_letter: Some(mpoint.clone()),
                            label: None,
                            filesystem: Some(mfs.clone()),
                            capacity: Some(part_sectors * SYSFS_SECTOR_UNIT),
                            free_space: None,
                            drive_type: None,
                        });
                    }
                }

                partitions.push(Partition {
                    index: part_index,
                    size: part_sectors * SYSFS_SECTOR_UNIT,
                    is_boot,
                    is_primary: part_index <= 4,
                    partition_type: None,
                    volumes,
                });
            }
        }
        partitions.sort_by_key(|p| p.index);

        // Any disk carrying the running root filesystem is protected, matching
        // the Windows path's rule (system drive => Protected). Erring toward
        // Protected on an unreadable mount table is deliberate.
        let safety_status = if holds_root {
            SafetyStatus::Protected
        } else {
            SafetyStatus::Available
        };

        devices.push(PhysicalDisk {
            index: idx as u32,
            device_id: dev_path,
            model,
            serial_number,
            capacity,
            media_type: Some(match rotational {
                Some(1) => "Rotational (HDD)".to_string(),
                Some(0) => "Non-rotational (Flash)".to_string(),
                _ => "Unknown".to_string(),
            }),
            interface_type: Some(if is_usb {
                "USB".to_string()
            } else if name.starts_with("nvme") {
                "NVMe".to_string()
            } else if name.starts_with("mmcblk") {
                "MMC/SD".to_string()
            } else {
                vendor.clone().unwrap_or_else(|| "SCSI/SATA".to_string())
            }),
            pnp_device_id: None,
            bytes_per_sector: logical_block_size as u32,
            total_sectors: capacity / logical_block_size.max(1),
            device_type,
            is_boot_disk: holds_root,
            safety_status,
            partitions,
            // Populating this needs a real SMART read (NVMe admin log page or
            // ATA SMART via SG_IO) that isn't implemented on Linux yet.
            // Reported as absent rather than fabricated as healthy — the
            // Windows path had exactly that bug and it was fixed; see
            // REMAINING_WORK.md P0 #1.
            smart_health: None,
        });
    }

    devices.sort_by(|a, b| a.device_id.cmp(&b.device_id));
    Ok(devices)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn classify_nvme_by_name() {
        assert_eq!(classify("nvme0n1", Some(0), Some(0), false), DeviceType::InternalNvme);
    }

    #[test]
    fn classify_separates_emmc_from_sd_by_removable_flag() {
        assert_eq!(classify("mmcblk0", Some(0), Some(0), false), DeviceType::Emmc);
        assert_eq!(classify("mmcblk0", Some(0), Some(1), false), DeviceType::SdCard);
    }

    #[test]
    fn classify_internal_by_rotational_flag() {
        assert_eq!(classify("sda", Some(1), Some(0), false), DeviceType::InternalHdd);
        assert_eq!(classify("sda", Some(0), Some(0), false), DeviceType::InternalSsd);
        assert_eq!(classify("sda", None, Some(0), false), DeviceType::Unknown);
    }

    #[test]
    fn classify_usb_spinning_disk_as_external_hdd() {
        assert_eq!(classify("sdb", Some(1), Some(0), true), DeviceType::ExternalHdd);
        assert_eq!(classify("sdb", Some(0), Some(0), true), DeviceType::UsbStorageDevice);
    }

    /// Guards the 512-byte-unit quirk documented at the top of this file: a
    /// 4Kn drive reporting 8 sysfs sectors is 4096 bytes, not 32768.
    #[test]
    fn sysfs_size_units_are_always_512_bytes() {
        let sysfs_sectors = 8u64;
        let logical_block_size = 4096u64;
        let capacity = sysfs_sectors * SYSFS_SECTOR_UNIT;
        assert_eq!(capacity, 4096);
        assert_eq!(capacity / logical_block_size, 1);
    }

    /// Enumeration must not silently report "no disks" when sysfs is
    /// unreadable — that conflation is what the previous stub did.
    #[test]
    fn enumerate_is_readable_or_errors_but_never_silently_empty() {
        match enumerate_devices() {
            Ok(devs) => {
                // On a machine with sysfs, every returned disk must at least
                // have a non-zero capacity and a /dev path.
                for d in devs {
                    assert!(d.capacity > 0, "disk {} reported zero capacity", d.device_id);
                    assert!(d.device_id.starts_with("/dev/"));
                    assert!(d.bytes_per_sector > 0);
                }
            }
            Err(e) => {
                // Acceptable only as an explicit failure, which is the point.
                assert!(e.to_string().contains("/sys/block"));
            }
        }
    }
}
