#!/bin/bash

# Start script for the frontend development server

echo "🎨 Starting Intelligent Crop Recommendation System Frontend..."

# Check if we're in the correct directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the frontend directory"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "❌ Dependencies not installed. Please run 'npm install' first."
    exit 1
fi

# Start the development server
echo "Starting React development server on http://localhost:3000..."
echo "The application will automatically open in your browser"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm start
