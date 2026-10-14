@echo off
echo ===================================================
echo     Hackathon Team Workspace Bootstrap Script
echo ===================================================
echo.

echo [1/3] Setting up Python virtual environment...
if not exist ".venv" (
    py -m venv .venv
    echo Virtual environment created (.venv).
) else (
    echo Virtual environment already exists.
)

call .venv\Scripts\activate.bat

echo.
echo [2/3] Installing backend dependencies...
cd backend
pip install -r requirements.txt
cd ..

echo.
echo [3/3] Installing frontend dependencies...
cd frontend
if exist package.json (
    call npm install
)
cd ..

echo.
echo ===================================================
echo Workspace setup complete!
echo To run backend: cd backend ^& uvicorn app.main:app --reload
echo To run frontend: cd frontend ^& npm run dev
echo ===================================================
pause
