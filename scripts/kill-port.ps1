# PowerShell script to kill process on a specific port
param(
    [int]$Port = 3001
)

$process = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique

if ($process) {
    Write-Host "Killing process $process on port $Port..."
    Stop-Process -Id $process -Force
    Write-Host "Process killed successfully."
} else {
    Write-Host "No process found on port $Port."
}
