@echo off
REM Start script for the backend server

echo 🚀 Starting Intelligent Crop Recommendation System Backend...

REM Check if we're in the correct directory
if not exist "main.py" (
    echo ❌ Please run this script from the backend directory
    exit /b 1
)

REM Check if virtual environment exists
if not exist "venv" (
    echo ❌ Virtual environment not found. Please run setup script first.
    exit /b 1
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Check if ML models exist
if not exist "randomforest_model.pkl" (
    echo ⚠️  ML model files not found in backend directory.
    echo    Please copy the model files or train them first.
    echo    Expected files: randomforest_model.pkl, scaler.pkl, label_encoder.pkl
)

REM Start the server
echo Starting FastAPI server on http://localhost:8000...
echo API Documentation will be available at http://localhost:8000/docs
echo.
echo Press Ctrl+C to stop the server
echo.

python main.py
