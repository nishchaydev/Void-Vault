# Void Vault — Windows Hassle-Free Installer & Desktop Packager
# Problem Statement ID: 26149 (NTRO)
# Run in PowerShell (Administrator recommended for raw drive operations)

param(
    [switch]$DesktopApp,
    [switch]$CLIOnly,
    [switch]$BuildInstaller,
    [switch]$CreateShortcut
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "  ╔═════════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "  ║  VOID VAULT — Dual-Engine Digital Forensics & Data Sanitization     ║" -ForegroundColor Cyan
Write-Host "  ║  NTRO PS-26149 • NIST SP 800-88 • IEEE 2883 • CFTT-DR Validated    ║" -ForegroundColor Cyan
Write-Host "  ╚═════════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# 1. Check Administrator Privileges
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "  [*] Requesting Administrator elevation for raw block drive access..." -ForegroundColor Yellow
    try {
        Start-Process powershell -Verb RunAs -ArgumentList "-NoExit -ExecutionPolicy Bypass -File `"$PSCommandPath`""
        exit 0
    } catch {
        Write-Host "  [!] Administrator privileges required for physical disk I/O (\\.\PhysicalDriveX)." -ForegroundColor Red
        Write-Host "      Please right-click PowerShell and choose 'Run as administrator'." -ForegroundColor Red
        exit 1
    }
}
Write-Host "  [+] Administrator privileges confirmed" -ForegroundColor Green

# 2. Verify Toolchains
$rustc = Get-Command rustc -ErrorAction SilentlyContinue
if (-not $rustc) {
    Write-Host "  [!] Rust toolchain not detected. Installing via rustup..." -ForegroundColor Yellow
    Invoke-WebRequest -Uri "https://win.rustup.rs/x86_64" -OutFile "$env:TEMP\rustup-init.exe"
    Start-Process -FilePath "$env:TEMP\rustup-init.exe" -ArgumentList "-y" -Wait
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
    Write-Host "  [+] Rust toolchain installed successfully" -ForegroundColor Green
} else {
    Write-Host "  [+] Rust $(rustc --version) detected" -ForegroundColor Green
}

$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
    Write-Host "  [!] Node.js not detected. Please install Node.js (v18+) for building the GUI." -ForegroundColor Yellow
} else {
    Write-Host "  [+] Node.js $(node --version) detected" -ForegroundColor Green
}

# 3. Build Core Forensic Engine (CLI / Daemon)
Write-Host ""
Write-Host "  [>] Step 1/3: Compiling Void Vault Core Engine (Rust Release)..." -ForegroundColor Cyan
Push-Location "$PSScriptRoot\..\ps149"
try {
    cargo build --release
    Write-Host "  [+] ps149 core engine compiled successfully" -ForegroundColor Green
} catch {
    Write-Host "  [!] Core engine build error: $_" -ForegroundColor Red
    exit 1
} finally {
    Pop-Location
}

# 4. Build Standalone Desktop GUI (Tauri + React + Intercom Theme)
if (-not $CLIOnly) {
    Write-Host ""
    Write-Host "  [>] Step 2/3: Bundling Void Vault Desktop GUI..." -ForegroundColor Cyan
    Push-Location "$PSScriptRoot\..\gui"
    try {
        if (-not (Test-Path "node_modules")) {
            Write-Host "  [*] Installing GUI dependencies..." -ForegroundColor Gray
            npm install --silent
        }
        Write-Host "  [*] Compiling React 19 production assets..." -ForegroundColor Gray
        npm run build

        Write-Host "  [*] Compiling Native Tauri Desktop Executable..." -ForegroundColor Gray
        Push-Location "$PSScriptRoot\..\gui\src-tauri"
        cargo build --release
        Pop-Location

        Write-Host "  [+] Void Vault Native Desktop binary generated successfully" -ForegroundColor Green
    } catch {
        Write-Host "  [!] Desktop GUI build error: $_" -ForegroundColor Red
        exit 1
    } finally {
        Pop-Location
    }
}

# 5. Create Desktop Shortcut & Deployment Directory
Write-Host ""
Write-Host "  [>] Step 3/3: Deploying Executables and Shortcuts..." -ForegroundColor Cyan

$deployDir = "$env:ProgramFiles\VoidVault"
if (-not (Test-Path $deployDir)) {
    try {
        New-Item -ItemType Directory -Path $deployDir -Force | Out-Null
    } catch {
        $deployDir = "$env:LOCALAPPDATA\VoidVault"
        New-Item -ItemType Directory -Path $deployDir -Force | Out-Null
    }
}

# Copy binaries
$tauriExe = "$PSScriptRoot\..\gui\src-tauri\target\release\app.exe"
if (-not (Test-Path $tauriExe)) {
    $tauriExe = "$PSScriptRoot\..\gui\src-tauri\target\release\VoidVault.exe"
}
$cliExe = "$PSScriptRoot\..\ps149\target\release\ps149.exe"

$targetApp = "$deployDir\VoidVault.exe"
$targetCli = "$deployDir\void-vault-cli.exe"

if (Test-Path $tauriExe) {
    Copy-Item $tauriExe $targetApp -Force
    Write-Host "  [+] Installed Desktop App: $targetApp" -ForegroundColor Green
}
if (Test-Path $cliExe) {
    Copy-Item $cliExe $targetCli -Force
    Write-Host "  [+] Installed CLI Daemon: $targetCli" -ForegroundColor Green
}

# Create Desktop Shortcut
$desktopPath = [Environment]::GetFolderPath("Desktop")
$shortcutPath = "$desktopPath\Void Vault Forensics.lnk"

$wshShell = New-Object -ComObject WScript.Shell
$shortcut = $wshShell.CreateShortcut($shortcutPath)
$shortcut.TargetPath = $targetApp
$shortcut.WorkingDirectory = $deployDir
$shortcut.Description = "Void Vault — Forensic Data Sanitization & Recovery (NTRO PS-26149)"
if (Test-Path "$PSScriptRoot\..\gui\src-tauri\icons\icon.ico") {
    $shortcut.IconLocation = "$PSScriptRoot\..\gui\src-tauri\icons\icon.ico"
}
$shortcut.Save()
Write-Host "  [+] Desktop Shortcut created: $shortcutPath" -ForegroundColor Green

Write-Host ""
Write-Host "  ═════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  SUCCESS: Void Vault is installed and ready for forensic operations!" -ForegroundColor Green
Write-Host "  • Launch GUI: Double-click 'Void Vault Forensics' on your Desktop" -ForegroundColor White
Write-Host "  • Launch CLI: $targetCli --help" -ForegroundColor White
Write-Host "  • Live Daemon: $targetCli server --port 5001" -ForegroundColor White
Write-Host "  ═════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
