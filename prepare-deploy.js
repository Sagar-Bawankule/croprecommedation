#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Crop Recommendation System - Vercel Deployment Script');
console.log('='.repeat(60));

// Check if we're in the right directory
if (!fs.existsSync('frontend/package.json')) {
    console.error('❌ Error: Please run this script from the project root directory');
    process.exit(1);
}

try {
    console.log('📦 Installing dependencies...');
    execSync('cd frontend && npm install', { stdio: 'inherit' });

    console.log('🔧 Building production version...');
    execSync('cd frontend && npm run build', { stdio: 'inherit' });

    console.log('✅ Build successful!');
    console.log('');
    console.log('🎯 Next Steps:');
    console.log('1. Deploy backend to Railway/Render (see BACKEND_DEPLOYMENT_GUIDE.md)');
    console.log('2. Get your backend URL');
    console.log('3. Run: vercel --prod');
    console.log('4. Set REACT_APP_API_URL in Vercel dashboard');
    console.log('');
    console.log('📖 See DEPLOYMENT_CHECKLIST.md for complete guide');

} catch (error) {
    console.error('❌ Deployment preparation failed:', error.message);
    process.exit(1);
}