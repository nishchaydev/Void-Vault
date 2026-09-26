pub mod bfd;
pub mod engine;
pub mod exfat_dir;
pub mod ext4_journal;
pub mod fat_dir;
pub mod fragment;
pub mod ntfs_mft;
pub mod parallel;
pub mod severity;
pub mod smart_length;
/// Module 3: Advanced File Carving & Recovery Engine
///
/// Forensic-grade file recovery through signature-based carving,
/// structure parsing, and AI-assisted fragment classification.
pub mod signatures;
pub mod validators;
pub mod virtual_disk;

#[allow(unused_imports)]
pub use engine::{carve_from_source, CarvedFile, CarvingProgress, CarvingResult};
#[allow(unused_imports)]
pub use signatures::{all_signatures, FileCategory, FileSignature};
