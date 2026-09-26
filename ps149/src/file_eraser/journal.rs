use anyhow::Result;
use tracing::{info, warn};
use windows::core::HSTRING;
use windows::Win32::Foundation::{CloseHandle, HANDLE, GENERIC_READ, GENERIC_WRITE};
use windows::Win32::Storage::FileSystem::{
    CreateFileW, FILE_SHARE_READ, FILE_SHARE_WRITE, OPEN_EXISTING, FILE_FLAG_BACKUP_SEMANTICS,
};
use windows::Win32::System::IO::DeviceIoControl;

const FSCTL_DELETE_USN_JOURNAL: u32 = 0x000900F0;
const FSCTL_QUERY_USN_JOURNAL: u32 = 0x000900F4;
const USN_DELETE_FLAG_DELETE: u32 = 1;
const USN_DELETE_FLAG_NOTIFY: u32 = 2;

#[repr(C)]
#[derive(Default)]
#[allow(non_snake_case)]
struct USN_JOURNAL_DATA_V0 {
    pub UsnJournalID: u64,
    pub FirstUsn: i64,
    pub NextUsn: i64,
    pub LowestValidUsn: i64,
    pub MaxUsn: i64,
    pub MaximumSize: u64,
    pub AllocationDelta: u64,
}

#[repr(C)]
#[allow(non_snake_case)]
struct DELETE_USN_JOURNAL_DATA {
    pub UsnJournalID: u64,
    pub DeleteFlags: u32,
}

struct HandleGuard(HANDLE);
impl Drop for HandleGuard {
    fn drop(&mut self) {
        if !self.0.is_invalid() {
            unsafe {
                let _ = CloseHandle(self.0);
            }
        }
    }
}

/// Purge the USN journal for the volume containing the given path.
/// Requires Administrator privileges.
///
/// **Safety Note:** This deletes the journal for ALL files on the volume,
/// not just the target file.
pub fn purge_usn_journal(volume_letter: char) -> Result<bool> {
    info!("Purging USN journal on volume {}:", volume_letter);
    delete_usn_journal(volume_letter)?;
    Ok(true)
}

/// Delete the USN journal for a specific volume.
///
/// **Safety Note:** This deletes the journal for ALL files on the volume,
/// not just the target file.
pub fn delete_usn_journal(volume_letter: char) -> Result<()> {
    let volume_path = format!("\\\\.\\{}:", volume_letter);
    let volume_hstring = HSTRING::from(&volume_path);

    let handle = unsafe {
        CreateFileW(
            &volume_hstring,
            GENERIC_READ.0 | GENERIC_WRITE.0,
            FILE_SHARE_READ | FILE_SHARE_WRITE,
            None,
            OPEN_EXISTING,
            FILE_FLAG_BACKUP_SEMANTICS,
            None,
        )?
    };

    if handle.is_invalid() {
        warn!("Failed to open volume {}. Requires Administrator privileges.", volume_letter);
        anyhow::bail!("Invalid handle for volume {}. Ensure you have Administrator privileges.", volume_letter);
    }

    let _guard = HandleGuard(handle);

    let mut journal_data = USN_JOURNAL_DATA_V0::default();
    let mut bytes_returned = 0u32;

    let result = unsafe {
        DeviceIoControl(
            handle,
            FSCTL_QUERY_USN_JOURNAL,
            None,
            0,
            Some(&mut journal_data as *mut _ as *mut std::ffi::c_void),
            std::mem::size_of::<USN_JOURNAL_DATA_V0>() as u32,
            Some(&mut bytes_returned),
            None,
        )
    };

    if result.is_err() {
        warn!("USN Journal not found or could not be queried on volume {}:", volume_letter);
        return Ok(());
    }

    let mut delete_data = DELETE_USN_JOURNAL_DATA {
        UsnJournalID: journal_data.UsnJournalID,
        DeleteFlags: USN_DELETE_FLAG_DELETE | USN_DELETE_FLAG_NOTIFY,
    };

    let mut bytes_returned = 0u32;
    let delete_result = unsafe {
        DeviceIoControl(
            handle,
            FSCTL_DELETE_USN_JOURNAL,
            Some(&mut delete_data as *mut _ as *mut std::ffi::c_void),
            std::mem::size_of::<DELETE_USN_JOURNAL_DATA>() as u32,
            None,
            0,
            Some(&mut bytes_returned),
            None,
        )
    };

    if delete_result.is_err() {
        anyhow::bail!("Failed to delete USN journal on volume {}", volume_letter);
    }

    info!("Successfully deleted USN journal on volume {}", volume_letter);

    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_purge_usn_journal_invalid_volume() {
        let result = purge_usn_journal('?');
        assert!(result.is_err());
    }
}
