param(
    [int]$Port = 8081,
    [string]$RepoRoot = (Join-Path $PSScriptRoot "..\..\..\..")
)

$ErrorActionPreference = "Stop"
$repoRoot = (Resolve-Path $RepoRoot).Path
$mobileDir = Join-Path $repoRoot "apps\mobile_client"
$verifyDir = Join-Path $repoRoot ".verify"
$evidenceDir = Join-Path $verifyDir "evidence"
New-Item -ItemType Directory -Force -Path $verifyDir, $evidenceDir | Out-Null

# Refuse to double-drive: if the port is owned, say by whom. Never drive an instance we did not start.
$existing = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
if ($existing) {
    $owner = Get-CimInstance Win32_Process -Filter "ProcessId=$($existing.OwningProcess)" -ErrorAction SilentlyContinue
    Write-Error "Port $Port is already owned by PID $($existing.OwningProcess) [$($owner.CommandLine)]. Do not drive an instance this run did not start. Use a different -Port (e.g. 8082) only if you started that instance too."
}

$env:BROWSER = 'none'          # stop Expo from opening a real browser window
$env:EXPO_NO_TELEMETRY = '1'

$outLog = Join-Path $verifyDir "metro-out.log"
$errLog = Join-Path $verifyDir "metro-err.log"
$pidFile = Join-Path $verifyDir "metro.pid"

$p = Start-Process -FilePath "npx.cmd" `
    -ArgumentList "expo", "start", "--web", "--port", "$Port" `
    -WorkingDirectory $mobileDir `
    -RedirectStandardOutput $outLog -RedirectStandardError $errLog `
    -PassThru -WindowStyle Hidden
Set-Content -Path $pidFile -Value $p.Id

# Ready = "Waiting on http://localhost:<port>" appears in the Metro log (typically 10-30s).
$deadline = (Get-Date).AddSeconds(90)
while ((Get-Date) -lt $deadline) {
    $log = Get-Content $outLog -Raw -ErrorAction SilentlyContinue
    if ($log -match "Waiting on http://localhost:$Port") {
        Write-Output "METRO_READY port=$Port wrapperPid=$($p.Id) log=$outLog"
        exit 0
    }
    if ($log -match "(?m)^error|Unable to resolve") {
        Write-Error "Metro failed to start. Check $outLog and $errLog"
    }
    Start-Sleep -Seconds 3
}
Write-Error "Metro did not report ready within 90s. Check $outLog and $errLog, then clean up with stop-metro.ps1."
