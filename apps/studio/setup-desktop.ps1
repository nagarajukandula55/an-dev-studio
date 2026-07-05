# ============================================================================
# AN Dev Studio — automated desktop app setup (Windows)
#
# Installs everything needed to run AN Dev Studio as a native desktop app on
# this machine (Node.js, Rust, the Tauri CLI, Ollama), installs the project's
# own dependencies, builds the app, and produces a Windows installer you can
# run like any other app.
#
# Usage: open PowerShell in this folder (apps/studio) and run:
#   .\setup-desktop.ps1
#
# Safe to re-run — every step checks whether its tool is already installed
# and skips it if so.
# ============================================================================

$ErrorActionPreference = "Stop"

function Write-Step($msg) {
    Write-Host ""
    Write-Host "==> $msg" -ForegroundColor Cyan
}

function Test-Command($name) {
    return [bool](Get-Command $name -ErrorAction SilentlyContinue)
}

function Test-WingetAvailable {
    if (-not (Test-Command "winget")) {
        Write-Host "winget (Windows Package Manager) was not found." -ForegroundColor Yellow
        Write-Host "It ships with Windows 10 (2004+) and Windows 11 by default." -ForegroundColor Yellow
        Write-Host "Install 'App Installer' from the Microsoft Store, then re-run this script." -ForegroundColor Yellow
        exit 1
    }
}

# ── 1. Node.js ───────────────────────────────────────────────────────────────

Write-Step "Checking Node.js"
if (Test-Command "node") {
    $nodeVersion = (node --version)
    Write-Host "Node.js already installed: $nodeVersion"
} else {
    Test-WingetAvailable
    Write-Host "Installing Node.js LTS via winget..."
    winget install --id OpenJS.NodeJS.LTS -e --accept-source-agreements --accept-package-agreements
    Write-Host "Node.js installed. You may need to restart this terminal for PATH changes to apply." -ForegroundColor Yellow
    Write-Host "Re-run this script in a new terminal if the next steps fail to find 'node' or 'npm'." -ForegroundColor Yellow
}

# ── 2. Rust + Cargo (required by Tauri) ─────────────────────────────────────

Write-Step "Checking Rust toolchain"
if (Test-Command "cargo") {
    Write-Host "Rust already installed: $(cargo --version)"
} else {
    Write-Host "Installing Rust via rustup..."
    $rustupInit = "$env:TEMP\rustup-init.exe"
    Invoke-WebRequest -Uri "https://win.rustup.rs/x86_64" -OutFile $rustupInit
    & $rustupInit -y --default-toolchain stable
    Remove-Item $rustupInit -ErrorAction SilentlyContinue
    # rustup installs to ~/.cargo/bin; add to PATH for the rest of this script run
    $cargoBin = "$env:USERPROFILE\.cargo\bin"
    if (Test-Path $cargoBin) { $env:PATH = "$cargoBin;$env:PATH" }
    Write-Host "Rust installed. New terminals will pick up PATH changes automatically." -ForegroundColor Yellow
}

# ── 3. Windows build prerequisites for Tauri ────────────────────────────────
# Tauri on Windows needs the MSVC C++ Build Tools and WebView2 Runtime.
# WebView2 ships pre-installed on Windows 10 (2004+) and Windows 11.

Write-Step "Checking Microsoft C++ Build Tools (required by Tauri/Rust on Windows)"
$vsWhere = "${env:ProgramFiles(x86)}\Microsoft Visual Studio\Installer\vswhere.exe"
$hasBuildTools = $false
if (Test-Path $vsWhere) {
    $installed = & $vsWhere -products * -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 -property installationPath
    if ($installed) { $hasBuildTools = $true }
}
if ($hasBuildTools) {
    Write-Host "C++ Build Tools already installed."
} else {
    Test-WingetAvailable
    Write-Host "Installing Visual Studio Build Tools (C++ workload) via winget — this step is large and may take a while..."
    winget install --id Microsoft.VisualStudio.2022.BuildTools -e --accept-source-agreements --accept-package-agreements --override "--quiet --wait --add Microsoft.VisualStudio.Workload.VCTools"
}

# ── 4. Ollama (optional, for the local ANu model) ───────────────────────────

Write-Step "Checking Ollama (for the local ANu model — optional but recommended)"
if (Test-Command "ollama") {
    Write-Host "Ollama already installed: $(ollama --version)"
} else {
    Test-WingetAvailable
    Write-Host "Installing Ollama via winget..."
    winget install --id Ollama.Ollama -e --accept-source-agreements --accept-package-agreements
}

# ── 5. Project dependencies ─────────────────────────────────────────────────

Write-Step "Installing project dependencies (npm install)"
npm install

Write-Step "Installing Tauri CLI prerequisites are covered by npm install (@tauri-apps/cli)"

# ── 6. Production build of the Next.js app ──────────────────────────────────

Write-Step "Building the app (npm run build)"
npm run build

# ── 7. Build the desktop installer ──────────────────────────────────────────

Write-Step "Building the desktop app installer (this compiles the Rust shell — first time takes several minutes)"
npm run desktop:build

Write-Step "Done!"
Write-Host "Your installer is in: src-tauri\target\release\bundle\nsis\ (or \msi\)" -ForegroundColor Green
Write-Host "Run that installer once, then launch 'AN Dev Studio' like any other app." -ForegroundColor Green
Write-Host ""
Write-Host "For day-to-day development instead (hot reload, no installer), run: npm run desktop" -ForegroundColor Cyan
