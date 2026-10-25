# ==============================================================================
# HACKATHON ONE-CLICK LAUNCHER
# Runs Backend (FastAPI on :8000) and Frontend (Vite on :5173) concurrently.
# ==============================================================================

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "[LAUNCH] Hackathon Full-Stack Development System" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Cyan

# 1. Activate Virtual Environment
if (Test-Path ".\.venv\Scripts\Activate.ps1") {
    Write-Host "[OK] Activating Python Virtual Environment (.venv)..." -ForegroundColor Yellow
    & ".\.venv\Scripts\Activate.ps1"
} else {
    Write-Host "[WARN] .venv not found! Please create it with: uv venv --python 3.12 .venv" -ForegroundColor Red
}

# 2. Start Backend in a background process / new window
Write-Host "[API] Starting FastAPI Backend on http://localhost:8000..." -ForegroundColor Green
$backendProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; .\.venv\Scripts\python.exe -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload" -PassThru

# 3. Start Frontend
Write-Host "[UI] Starting Frontend on http://localhost:5173..." -ForegroundColor Green
$frontendProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\frontend'; & 'C:\Users\vedan\AppData\Roaming\npm\pnpm.cmd' run dev" -PassThru

Write-Host "`n[READY] Both services have been launched!" -ForegroundColor Green
Write-Host "-> Frontend UI: http://localhost:5173" -ForegroundColor Cyan
Write-Host "-> Backend API Docs: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "-> Backend Health Check: http://localhost:8000/api/health" -ForegroundColor Cyan
