# E-Commerce Project Setup Script
# Usage: .\scripts\setup.ps1 [-SkipDocker] [-SkipMigrations]

param(
    [switch]$SkipDocker,
    [switch]$SkipMigrations
)

$ErrorActionPreference = "Stop"
$rootDir = Split-Path -Parent $PSScriptRoot

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  E-Commerce Project Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ---------------------------
# Check Prerequisites
# ---------------------------
Write-Host "[1/6] Checking prerequisites..." -ForegroundColor Yellow

# Check .NET SDK
$dotnetVersion = $null
try {
    $dotnetVersion = (dotnet --version 2>$null)
} catch {}

if (-not $dotnetVersion) {
    Write-Host "  ERROR: .NET SDK not found. Install from https://dotnet.microsoft.com/download" -ForegroundColor Red
    exit 1
}
$major = [int]($dotnetVersion.Split('.')[0])
if ($major -lt 8) {
    Write-Host "  ERROR: .NET 8+ required, found $dotnetVersion" -ForegroundColor Red
    exit 1
}
Write-Host "  .NET SDK: $dotnetVersion" -ForegroundColor Green

# Check Node.js
$nodeVersion = $null
try {
    $nodeVersion = (node --version 2>$null)
} catch {}

if (-not $nodeVersion) {
    Write-Host "  ERROR: Node.js not found. Install from https://nodejs.org/" -ForegroundColor Red
    exit 1
}
$nodeMajor = [int]($nodeVersion.TrimStart('v').Split('.')[0])
if ($nodeMajor -lt 18) {
    Write-Host "  ERROR: Node.js 18+ required, found $nodeVersion" -ForegroundColor Red
    exit 1
}
Write-Host "  Node.js: $nodeVersion" -ForegroundColor Green

# Check npm
$npmVersion = $null
try {
    $npmVersion = (npm --version 2>$null)
} catch {}

if (-not $npmVersion) {
    Write-Host "  ERROR: npm not found" -ForegroundColor Red
    exit 1
}
Write-Host "  npm: $npmVersion" -ForegroundColor Green

# Check Docker (optional)
if (-not $SkipDocker) {
    $dockerVersion = $null
    try {
        $dockerVersion = (docker --version 2>$null)
    } catch {}

    if (-not $dockerVersion) {
        Write-Host "  WARNING: Docker not found. Use -SkipDocker to skip Docker setup" -ForegroundColor DarkYellow
    } else {
        Write-Host "  Docker: $dockerVersion" -ForegroundColor Green
    }
}

Write-Host ""

# ---------------------------
# Environment File
# ---------------------------
Write-Host "[2/6] Setting up environment..." -ForegroundColor Yellow

$envFile = Join-Path $rootDir ".env"
$envExample = Join-Path $rootDir ".env.example"

if (-not (Test-Path $envFile)) {
    if (Test-Path $envExample) {
        Copy-Item $envExample $envFile
        Write-Host "  Created .env from .env.example" -ForegroundColor Green
        Write-Host "  IMPORTANT: Edit .env with your actual values" -ForegroundColor DarkYellow
    } else {
        Write-Host "  WARNING: .env.example not found, skipping" -ForegroundColor DarkYellow
    }
} else {
    Write-Host "  .env already exists, skipping" -ForegroundColor Green
}

Write-Host ""

# ---------------------------
# Backend Build
# ---------------------------
Write-Host "[3/6] Building backend..." -ForegroundColor Yellow

$solutionPath = Join-Path $rootDir "src\backend\ECommerce.slnx"
if (-not (Test-Path $solutionPath)) {
    $solutionPath = Join-Path $rootDir "src\backend\ECommerce.sln"
}

dotnet restore $solutionPath
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ERROR: dotnet restore failed" -ForegroundColor Red
    exit 1
}

dotnet build $solutionPath --no-restore
if ($LASTEXITCODE -ne 0) {
    Write-Host "  ERROR: dotnet build failed" -ForegroundColor Red
    exit 1
}

Write-Host "  Backend build successful" -ForegroundColor Green
Write-Host ""

# ---------------------------
# Frontend Install & Build
# ---------------------------
Write-Host "[4/6] Installing frontend dependencies..." -ForegroundColor Yellow

$frontendDir = Join-Path $rootDir "src\frontend\ecommerce-web"
Push-Location $frontendDir

npm install
if ($LASTEXITCODE -ne 0) {
    Pop-Location
    Write-Host "  ERROR: npm install failed" -ForegroundColor Red
    exit 1
}

Write-Host "  Frontend dependencies installed" -ForegroundColor Green
Pop-Location
Write-Host ""

# ---------------------------
# Docker (optional)
# ---------------------------
if (-not $SkipDocker -and $dockerVersion) {
    Write-Host "[5/6] Starting dev databases (Docker)..." -ForegroundColor Yellow

    $devCompose = Join-Path $rootDir "docker-compose.dev.yml"
    if (Test-Path $devCompose) {
        docker-compose -f $devCompose up -d
        if ($LASTEXITCODE -ne 0) {
            Write-Host "  WARNING: Docker compose failed. You may need to start databases manually" -ForegroundColor DarkYellow
        } else {
            Write-Host "  Dev databases started" -ForegroundColor Green
        }
    } else {
        Write-Host "  docker-compose.dev.yml not found, skipping" -ForegroundColor DarkYellow
    }
} else {
    Write-Host "[5/6] Skipping Docker setup" -ForegroundColor DarkYellow
}

Write-Host ""

# ---------------------------
# Database Migrations
# ---------------------------
if (-not $SkipMigrations) {
    Write-Host "[6/6] Running database migrations..." -ForegroundColor Yellow

    $apiProject = Join-Path $rootDir "src\backend\ECommerce.API"
    $infraProject = Join-Path $rootDir "src\backend\ECommerce.Infrastructure"

    # Check if dotnet-ef tool is installed
    $efVersion = $null
    try {
        $efVersion = (dotnet ef --version 2>$null)
    } catch {}

    if (-not $efVersion) {
        Write-Host "  Installing dotnet-ef tool..." -ForegroundColor DarkYellow
        dotnet tool install --global dotnet-ef 2>$null
    }

    dotnet ef database update --project $infraProject --startup-project $apiProject 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  WARNING: Migrations failed. Ensure the database is running and connection string is configured" -ForegroundColor DarkYellow
    } else {
        Write-Host "  Database migrations applied" -ForegroundColor Green
    }
} else {
    Write-Host "[6/6] Skipping database migrations" -ForegroundColor DarkYellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To start development:" -ForegroundColor White
Write-Host "  Backend:  cd src\backend\ECommerce.API && dotnet run" -ForegroundColor Gray
Write-Host "  Frontend: cd src\frontend\ecommerce-web && npm start" -ForegroundColor Gray
Write-Host ""
