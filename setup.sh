#!/bin/bash

# Full-stack project setup script
# This script initializes both backend and frontend environments

set -e

echo "================================"
echo "Full-Stack Project Setup"
echo "================================"
echo ""

# Backend setup
echo "[1/4] Setting up backend environment..."
cd backend

# Create Python virtual environment
if [ ! -d "venv" ]; then
    python -m venv venv
    echo "Virtual environment created"
else
    echo "Virtual environment already exists"
fi

# Activate virtual environment
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" || "$OSTYPE" == "win32" ]]; then
    source venv/Scripts/activate
else
    source venv/bin/activate
fi

# Install Python dependencies
pip install --upgrade pip
pip install -r requirements.txt
echo "Backend dependencies installed"

cd ..
echo "[2/4] Backend setup complete"
echo ""

# Frontend setup
echo "[3/4] Setting up frontend environment..."
cd frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
else
    echo "Frontend dependencies already installed"
fi

echo "[4/4] Frontend setup complete"
cd ..
echo ""

echo "================================"
echo "Setup Complete!"
echo "================================"
echo ""
echo "Next steps:"
echo "1. Backend: cd backend && source venv/bin/activate && python app.py"
echo "2. Frontend: cd frontend && npm run dev"
echo ""
