# 🚀 Vercel Deployment Guide

This guide will help you deploy your Crop Recommendation System to Vercel.

## 📋 Deployment Options

### Option 1: Frontend Only on Vercel (Recommended)
Deploy only the React frontend to Vercel and host the FastAPI backend separately.

### Option 2: Separate Backend Deployment
Deploy the backend to Railway, Render, or PythonAnywhere.

## 🛠️ Pre-Deployment Setup

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

## 🚀 Deploy Frontend to Vercel

### Step 1: Deploy
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

### Step 2: Set Environment Variables
After deployment, go to your Vercel dashboard and add:

```
REACT_APP_API_URL=https://your-backend-url.herokuapp.com
```

### Step 3: Redeploy
```bash
vercel --prod
```

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