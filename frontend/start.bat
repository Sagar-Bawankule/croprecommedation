@echo off
REM Start script for the frontend development server

echo 🎨 Starting Intelligent Crop Recommendation System Frontend...

REM Check if we're in the correct directory
if not exist "package.json" (
    echo ❌ Please run this script from the frontend directory
    exit /b 1
)

REM Check if node_modules exists
if not exist "node_modules" (
    echo ❌ Dependencies not installed. Please run 'npm install' first.
    exit /b 1
)

REM Start the development server
echo Starting React development server on http://localhost:3000...
echo The application will automatically open in your browser
echo.
echo Press Ctrl+C to stop the server
echo.

npm start
