// #![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
  std::panic::set_hook(Box::new(|info| {
    eprintln!("VoidVault panicked: {:?}", info);
  }));

  eprintln!("VoidVault starting...");

  #[cfg(target_os = "windows")]
  {
    let args: Vec<String> = std::env::args().collect();
    if args.iter().any(|a| a == "--elevate") && !ps149_core::discovery::is_elevated() {
      if ps149_core::discovery::elevate_self() {
        std::process::exit(0);
      }
    }
  }

  app_lib::run();
}
