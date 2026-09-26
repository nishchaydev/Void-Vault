@echo off
:: Void Vault — 1-Click Administrator Launcher
:: Automatically requests administrative elevation for physical disk I/O

net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [!] Requesting administrative privileges for physical disk access...
    powershell -Command "Start-Process '%~f0' -Verb RunAs"
    exit /b
)

title Void Vault Forensics Workstation (NTRO PS-26149)
echo =========================================================================
echo   VOID VAULT — Dual-Engine Digital Forensics & Data Sanitization
echo   NTRO Problem Statement 26149 • NIST SP 800-88 • IEEE 2883
echo =========================================================================
echo.

cd /d "%~dp0"

:: Check if Tauri desktop executable exists
if exist "gui\src-tauri\target\release\app.exe" (
    echo [*] Starting Void Vault Desktop Application...
    start "" "gui\src-tauri\target\release\app.exe"
    exit /b
)

if exist "gui\src-tauri\target\release\VoidVault.exe" (
    echo [*] Starting Void Vault Desktop Application...
    start "" "gui\src-tauri\target\release\VoidVault.exe"
    exit /b
)

:: Otherwise, start the backend daemon and launch web UI
echo [*] Starting Void Vault Forensic Daemon on port 5001...
if exist "ps149\target\release\ps149.exe" (
    start "Void Vault Daemon" /min "ps149\target\release\ps149.exe" server --port 5001
) else (
    echo [!] Release binary not found. Building now...
    powershell -ExecutionPolicy Bypass -File "scripts\install-windows.ps1"
    exit /b
)

timeout /t 2 >nul
echo [*] Launching Void Vault User Interface...
cd gui
start "" npm run dev
timeout /t 2 >nul
start http://localhost:1420
