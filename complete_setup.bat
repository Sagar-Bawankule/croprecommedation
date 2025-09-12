@echo off
REM Complete setup script that trains models and sets up the entire system

echo 🌾 Complete Setup - Intelligent Crop Recommendation System
echo.

REM Step 1: Train the ML model first
echo 📚 Step 1: Training ML model...
if exist "train_model.py" (
    echo Training RandomForest model...
    python train_model.py
    if %errorlevel% equ 0 (
        echo ✅ Model training completed
    ) else (
        echo ❌ Model training failed
        pause
        exit /b 1
    )
) else (
    echo ❌ train_model.py not found. Please ensure you have the training script.
    pause
    exit /b 1
)

REM Step 2: Copy ML models to backend
echo 📋 Step 2: Copying ML models to backend...
if exist "randomforest_model.pkl" (
    copy randomforest_model.pkl backend\
    copy scaler.pkl backend\
    copy label_encoder.pkl backend\
    echo ✅ ML models copied to backend
) else (
    echo ❌ ML model files not generated. Check training step.
    pause
    exit /b 1
)

REM Step 3: Setup backend
echo 🔧 Step 3: Setting up backend...
cd backend

REM Create virtual environment
python -m venv venv
call venv\Scripts\activate.bat

REM Install dependencies
pip install -r requirements.txt
echo ✅ Backend setup complete

REM Step 4: Setup frontend
echo 🎨 Step 4: Setting up frontend...
cd ..\frontend
npm install
echo ✅ Frontend setup complete

echo.
echo 🎉 Complete setup finished successfully!
echo.
echo 🚀 To start the application:
echo.
echo 1. Open first terminal and run:
echo    cd backend
echo    python main.py
echo.
echo 2. Open second terminal and run:
echo    cd frontend
echo    npm start
echo.
echo 🌐 Access points:
echo - Frontend: http://localhost:3000
echo - Backend API: http://localhost:8000
echo - API Docs: http://localhost:8000/docs
echo.
echo Happy farming! 🚜🌱

pause
