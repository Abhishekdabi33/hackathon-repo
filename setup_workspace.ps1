# Hackathon Team Workspace Bootstrap Script
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "    Hackathon Team Workspace Bootstrap Script      " -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Virtual Environment
Write-Host "[1/3] Checking Python virtual environment..." -ForegroundColor Yellow
if (-not (Test-Path ".venv")) {
    python -m venv .venv
    Write-Host "Virtual environment created at .venv" -ForegroundColor Green
} else {
    Write-Host "Virtual environment already exists." -ForegroundColor Green
}

# 2. Backend
Write-Host "`n[2/3] Installing backend dependencies..." -ForegroundColor Yellow
& .\.venv\Scripts\pip.exe install -r backendequirements.txt

# 3. Frontend
Write-Host "`n[3/3] Installing frontend dependencies..." -ForegroundColor Yellow
if (Test-Path "frontend\package.json") {
    Push-Location frontend
    npm install
    Pop-Location
}

Write-Host "`n===================================================" -ForegroundColor Green
Write-Host "Workspace setup complete!" -ForegroundColor Green
Write-Host "Backend: cd backend; uvicorn app.main:app --reload" -ForegroundColor Cyan
Write-Host "Frontend: cd frontend; npm run dev" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Green
