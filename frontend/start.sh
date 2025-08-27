#!/bin/bash

echo "🚀 Starting Marketplace Frontend Setup..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found. Please run this script from the frontend directory."
    exit 1
fi

# Install dependencies
echo "📥 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully!"

# Check if backend is running
echo "🔍 Checking if backend is accessible..."
if curl -s http://localhost:8000/ > /dev/null 2>&1; then
    echo "✅ Backend is running on http://localhost:8000"
else
    echo "⚠️  Backend is not running on http://localhost:8000"
    echo "   Please start the FastAPI backend first:"
    echo "   cd .. && python run.py"
    echo ""
fi

echo ""
echo "🎯 Frontend setup complete! To start the development server:"
echo "   npm run dev"
echo ""
echo "📚 The frontend will be available at:"
echo "   http://localhost:3000"
echo ""
echo "🔗 Make sure your backend is running on:"
echo "   http://localhost:8000"
