#!/bin/bash

# Start script for the backend server

echo "🚀 Starting Intelligent Crop Recommendation System Backend..."

# Check if we're in the correct directory
if [ ! -f "main.py" ]; then
    echo "❌ Please run this script from the backend directory"
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found. Please run setup script first."
    exit 1
fi

# Activate virtual environment
echo "Activating virtual environment..."
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    source venv/Scripts/activate
else
    source venv/bin/activate
fi

# Check if ML models exist
if [ ! -f "randomforest_model.pkl" ]; then
    echo "⚠️  ML model files not found in backend directory."
    echo "   Please copy the model files or train them first."
    echo "   Expected files: randomforest_model.pkl, scaler.pkl, label_encoder.pkl"
fi

# Start the server
echo "Starting FastAPI server on http://localhost:8000..."
echo "API Documentation will be available at http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

python main.py
