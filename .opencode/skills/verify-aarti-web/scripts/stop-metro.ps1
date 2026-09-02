param(
    [int]$Port = 8081,
    [string]$RepoRoot = (Join-Path $PSScriptRoot "..\..\..\..")
)

$repoRoot = (Resolve-Path $RepoRoot).Path
$pidFile = Join-Path $repoRoot ".verify\metro.pid"

# Kill only what this verification run started: the recorded wrapper PID first...
if (Test-Path $pidFile) {
    $recorded = Get-Content $pidFile -ErrorAction SilentlyContinue
    if ($recorded -match '^\d+$') {
        $proc = Get-CimInstance Win32_Process -Filter "ProcessId=$recorded" -ErrorAction SilentlyContinue
        if ($proc -and $proc.CommandLine -match 'expo|metro') {
            taskkill /PID $recorded /T /F 2>&1 | Out-Null
            Write-Output "Killed recorded Metro tree PID $recorded"
        }
    }
    Remove-Item $pidFile -ErrorAction SilentlyContinue
}

# ...then the port owner as a fallback, but ONLY after confirming it is an Expo/Metro process.
$listener = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
if ($listener) {
    $owner = Get-CimInstance Win32_Process -Filter "ProcessId=$($listener.OwningProcess)" -ErrorAction SilentlyContinue
    if ($owner -and $owner.CommandLine -match 'expo|metro') {
        taskkill /PID $listener.OwningProcess /T /F 2>&1 | Out-Null
        Write-Output "Killed port-owner Metro tree PID $($listener.OwningProcess)"
    } else {
        Write-Warning "Port $Port still owned by PID $($listener.OwningProcess) [$($owner.CommandLine)] - NOT expo/metro, left untouched."
    }
}

Start-Sleep -Seconds 2
if (Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue) {
    Write-Warning "Port $Port is still listening."
} else {
    Write-Output "Port $Port free. Evidence in $repoRoot\.verify\evidence is untouched."
}
