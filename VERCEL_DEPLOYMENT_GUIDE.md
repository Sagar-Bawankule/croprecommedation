# 🚀 Vercel Deployment Guide

This comprehensive guide will help you deploy your Crop Recommendation System to Vercel.

## 📋 Deployment Options

### Option 1: Automated Deployment Script (Recommended)
Use our provided deployment script to automate the process:

```bash
# Run from project root directory
./deploy-to-vercel.bat
```

### Option 2: Manual Deployment Steps
Follow the manual steps outlined below for more control over the deployment.

## 🛠️ Pre-Deployment Setup

### 1. Install Node.js and NPM
Make sure you have [Node.js](https://nodejs.org/) installed on your system.

### 2. Install Vercel CLI
```bash
npm install -g vercel
```

### 3. Login to Vercel
```bash
vercel login
```

## 🚀 Manual Deployment Steps

### Step 1: Build Frontend
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Build the project
npm run build
```

### Step 2: Deploy to Vercel
```bash
# From project root directory
vercel

# Follow the prompts:
# - Set up and deploy? Y
# - Which scope? (select your account)
# - Link to existing project? N
# - Project name: crop-recommendation-system
# - In which directory is your code located? ./frontend
```

### Step 3: Set Environment Variables
After deployment, go to your Vercel dashboard:

1. Navigate to your project
2. Go to "Settings" > "Environment Variables"
3. Add the following variable:
   - Name: `REACT_APP_API_URL`
   - Value: `https://your-backend-url.com` (your deployed backend URL)
4. Save changes

### Step 4: Deploy to Production
```bash
vercel --prod
```

## 🔄 Updating Your Deployment

Whenever you make changes to your code:

1. Commit changes to your repository
2. Run `deploy-to-vercel.bat` or follow the manual steps again

## 🔧 Troubleshooting

### Build Errors
If you encounter build errors:

1. Check the error messages in the Vercel console
2. Verify your package.json has no missing or conflicting dependencies
3. Check that your vercel.json configuration is correct
4. Ensure all environment variables are properly set

### 404 Not Found Errors
For client-side routing issues:

1. Verify the `rewrites` configuration in vercel.json is correct
2. Ensure your React Router setup is properly configured

### API Connection Issues
If the frontend can't connect to the backend:

1. Verify the REACT_APP_API_URL is correctly set in Vercel
2. Check that your backend CORS settings allow requests from your Vercel domain
3. Test the backend endpoint directly to ensure it's working

## 🔗 Related Resources
- [Backend Deployment Guide](./BACKEND_DEPLOYMENT_GUIDE.md)
- [Vercel Documentation](https://vercel.com/docs)

## 🔧 Backend Deployment Options

### Option A: Railway (Free Tier Available)
1. Go to [Railway.app](https://railway.app)
2. Connect your GitHub repository
3. Deploy the `backend` folder
4. Set environment variables if needed
5. Get your backend URL

### Option B: Render (Free Tier Available)
1. Go to [Render.com](https://render.com)
2. Create new Web Service
3. Connect your GitHub repository
4. Set build command: `pip install -r requirements.txt`
5. Set start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Deploy from `backend` folder

### Option C: PythonAnywhere (Free Tier Available)
1. Upload your backend files
2. Set up virtual environment
3. Configure WSGI file
4. Set up domain

## 📁 Project Structure for Deployment

```
crop-recommendation-system/
├── frontend/           # React app (deploys to Vercel)
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── .env.production
├── backend/           # FastAPI app (separate deployment)
│   ├── main.py
│   ├── requirements.txt
│   └── services/
├── vercel.json       # Vercel configuration
└── README.md
```

## 🔑 Environment Variables

### Frontend (.env.production)
```
REACT_APP_API_URL=https://your-backend-url.com
GENERATE_SOURCEMAP=false
CI=false
```

### Backend
Set these on your backend hosting platform:
- Any API keys you're using
- Database URLs (if applicable)
- CORS_ORIGINS (set to your Vercel frontend URL)

## 🌐 Update CORS Settings

Update your backend `main.py` CORS settings:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-vercel-app.vercel.app",
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## ✅ Deployment Checklist

- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to chosen platform
- [ ] Environment variables set correctly
- [ ] CORS configured properly
- [ ] API endpoints tested
- [ ] Custom domain configured (optional)

## 🔍 Troubleshooting

### Common Issues:

1. **Build Errors**: Check Node.js version compatibility
2. **API Errors**: Verify environment variables and CORS settings
3. **404 Errors**: Check routing configuration in vercel.json

### Debug Commands:
```bash
# Check Vercel deployment logs
vercel logs

# Local testing
cd frontend && npm run build
```

## 🎯 Quick Deployment Commands

```bash
# 1. Deploy frontend to Vercel
cd frontend
vercel --prod

# 2. If you have Vercel project linked:
vercel deploy --prod
```

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify API endpoint connectivity
3. Test locally first with `npm run build`
4. Check browser console for errors

---

**🎉 Your Crop Recommendation System will be live at: `https://your-project-name.vercel.app`**