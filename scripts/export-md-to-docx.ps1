# Converts markdown files to .docx via Word COM.
param(
  [Parameter(Mandatory = $true)]
  [string[]]$InputPaths,
  [string[]]$OutputDirs = @([Environment]::GetFolderPath("Desktop"))
)

$ErrorActionPreference = "Stop"

function Escape-Html([string]$text) {
  return [System.Net.WebUtility]::HtmlEncode($text)
}

function Inline-Format([string]$line) {
  $s = Escape-Html $line
  $s = [regex]::Replace($s, '\[([^\]]+)\]\(([^)]+)\)', '<a href="$2">$1</a>')
  $s = [regex]::Replace($s, '`([^`]+)`', '<code>$1</code>')
  $s = [regex]::Replace($s, '\*\*([^*]+)\*\*', '<strong>$1</strong>')
  $s = [regex]::Replace($s, '\*([^*]+)\*', '<em>$1</em>')
  return $s
}

function Convert-MarkdownToHtml([string]$markdown) {
  $lines = $markdown -split "`r?`n"
  $html = New-Object System.Collections.Generic.List[string]
  [void]$html.Add('<!DOCTYPE html><html><head><meta charset="utf-8"><style>')
  [void]$html.Add('body{font-family:Calibri,Arial,sans-serif;font-size:11pt;line-height:1.4;margin:1in;color:#111}')
  [void]$html.Add('h1{font-size:20pt;color:#0A1628;border-bottom:2px solid #FFB700;padding-bottom:6px}')
  [void]$html.Add('h2{font-size:16pt;color:#0A1628;margin-top:24px}')
  [void]$html.Add('h3{font-size:13pt;color:#0A1628;margin-top:18px}')
  [void]$html.Add('table{border-collapse:collapse;width:100%;margin:12px 0;font-size:10pt}')
  [void]$html.Add('th,td{border:1px solid #ccc;padding:6px 8px;text-align:left;vertical-align:top}')
  [void]$html.Add('th{background:#f0f4f8;font-weight:bold}')
  [void]$html.Add('pre{background:#f5f5f5;border:1px solid #ddd;padding:10px;font-family:Consolas,monospace;font-size:9pt;white-space:pre-wrap}')
  [void]$html.Add('code{font-family:Consolas,monospace;font-size:9.5pt;background:#f5f5f5;padding:1px 3px}')
  [void]$html.Add('hr{border:none;border-top:1px solid #ccc;margin:20px 0}')
  [void]$html.Add('ul,ol{margin:8px 0 8px 24px} li{margin:4px 0}')
  [void]$html.Add('p{margin:8px 0}</style></head><body>')

  $i = 0
  while ($i -lt $lines.Count) {
    $line = $lines[$i]

    if ($line -match '^```') {
      $codeLines = New-Object System.Collections.Generic.List[string]
      $i++
      while ($i -lt $lines.Count -and $lines[$i] -notmatch '^```') {
        [void]$codeLines.Add((Escape-Html $lines[$i]))
        $i++
      }
      [void]$html.Add("<pre>$($codeLines -join "`n")</pre>")
      $i++
      continue
    }

    if ($line -match '^\|(.+)\|$') {
      $tableRows = New-Object System.Collections.Generic.List[string]
      while ($i -lt $lines.Count -and $lines[$i] -match '^\|(.+)\|$') {
        [void]$tableRows.Add($lines[$i])
        $i++
      }
      [void]$html.Add('<table>')
      $rowIndex = 0
      foreach ($row in $tableRows) {
        if ($row -match '^\|[\s\-:|]+\|$') { continue }
        $cells = ($row.Trim('|') -split '\|') | ForEach-Object { $_.Trim() }
        $tag = if ($rowIndex -eq 0) { "th" } else { "td" }
        $cellsHtml = ($cells | ForEach-Object { "<$tag>$(Inline-Format $_)</$tag>" }) -join ""
        [void]$html.Add("<tr>$cellsHtml</tr>")
        $rowIndex++
      }
      [void]$html.Add('</table>')
      continue
    }

    if ($line -match '^(#+)\s+(.+)$') {
      $level = $Matches[1].Length
      $text = $Matches[2]
      [void]$html.Add("<h$level>$(Inline-Format $text)</h$level>")
      $i++
      continue
    }

    if ($line -match '^---+\s*$') {
      [void]$html.Add('<hr/>')
      $i++
      continue
    }

    if ($line -match '^\s*-\s+(.+)$') {
      [void]$html.Add('<ul>')
      while ($i -lt $lines.Count -and $lines[$i] -match '^\s*-\s+(.+)$') {
        [void]$html.Add("<li>$(Inline-Format $Matches[1])</li>")
        $i++
      }
      [void]$html.Add('</ul>')
      continue
    }

    if ([string]::IsNullOrWhiteSpace($line)) {
      $i++
      continue
    }

    [void]$html.Add("<p>$(Inline-Format $line)</p>")
    $i++
  }

  [void]$html.Add('</body></html>')
  return ($html -join "`n")
}

function Export-OneDocx([string]$inputPath, [string]$outputDir) {
  if (-not (Test-Path $inputPath)) {
    Write-Error "File not found: $inputPath"
  }

  $baseName = [System.IO.Path]::GetFileNameWithoutExtension($inputPath)
  $htmlPath = Join-Path $env:TEMP "$baseName-export.html"
  $docxPath = Join-Path $outputDir "$baseName.docx"

  $markdown = Get-Content -Path $inputPath -Raw -Encoding UTF8
  $html = Convert-MarkdownToHtml $markdown
  [System.IO.File]::WriteAllText($htmlPath, $html, [System.Text.UTF8Encoding]::new($true))

  $word = New-Object -ComObject Word.Application
  $word.Visible = $false
  $word.DisplayAlerts = 0

  try {
    $doc = $word.Documents.Open($htmlPath)
    $doc.SaveAs2($docxPath, 16)
    $doc.Close($false)
    Write-Output "Exported: $docxPath"
  }
  finally {
    try { $word.Quit() } catch {}
    [void][System.Runtime.InteropServices.Marshal]::ReleaseComObject($word)
    Remove-Item $htmlPath -Force -ErrorAction SilentlyContinue
  }
}

foreach ($inputPath in $InputPaths) {
  foreach ($outputDir in $OutputDirs) {
    if (-not (Test-Path $outputDir)) {
      New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
    }
    Export-OneDocx $inputPath $outputDir
    Start-Sleep -Seconds 1
  }
}
