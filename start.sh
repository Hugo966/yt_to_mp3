#!/bin/bash

echo "============================================"
echo " YouTube to MP3 Converter - Local Setup"
echo "============================================"
echo ""

# Check if backend virtual environment exists
if [ ! -d "backend/venv" ]; then
    echo "[SETUP] Creating Python virtual environment..."
    cd backend
    python3 -m venv venv
    source venv/bin/activate
    echo "[SETUP] Installing Python dependencies..."
    pip install -r requirements.txt
    cd ..
    echo ""
    echo "[SUCCESS] Backend setup complete!"
    echo ""
else
    echo "[OK] Backend virtual environment found."
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "[SETUP] Installing Node.js dependencies..."
    npm install
    echo ""
    echo "[SUCCESS] Frontend setup complete!"
    echo ""
else
    echo "[OK] Node modules found."
fi

# Check if .env files exist
if [ ! -f "backend/.env" ]; then
    echo "[WARNING] backend/.env not found!"
    echo "Please copy backend/.env.example to backend/.env and configure it."
    echo ""
fi

if [ ! -f ".env.local" ]; then
    echo "[WARNING] .env.local not found!"
    echo "Please copy .env.example to .env.local"
    echo ""
fi

echo "============================================"
echo " Starting Services"
echo "============================================"
echo ""
echo "Starting backend on http://localhost:8000"
echo "Starting frontend on http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop both services"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "Stopping services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

# Start backend in background
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8000 &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend
npm run dev &
FRONTEND_PID=$!

# Wait for both processes
wait
