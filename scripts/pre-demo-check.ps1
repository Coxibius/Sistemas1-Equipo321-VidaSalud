param(
    [string]$BaseUrl = "http://localhost:5237/api"
)

$ErrorActionPreference = "Stop"
$repo = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$fallos = [System.Collections.Generic.List[string]]::new()

function Invoke-Check {
    param(
        [string]$Nombre,
        [scriptblock]$Accion
    )

    Write-Host "`n== $Nombre ==" -ForegroundColor Cyan
    try {
        & $Accion
        if ($LASTEXITCODE -is [int] -and $LASTEXITCODE -ne 0) {
            throw "Codigo de salida $LASTEXITCODE"
        }
        Write-Host "OK" -ForegroundColor Green
    }
    catch {
        $fallos.Add("$Nombre`: $($_.Exception.Message)")
        Write-Host "FALLO: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Invoke-Check "Compilacion backend" {
    Push-Location (Join-Path $repo "backend\VidaSalud.Api")
    try { dotnet build --no-restore } finally { Pop-Location }
}

Invoke-Check "Modelo EF sincronizado con migraciones" {
    Push-Location (Join-Path $repo "backend\VidaSalud.Api")
    try { dotnet ef migrations has-pending-model-changes --no-build } finally { Pop-Location }
}

Invoke-Check "TypeScript frontend" {
    $typescript = Join-Path $repo "frontend\node_modules\typescript\bin\tsc"
    if (-not (Test-Path -LiteralPath $typescript)) {
        throw "Falta frontend/node_modules. Ejecuta npm ci."
    }
    Push-Location (Join-Path $repo "frontend")
    try { node $typescript --noEmit } finally { Pop-Location }
}

Invoke-Check "Archivos locales sensibles no versionados" {
    Push-Location $repo
    try {
        $prohibidos = @(git ls-files | Select-String -Pattern '(^|/)(\.env|appsettings\.Development\.json)$|(^|/)(node_modules|bin|obj)/')
        if ($prohibidos.Count -gt 0) {
            throw "Se encontraron rutas sensibles o generadas: $($prohibidos -join ', ')"
        }
    }
    finally { Pop-Location }
}

Write-Host "`n== API local ==" -ForegroundColor Cyan
try {
    $health = Invoke-RestMethod "$BaseUrl/health" -TimeoutSec 3
    if ($health.status -eq "ok") {
        Write-Host "OK - API disponible" -ForegroundColor Green
    }
    else {
        Write-Host "ADVERTENCIA - respuesta inesperada" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "ADVERTENCIA - API apagada; inicia el backend antes del stand." -ForegroundColor Yellow
}

Write-Host "`n== Estado Git ==" -ForegroundColor Cyan
Push-Location $repo
try { git status --short } finally { Pop-Location }

if ($fallos.Count -gt 0) {
    Write-Host "`nRESULTADO: $($fallos.Count) verificacion(es) fallida(s)." -ForegroundColor Red
    $fallos | ForEach-Object { Write-Host "- $_" -ForegroundColor Red }
    exit 1
}

Write-Host "`nRESULTADO: verificaciones tecnicas aprobadas." -ForegroundColor Green
exit 0
