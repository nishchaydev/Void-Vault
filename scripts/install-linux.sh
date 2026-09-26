#!/usr/bin/env bash
# ==============================================================================
# Void Vault — Universal Linux Hassle-Free Installer
# NTRO Problem Statement 26149: Secure Data Erasure & Advanced File Recovery
# ==============================================================================
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${CYAN}"
cat << "EOF"
  ╔═════════════════════════════════════════════════════════════════════╗
  ║  VOID VAULT — Dual-Engine Digital Forensics & Data Sanitization     ║
  ║  NTRO PS-26149 • NIST SP 800-88 • IEEE 2883 • CFTT-DR Validated    ║
  ╚═════════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# 1. Require Root / Sudo
if [ "$EUID" -ne 0 ]; then
  echo -e "${YELLOW}[!] Root privileges required for forensic raw block device access.${NC}"
  echo -e "${CYAN}[>] Elevating with sudo...${NC}"
  exec sudo bash "$0" "$@"
fi

echo -e "${GREEN}[+] Root permissions confirmed.${NC}"

# 2. Detect Package Manager & Install System Prerequisites
echo -e "${CYAN}[>] Step 1/4: Installing native forensic and GUI runtime dependencies...${NC}"
if command -v apt-get &> /dev/null; then
    apt-get update -qq
    apt-get install -y -qq \
        build-essential curl pkg-config libssl-dev \
        libgtk-3-dev libwebkit2gtk-4.1-dev libsoup-3.0-dev libjavascriptcoregtk-4.1-dev \
        smartmontools nvme-cli hdparm udev
elif command -v dnf &> /dev/null; then
    dnf install -y \
        gcc gcc-c++ make pkgconfig openssl-devel \
        gtk3-devel webkit2gtk4.1-devel libsoup3-devel \
        smartmontools nvme-cli hdparm udev
elif command -v pacman &> /dev/null; then
    pacman -Sy --noconfirm --needed \
        base-devel curl openssl webkit2gtk-4.1 \
        smartmontools nvme-cli hdparm
else
    echo -e "${YELLOW}[!] Unknown package manager. Please ensure webkit2gtk-4.1 and smartmontools are installed.${NC}"
fi

# 3. Check / Install Rust & Node.js Toolchains (if building from source)
if ! command -v cargo &> /dev/null; then
    echo -e "${YELLOW}[*] Installing Rust toolchain...${NC}"
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source "$HOME/.cargo/env"
fi

# 4. Build Core Engine & Desktop App
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"

echo -e "${CYAN}[>] Step 2/4: Compiling Void Vault Core Engine (Rust Release)...${NC}"
cd "$REPO_ROOT/ps149"
cargo build --release

echo -e "${CYAN}[>] Step 3/4: Building Desktop GUI Application...${NC}"
cd "$REPO_ROOT/gui"
if [ ! -d "node_modules" ]; then
    npm install --silent
fi
npm run build

cd "$REPO_ROOT/gui/src-tauri"
cargo build --release

# 5. Deploy Binaries & Desktop Entry
echo -e "${CYAN}[>] Step 4/4: Deploying Void Vault to system...${NC}"
INSTALL_PREFIX="/usr/local/bin"
mkdir -p "$INSTALL_PREFIX"

cp "$REPO_ROOT/ps149/target/release/ps149" "$INSTALL_PREFIX/void-vault-cli"
chmod +x "$INSTALL_PREFIX/void-vault-cli"

TAURI_BIN="$REPO_ROOT/gui/src-tauri/target/release/app"
if [ ! -f "$TAURI_BIN" ]; then
    TAURI_BIN="$REPO_ROOT/gui/src-tauri/target/release/VoidVault"
fi
if [ -f "$TAURI_BIN" ]; then
    cp "$TAURI_BIN" "$INSTALL_PREFIX/void-vault"
    chmod +x "$INSTALL_PREFIX/void-vault"
fi

# Create Udev Rules for non-root USB / forensic storage probing
UDEV_FILE="/etc/udev/rules.d/99-voidvault-forensics.rules"
cat << 'EOF' > "$UDEV_FILE"
# Void Vault raw forensic disk query rule
SUBSYSTEM=="block", ATTR{removable}=="1", GROUP="disk", MODE="0660"
KERNEL=="nvme*", GROUP="disk", MODE="0660"
EOF
udevadm control --reload-rules || true

# Install Desktop Shortcut
ICON_DIR="/usr/share/icons/hicolor/128x128/apps"
mkdir -p "$ICON_DIR"
if [ -f "$REPO_ROOT/gui/src-tauri/icons/128x128.png" ]; then
    cp "$REPO_ROOT/gui/src-tauri/icons/128x128.png" "$ICON_DIR/voidvault.png"
fi

DESKTOP_ENTRY="/usr/share/applications/voidvault.desktop"
cat << EOF > "$DESKTOP_ENTRY"
[Desktop Entry]
Name=Void Vault Forensics
GenericName=Secure Data Erasure & File Recovery
Comment=NTRO PS-26149 Forensics Workstation (NIST SP 800-88 / IEEE 2883)
Exec=pkexec /usr/local/bin/void-vault
Icon=voidvault
Terminal=false
Type=Application
Categories=System;Security;Utility;
Keywords=forensics;recovery;erasure;sanitization;shredder;
EOF
chmod +x "$DESKTOP_ENTRY"

echo ""
echo -e "${GREEN}═════════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}SUCCESS: Void Vault has been installed on Linux!${NC}"
echo -e "  • Application Launcher: Search for 'Void Vault Forensics' in your app menu"
echo -e "  • Desktop Executable:   /usr/local/bin/void-vault"
echo -e "  • Forensic CLI:         void-vault-cli --help"
echo -e "  • Daemon Mode:          void-vault-cli server --port 5001"
echo -e "${GREEN}═════════════════════════════════════════════════════════════════════${NC}"
echo ""
