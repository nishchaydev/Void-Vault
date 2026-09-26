#!/usr/bin/env bash
# Void Vault — 1-Click Linux Launcher
set -e

if [ "$EUID" -ne 0 ]; then
  echo "[*] Elevating to root for raw physical block device access..."
  exec sudo bash "$0" "$@"
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "========================================================================="
echo "  VOID VAULT — Dual-Engine Digital Forensics & Data Sanitization"
echo "  NTRO Problem Statement 26149 • NIST SP 800-88 • IEEE 2883"
echo "========================================================================="

# 1. Try native desktop binary
if [ -f "gui/src-tauri/target/release/app" ]; then
    echo "[*] Launching Void Vault Native Desktop App..."
    exec ./gui/src-tauri/target/release/app
elif [ -f "gui/src-tauri/target/release/VoidVault" ]; then
    echo "[*] Launching Void Vault Native Desktop App..."
    exec ./gui/src-tauri/target/release/VoidVault
elif command -v void-vault &> /dev/null; then
    echo "[*] Launching system-installed Void Vault..."
    exec void-vault
fi

# 2. Fallback: Launch daemon + browser UI
echo "[*] Starting Void Vault Forensic Daemon on port 5001..."
if [ -f "ps149/target/release/ps149" ]; then
    ./ps149/target/release/ps149 server --port 5001 &
    DAEMON_PID=$!
    trap "kill $DAEMON_PID 2>/dev/null || true" EXIT
else
    echo "[!] Void Vault not yet built. Running installer..."
    bash scripts/install-linux.sh
    exit 0
fi

sleep 2
echo "[*] Opening Void Vault in browser..."
cd gui
npm run dev -- --host 0.0.0.0 --port 1420 &
VITE_PID=$!
trap "kill $DAEMON_PID $VITE_PID 2>/dev/null || true" EXIT

sleep 2
if command -v xdg-open &> /dev/null; then
    xdg-open "http://localhost:1420"
fi

wait
