//! PS-26149: Integrated Secure Data Erasure & Advanced File Recovery
//!
//! Library crate exposing all forensic modules for use by the GUI frontend
//! and external tools.

pub mod ai;
pub mod carver;
pub mod discovery;
pub mod file_eraser;
pub mod forensic;
pub mod model;
pub mod report;
pub mod safety;
pub mod sanitize;
pub mod system_cleaner;
pub mod ui;
pub mod verify;
pub mod server;
// platform module is declared in main.rs for now

