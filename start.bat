@echo off
echo ============================================
echo  YouTube to MP3 Converter - Local Setup
echo ============================================
echo.

REM Check if backend virtual environment exists
if not exist "backend\venv" (
    echo [SETUP] Creating Python virtual environment...
    cd backend
    python -m venv venv
    call venv\Scripts\activate
    echo [SETUP] Installing Python dependencies...
    pip install -r requirements.txt
    cd ..
    echo.
    echo [SUCCESS] Backend setup complete!
    echo.
) else (
    echo [OK] Backend virtual environment found.
)

REM Check if node_modules exists
if not exist "node_modules" (
    echo [SETUP] Installing Node.js dependencies...
    npm install
    echo.
    echo [SUCCESS] Frontend setup complete!
    echo.
) else (
    echo [OK] Node modules found.
)

REM Check if .env files exist
if not exist "backend\.env" (
    echo [WARNING] backend\.env not found!
    echo Please copy backend\.env.example to backend\.env and configure it.
    echo.
)

if not exist ".env.local" (
    echo [WARNING] .env.local not found!
    echo Please copy .env.example to .env.local
    echo.
)

echo ============================================
echo  Starting Services
echo ============================================
echo.
echo Starting backend on http://localhost:8000
echo Starting frontend on http://localhost:5173
echo.
echo Press Ctrl+C to stop both services
echo.

REM Start backend in new window
start "YT to MP3 - Backend" cmd /k "cd backend && venv\Scripts\activate && uvicorn main:app --reload --port 8000"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend in current window
npm run dev
