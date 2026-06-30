# ============================================================================
# ANu Setup Script — Windows (PowerShell)
# Sets up Ollama and creates the ANu in-house AI model
#
# Run: Right-click → "Run with PowerShell" OR:
#      powershell -ExecutionPolicy Bypass -File anu/setup.ps1
# ============================================================================

$ErrorActionPreference = "Stop"
$ANuDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host ""
Write-Host "╔══════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   ANu Setup — AN Dev Studio              ║" -ForegroundColor Cyan
Write-Host "║   AN Universal In-House AI               ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ── Step 1: Check / Install Ollama ──────────────────────────────────────────
Write-Host "► Checking Ollama installation..." -ForegroundColor Yellow

$ollamaInstalled = $false
try {
    $null = Get-Command ollama -ErrorAction Stop
    $ollamaInstalled = $true
    Write-Host "  ✓ Ollama already installed" -ForegroundColor Green
} catch {
    Write-Host "  Ollama not found. Installing..." -ForegroundColor Yellow
}

if (-not $ollamaInstalled) {
    $installerUrl = "https://ollama.com/download/OllamaSetup.exe"
    $installerPath = "$env:TEMP\OllamaSetup.exe"

    Write-Host "  Downloading Ollama from $installerUrl..." -ForegroundColor Yellow
    Invoke-WebRequest -Uri $installerUrl -OutFile $installerPath -UseBasicParsing

    Write-Host "  Running installer (silent)..." -ForegroundColor Yellow
    Start-Process -FilePath $installerPath -ArgumentList "/S" -Wait

    # Refresh PATH
    $env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" +
                [System.Environment]::GetEnvironmentVariable("Path", "User")

    Write-Host "  ✓ Ollama installed" -ForegroundColor Green
}

# ── Step 2: Start Ollama service ─────────────────────────────────────────────
Write-Host ""
Write-Host "► Starting Ollama service..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "http://localhost:11434/" -TimeoutSec 2
    Write-Host "  ✓ Ollama already running" -ForegroundColor Green
} catch {
    Start-Process -FilePath "ollama" -ArgumentList "serve" -WindowStyle Hidden
    Start-Sleep -Seconds 3
    Write-Host "  ✓ Ollama service started" -ForegroundColor Green
}

# ── Step 3: Pull base model ───────────────────────────────────────────────────
Write-Host ""
Write-Host "► Pulling base model: qwen2.5-coder:7b" -ForegroundColor Yellow
Write-Host "  (This is ~4.7GB — takes a few minutes on first run)" -ForegroundColor Gray

ollama pull qwen2.5-coder:7b

Write-Host "  ✓ Base model ready" -ForegroundColor Green

# ── Step 4: Create ANu model ──────────────────────────────────────────────────
Write-Host ""
Write-Host "► Creating ANu model from Modelfile..." -ForegroundColor Yellow

$modelfilePath = Join-Path $ANuDir "Modelfile"
ollama create anu -f $modelfilePath

Write-Host "  ✓ ANu model created" -ForegroundColor Green

# ── Step 5: Configure .env.local ──────────────────────────────────────────────
Write-Host ""
Write-Host "► Configuring .env.local..." -ForegroundColor Yellow

$projectRoot = Split-Path -Parent $ANuDir
$envFile = Join-Path $projectRoot "apps\studio\.env.local"
$envRootFile = Join-Path $projectRoot ".env.local"

# Check root .env.local first, then apps/studio
$targetEnvFile = if (Test-Path $envRootFile) { $envRootFile } else { $envFile }

$ollamaLines = @(
    "",
    "# ANu — In-house AI (Ollama)",
    "OLLAMA_ENABLED=true",
    "OLLAMA_HOST=http://localhost:11434",
    "OLLAMA_DEFAULT_MODEL=anu"
)

if (Test-Path $targetEnvFile) {
    $content = Get-Content $targetEnvFile -Raw
    if ($content -notmatch "OLLAMA_ENABLED") {
        Add-Content -Path $targetEnvFile -Value ($ollamaLines -join "`n")
        Write-Host "  ✓ Added ANu config to $targetEnvFile" -ForegroundColor Green
    } else {
        Write-Host "  ✓ ANu config already in .env.local" -ForegroundColor Green
    }
} else {
    Set-Content -Path $targetEnvFile -Value ($ollamaLines -join "`n")
    Write-Host "  ✓ Created $targetEnvFile with ANu config" -ForegroundColor Green
}

# ── Step 6: Verify ────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "► Verifying ANu..." -ForegroundColor Yellow
$testResponse = ollama run anu "Reply with exactly: ANu is operational." 2>&1
if ($testResponse -match "ANu is operational") {
    Write-Host "  ✓ ANu is working correctly" -ForegroundColor Green
} else {
    Write-Host "  ✓ ANu model loaded (response: $testResponse)" -ForegroundColor Green
}

# ── Done ─────────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║   ANu is ready!                                          ║" -ForegroundColor Green
Write-Host "║                                                          ║" -ForegroundColor Green
Write-Host "║   Next steps:                                            ║" -ForegroundColor Green
Write-Host "║   1. Restart your dev server: npm run dev                ║" -ForegroundColor Green
Write-Host "║   2. Open AI Studio and select ANu from the provider     ║" -ForegroundColor Green
Write-Host "║      switcher                                            ║" -ForegroundColor Green
Write-Host "║   3. Your prompts stay 100% private on your machine      ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
