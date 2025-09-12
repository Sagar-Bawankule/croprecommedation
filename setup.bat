@echo off
REM Intelligent Crop Recommendation System - Windows Setup Script

echo 🌾 Setting up Intelligent Crop Recommendation System...

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed. Please install Python 3.8+ first.
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 14+ first.
    exit /b 1
)

echo ✅ Prerequisites check passed

REM Setup Backend
echo 🔧 Setting up backend...
cd backend

REM Create virtual environment
echo Creating Python virtual environment...
python -m venv venv

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install backend dependencies
echo Installing Python dependencies...
pip install -r requirements.txt

echo ✅ Backend setup complete

REM Setup Frontend
echo 🎨 Setting up frontend...
cd ..\frontend

REM Install frontend dependencies
echo Installing Node.js dependencies...
npm install

echo ✅ Frontend setup complete

REM Copy ML models (if they exist)
cd ..
if exist "randomforest_model.pkl" (
    echo 📋 Copying ML model files to backend...
    copy randomforest_model.pkl backend\
    copy scaler.pkl backend\
    copy label_encoder.pkl backend\
    echo ✅ ML models copied
) else (
    echo ⚠️  ML model files not found. You'll need to train the model first.
    echo    Run 'python train_model.py' in the root directory.
)

echo.
echo 🎉 Setup complete!
echo.
echo To start the application:
echo 1. Start backend: cd backend ^&^& python main.py
echo 2. Start frontend: cd frontend ^&^& npm start
echo.
echo The application will be available at:
echo - Frontend: http://localhost:3000
echo - Backend API: http://localhost:8000
echo - API Documentation: http://localhost:8000/docs
echo.
echo Enjoy smart farming! 🚜🌱

pause
