use anyhow::Result;
use std::fs::File;
use std::io::Write;
use std::path::Path;

pub fn wipe_free_space(mount_point: &str, pattern: &[u8]) -> Result<u64> {
    let target_path = Path::new(mount_point).join(".wipe_tmp");
    let mut file = File::create(&target_path)?;

    // Naive fill
    let mut written = 0;
    while let Ok(w) = file.write(pattern) {
        if w == 0 {
            break;
        }
        written += w as u64;
    }

    std::fs::remove_file(target_path)?;
    Ok(written)
}
