#!/bin/bash

# Intelligent Crop Recommendation System - Setup Script
# This script sets up both backend and frontend components

echo "🌾 Setting up Intelligent Crop Recommendation System..."

# Check if Python is installed
if ! command -v python &> /dev/null; then
    echo "❌ Python is not installed. Please install Python 3.8+ first."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 14+ first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Setup Backend
echo "🔧 Setting up backend..."
cd backend

# Create virtual environment
echo "Creating Python virtual environment..."
python -m venv venv

# Activate virtual environment
echo "Activating virtual environment..."
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    source venv/Scripts/activate
else
    source venv/bin/activate
fi

# Install backend dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

echo "✅ Backend setup complete"

# Setup Frontend
echo "🎨 Setting up frontend..."
cd ../frontend

# Install frontend dependencies
echo "Installing Node.js dependencies..."
npm install

echo "✅ Frontend setup complete"

# Copy ML models (if they exist)
cd ..
if [ -f "randomforest_model.pkl" ]; then
    echo "📋 Copying ML model files to backend..."
    cp randomforest_model.pkl backend/
    cp scaler.pkl backend/
    cp label_encoder.pkl backend/
    echo "✅ ML models copied"
else
    echo "⚠️  ML model files not found. You'll need to train the model first."
    echo "   Run 'python train_model.py' in the root directory."
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start the application:"
echo "1. Start backend: cd backend && python main.py"
echo "2. Start frontend: cd frontend && npm start"
echo ""
echo "The application will be available at:"
echo "- Frontend: http://localhost:3000"
echo "- Backend API: http://localhost:8000"
echo "- API Documentation: http://localhost:8000/docs"
echo ""
echo "Enjoy smart farming! 🚜🌱"
