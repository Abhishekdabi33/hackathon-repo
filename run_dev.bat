@echo off
title Hermes AI Assistant - Full Stack Launcher
echo ==================================================
echo [LAUNCH] Hermes AI Assistant Development Launcher
echo ==================================================

cd /d "%~dp0"

echo [1/3] Starting FastAPI Backend on http://localhost:8000...
start "Hermes AI - FastAPI Backend" cmd /k "cd /d "%~dp0" && .venv\Scripts\python.exe scripts\run_backend.py"

echo [2/3] Starting Vite Frontend on http://localhost:5173...
start "Hermes AI - Vite Frontend" cmd /k "cd /d "%~dp0frontend" && pnpm run dev"

echo [3/3] Waiting for servers to initialize...
timeout /t 3 /nobreak >nul

echo [OPEN] Launching browser to http://localhost:5173...
start http://localhost:5173

echo.
echo ==================================================
echo [READY] All systems operational!
echo - Frontend:  http://localhost:5173
echo - Backend:   http://localhost:8000
echo - API Docs:  http://localhost:8000/docs
echo ==================================================
pause
