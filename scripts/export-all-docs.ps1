# Export all master documentation to .docx
# Requires Microsoft Word (COM) on Windows.
$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$master = Join-Path $root "docs/master"
$exportScript = Join-Path $root "scripts/export-md-to-docx.ps1"

$docs = @(
  "PROJECT-STRUCTURE.md",
  "NAVIGATION-MENU.md",
  "SUPERCORE-CATEGORIES.md",
  "B2B-QUOTE-ADMIN.md",
  "STOREFRONT-PRODUCT-PAGE.md",
  "STOREFRONT-B2B-ACCOUNT.md",
  "README.md"
)

$paths = $docs | ForEach-Object { Join-Path $master $_ }

Write-Host "Exporting $($paths.Count) documents to $master ..."
& $exportScript -InputPaths $paths -OutputDirs @($master)
Write-Host "Done."
