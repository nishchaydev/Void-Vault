#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }

      // Automatically launch the embedded Void Vault forensic API daemon in the background
      std::thread::spawn(|| {
        let running = std::sync::Arc::new(std::sync::atomic::AtomicBool::new(true));
        let _ = ps149_core::server::run_api_server(5001, running);
      });

      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
