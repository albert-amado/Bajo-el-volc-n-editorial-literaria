$ErrorActionPreference = 'Stop'

function Get-LineFromIndex {
    param([string]$Text, [int]$Index)
    if ($Index -lt 0) { return 1 }
    return (($Text.Substring(0, [Math]::Min($Index, $Text.Length)) -split "`n").Count)
}

$root = Get-Location
$allFiles = Get-ChildItem -Recurse -File -Include *.astro,*.css | Where-Object { $_.FullName -notmatch '\\node_modules\\|\\dist\\|\\.astro\\' }
$astroFiles = $allFiles | Where-Object { $_.Extension -eq '.astro' }
$cssFiles = $allFiles | Where-Object { $_.Extension -eq '.css' }
$findings = New-Object System.Collections.Generic.List[object]

# 1) Clases en <style> no usadas dentro del mismo .astro
foreach ($file in $astroFiles) {
    $content = Get-Content -LiteralPath $file.FullName -Raw
    $fm = [regex]::Match($content, '(?s)^---\s*(.*?)\s*---')
    $markupStart = if ($fm.Success) { $fm.Index + $fm.Length } else { 0 }
    $markupAndStyles = $content.Substring([Math]::Min($markupStart, $content.Length))

    $styleRegex = [regex]'(?is)<style[^>]*>(.*?)</style>'
    $styleMatches = $styleRegex.Matches($markupAndStyles)
    $markupOnly = $styleRegex.Replace($markupAndStyles, '')

    foreach ($sm in $styleMatches) {
        $styleInner = $sm.Groups[1].Value
        $classRegex = [regex]'(?<![\w-])\.([A-Za-z_][A-Za-z0-9_-]*)'
        $seen = @{}
        foreach ($cm in $classRegex.Matches($styleInner)) {
            $className = $cm.Groups[1].Value
            if ($seen.ContainsKey($className)) { continue }
            $seen[$className] = $true

            $used = [regex]::IsMatch($markupOnly, '(?i)\b' + [regex]::Escape($className) + '\b')
            if (-not $used) {
                $globalIndex = $markupStart + $sm.Index + $cm.Index
                $line = Get-LineFromIndex -Text $content -Index $globalIndex
                $findings.Add([pscustomobject]@{
                    type='unused_style_class_in_astro'; severity='high';
                    file=$file.FullName.Replace($root.Path + '\\',''); symbol='.' + $className; line=$line;
                    detail='Clase declarada en <style> sin referencia en markup del mismo archivo.'
                })
            }
        }
    }
}

# 2) Variables CSS de var.css sin uso con var(--...)
$varFile = Join-Path $root 'public/styles/css/var.css'
if (Test-Path -LiteralPath $varFile) {
    $varContent = Get-Content -LiteralPath $varFile -Raw
    $declRegex = [regex]'--([A-Za-z0-9_-]+)\s*:'
    $varNames = @()
    foreach ($m in $declRegex.Matches($varContent)) {
        $name = $m.Groups[1].Value
        if ($varNames -notcontains $name) { $varNames += $name }
    }

    $blob = ($allFiles | ForEach-Object { Get-Content -LiteralPath $_.FullName -Raw }) -join "`n"
    foreach ($v in $varNames) {
        if (-not [regex]::IsMatch($blob, 'var\(\s*--' + [regex]::Escape($v) + '\s*[,) ]')) {
            $idx = $varContent.IndexOf('--' + $v + ':')
            $line = Get-LineFromIndex -Text $varContent -Index $idx
            $findings.Add([pscustomobject]@{
                type='unused_css_variable'; severity='high';
                file='public/styles/css/var.css'; symbol='--' + $v; line=$line;
                detail='Variable CSS declarada pero no utilizada con var(--...).'
            })
        }
    }
}

# 3) Imports no usados en .astro
foreach ($file in $astroFiles) {
    $content = Get-Content -LiteralPath $file.FullName -Raw
    $fm = [regex]::Match($content, '(?s)^---\s*(.*?)\s*---')
    if (-not $fm.Success) { continue }

    $frontmatter = $fm.Groups[1].Value
    $after = $content.Substring($fm.Index + $fm.Length)
    $importRegex = [regex]'(?m)^\s*import\s+([^;]+?)\s+from\s+["''][^"'']+["'']\s*;?\s*$'

    foreach ($im in $importRegex.Matches($frontmatter)) {
        $spec = $im.Groups[1].Value.Trim()
        $ids = New-Object System.Collections.Generic.List[string]

        if ($spec -match '^\*\s+as\s+([A-Za-z_$][\w$]*)$') {
            $ids.Add($Matches[1])
        } elseif ($spec -match '^\{(.+)\}$') {
            foreach ($part in ($Matches[1] -split ',')) {
                $p = $part.Trim()
                if ($p -match '^([A-Za-z_$][\w$]*)\s+as\s+([A-Za-z_$][\w$]*)$') { $ids.Add($Matches[2]) }
                elseif ($p -match '^([A-Za-z_$][\w$]*)$') { $ids.Add($Matches[1]) }
            }
        } elseif ($spec -match '^([A-Za-z_$][\w$]*)(\s*,\s*\{(.+)\})?$') {
            $ids.Add($Matches[1])
            if ($Matches[3]) {
                foreach ($part in ($Matches[3] -split ',')) {
                    $p = $part.Trim()
                    if ($p -match '^([A-Za-z_$][\w$]*)\s+as\s+([A-Za-z_$][\w$]*)$') { $ids.Add($Matches[2]) }
                    elseif ($p -match '^([A-Za-z_$][\w$]*)$') { $ids.Add($Matches[1]) }
                }
            }
        }

        $frontmatterWithoutImport = $frontmatter.Remove($im.Index, $im.Length)
        foreach ($id in ($ids | Select-Object -Unique)) {
            $rx = [regex]('\b' + [regex]::Escape($id) + '\b')
            if (-not ($rx.IsMatch($frontmatterWithoutImport) -or $rx.IsMatch($after))) {
                $line = Get-LineFromIndex -Text $content -Index $im.Index
                $findings.Add([pscustomobject]@{
                    type='unused_astro_import'; severity='medium';
                    file=$file.FullName.Replace($root.Path + '\\',''); symbol=$id; line=$line;
                    detail='Import posiblemente no utilizado en el archivo .astro.'
                })
            }
        }
    }
}

function Add-CssSuspiciousFindings {
    param([string]$Text, [string]$FileRel)

    foreach ($m in ([regex]'(?ms)([^{};]+)\{\s*\}').Matches($Text)) {
        $line = Get-LineFromIndex -Text $Text -Index $m.Index
        $sel = ($m.Groups[1].Value -replace '\s+',' ').Trim()
        $findings.Add([pscustomobject]@{ type='suspicious_css_empty_rule'; severity='low'; file=$FileRel; symbol=$sel; line=$line; detail='Bloque CSS vacío; posible código muerto o incompleto.' })
    }

    foreach ($m in ([regex]'!important').Matches($Text)) {
        $line = Get-LineFromIndex -Text $Text -Index $m.Index
        $findings.Add([pscustomobject]@{ type='suspicious_css_important'; severity='low'; file=$FileRel; symbol='!important'; line=$line; detail='Uso de !important; posible sobreescritura difícil de mantener.' })
    }

    foreach ($m in ([regex]'z-index\s*:\s*(\d+)').Matches($Text)) {
        $z = [int]$m.Groups[1].Value
        if ($z -ge 1000) {
            $line = Get-LineFromIndex -Text $Text -Index $m.Index
            $findings.Add([pscustomobject]@{ type='suspicious_css_high_zindex'; severity='medium'; file=$FileRel; symbol=('z-index:' + $z); line=$line; detail='z-index alto; revisar colisiones de capas.' })
        }
    }
}

foreach ($file in $cssFiles) {
    Add-CssSuspiciousFindings -Text (Get-Content -LiteralPath $file.FullName -Raw) -FileRel ($file.FullName.Replace($root.Path + '\\',''))
}
foreach ($file in $astroFiles) {
    $content = Get-Content -LiteralPath $file.FullName -Raw
    $rel = $file.FullName.Replace($root.Path + '\\','')
    foreach ($sm in ([regex]'(?is)<style[^>]*>(.*?)</style>').Matches($content)) {
        Add-CssSuspiciousFindings -Text $sm.Groups[1].Value -FileRel $rel
    }
}

$weights = @{ high=3; medium=2; low=1 }
$sorted = $findings | Sort-Object @{Expression={ $weights[$_.severity] }; Descending=$true}, file, line
$report = [pscustomobject]@{
    generatedAt=(Get-Date).ToString('o')
    scope=[pscustomobject]@{ astroFiles=$astroFiles.Count; cssFiles=$cssFiles.Count; totalFiles=$allFiles.Count }
    totals=[pscustomobject]@{
        findings=$sorted.Count
        unusedStyleClasses=($sorted | Where-Object type -eq 'unused_style_class_in_astro').Count
        unusedCssVariables=($sorted | Where-Object type -eq 'unused_css_variable').Count
        unusedAstroImports=($sorted | Where-Object type -eq 'unused_astro_import').Count
        suspiciousCssFragments=($sorted | Where-Object { $_.type -like 'suspicious_css_*' }).Count
    }
    countsByType=($sorted | Group-Object type | Sort-Object Count -Descending | ForEach-Object { [pscustomobject]@{ type=$_.Name; count=$_.Count } })
    findings=$sorted
}

$path = Join-Path $root 'audit_static_unused_round3.json'
$report | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $path -Encoding UTF8

Write-Output ("Reporte generado: " + $path)
Write-Output ("Resumen -> total=" + $report.totals.findings + "; clases_sin_uso=" + $report.totals.unusedStyleClasses + "; vars_sin_uso=" + $report.totals.unusedCssVariables + "; imports_sin_uso=" + $report.totals.unusedAstroImports + "; css_sospechoso=" + $report.totals.suspiciousCssFragments)
Write-Output 'Top 10 hallazgos (archivo | simbolo | linea):'
$sorted | Select-Object -First 10 | ForEach-Object { Write-Output ("- " + $_.file + " | " + $_.symbol + " | " + $_.line) }
