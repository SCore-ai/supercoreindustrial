# Dev stack helpers — run from repo root: .\scripts\dev-stack.ps1 status

param(
  [Parameter(Position = 0)]
  [ValidateSet("status", "up", "restart", "logs-medusa", "logs-storefront")]
  [string] $Action = "status"
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$ComposeFile = Join-Path $Root "docker-compose.yml"

function Test-DockerRunning {
  try {
    docker info 2>$null | Out-Null
    return $true
  } catch {
    return $false
  }
}

function Get-HttpStatus([string] $Url, [int] $TimeoutSec = 10) {
  try {
    $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec $TimeoutSec
    return $response.StatusCode
  } catch {
    if ($_.Exception.Response) {
      return [int]$_.Exception.Response.StatusCode
    }
    return -1
  }
}

function Show-Status {
  if (-not (Test-DockerRunning)) {
    Write-Host "Docker Desktop is not running. Start Docker Desktop, then run: .\scripts\dev-stack.ps1 up"
    exit 1
  }

  Write-Host "`n--- Containers ---"
  docker compose -f $ComposeFile ps

  Write-Host "`n--- Health ---"
  $medusa = Get-HttpStatus "http://localhost:9000/health" 15
  $store = Get-HttpStatus "http://localhost:8000/gb" 20

  Write-Host "Medusa (9000):     $(if ($medusa -eq 200) { 'OK' } else { "FAIL ($medusa)" })"
  Write-Host "Storefront (8000): $(if ($store -eq 200) { 'OK' } else { "FAIL ($store)" })"

  if ($medusa -ne 200) {
    Write-Host "`nTip: docker compose -f docker-compose.yml logs medusa --tail 40"
  }
  if ($store -ne 200 -and $medusa -eq 200) {
    Write-Host "`nTip: docker compose -f docker-compose.yml logs storefront --tail 40"
  }
}

switch ($Action) {
  "status" {
    Show-Status
  }
  "up" {
    if (-not (Test-DockerRunning)) {
      Write-Host "Start Docker Desktop first."
      exit 1
    }
    docker compose -f $ComposeFile up -d postgres redis typesense
    Write-Host "Waiting for postgres/redis..."
    Start-Sleep -Seconds 8
    docker compose -f $ComposeFile up -d medusa
    Write-Host "Waiting for Medusa (up to 120s)..."
    $ok = $false
    for ($i = 0; $i -lt 40; $i++) {
      if ((Get-HttpStatus "http://localhost:9000/health" 5) -eq 200) {
        $ok = $true
        break
      }
      Start-Sleep -Seconds 3
    }
    if (-not $ok) {
      Write-Host "Medusa did not become healthy. Check logs: .\scripts\dev-stack.ps1 logs-medusa"
      exit 1
    }
    docker compose -f $ComposeFile up -d storefront
    Write-Host "Stack started."
    Show-Status
  }
  "restart" {
    if (-not (Test-DockerRunning)) {
      Write-Host "Start Docker Desktop first."
      exit 1
    }
    Write-Host "Restarting medusa..."
    docker compose -f $ComposeFile restart medusa
  $deadline = (Get-Date).AddSeconds(120)
  while ((Get-Date) -lt $deadline) {
    if ((Get-HttpStatus "http://localhost:9000/health" 5) -eq 200) { break }
    Start-Sleep -Seconds 3
  }
    Write-Host "Restarting storefront..."
    docker compose -f $ComposeFile restart storefront
    Start-Sleep -Seconds 15
    Show-Status
  }
  "logs-medusa" {
    docker compose -f $ComposeFile logs medusa --tail 60
  }
  "logs-storefront" {
    docker compose -f $ComposeFile logs storefront --tail 60
  }
}
