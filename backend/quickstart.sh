#!/bin/bash
# Quick start script for SafeRaasta SOS Backend

echo "=== SafeRaasta SOS Backend Setup ==="
echo ""

# Check if we're in the backend directory
if [ ! -f "package.json" ]; then
    echo "Error: Please run this script from the backend directory"
    echo "Usage: cd backend && ./quickstart.sh"
    exit 1
fi

# Check Node.js installation
echo "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed"
    echo "Please install Node.js from https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v)
echo "✓ Node.js $NODE_VERSION installed"
echo ""

# Check .env file
echo "Checking environment configuration..."
if [ ! -f ".env" ]; then
    echo "Error: .env file not found"
    echo "Creating .env from template..."
    cp .env.example .env
    echo "⚠ Please edit .env file with your Retell API credentials"
    exit 1
fi

# Verify environment variables
source .env
if [ -z "$RETELL_API_KEY" ] || [ -z "$RETELL_AGENT_ID" ]; then
    echo "⚠ Warning: RETELL_API_KEY or RETELL_AGENT_ID not set in .env"
fi
echo "✓ Environment file configured"
echo ""

# Install dependencies
echo "Installing dependencies..."
if [ ! -d "node_modules" ]; then
    npm install
    if [ $? -ne 0 ]; then
        echo "Error: Failed to install dependencies"
        exit 1
    fi
    echo "✓ Dependencies installed"
else
    echo "✓ Dependencies already installed"
fi
echo ""

# Start server
echo "Starting SafeRaasta SOS Backend..."
echo "Server will run on http://localhost:${PORT:-3000}"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""
npm start
