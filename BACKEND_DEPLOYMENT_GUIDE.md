# 🔧 Backend Deployment Options

Since Vercel has limitations with full-stack Python applications, here are the best options to deploy your FastAPI backend:

## 🚀 Option 1: Railway (Recommended - Free Tier)

### Steps:
1. Go to [Railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "Deploy from GitHub repo"
4. Select your repository
5. Choose "Deploy from a folder" → `backend`
6. Railway will auto-detect it's a Python app
7. Your API will be available at: `https://your-app.railway.app`

### Railway Configuration:
- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Python Version**: 3.9
- **Build Command**: `pip install -r requirements.txt`

## 🚀 Option 2: Render (Free Tier Available)

### Steps:
1. Go to [Render.com](https://render.com)
2. Connect GitHub account
3. Click "New Web Service"
4. Select your repository
5. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

## 🚀 Option 3: Heroku (Paid Only Now)

### Setup Files Needed:

Create `backend/Procfile`:
```
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

Create `backend/runtime.txt`:
```
python-3.9.18
```

### Deployment:
```bash
# Install Heroku CLI, then:
cd backend
heroku create your-crop-api
git subtree push --prefix=backend heroku main
```

## 🚀 Option 4: DigitalOcean App Platform

1. Go to DigitalOcean → App Platform
2. Connect GitHub repository
3. Select "backend" folder
4. Choose Python app type
5. Configure build/run commands

## 🔧 Quick Setup Script

Run this in your `backend` folder to prepare for deployment:

```bash
# Add to backend/requirements.txt if not present
echo "fastapi==0.104.1" >> requirements.txt
echo "uvicorn[standard]==0.24.0" >> requirements.txt

# Create Procfile for Heroku
echo "web: uvicorn main:app --host 0.0.0.0 --port \$PORT" > Procfile

# Create runtime.txt
echo "python-3.9.18" > runtime.txt
```

## 🔐 Environment Variables

Set these on your chosen platform:

```
PYTHONPATH=.
ENVIRONMENT=production
```

## 🌐 Update Frontend

After backend deployment, update your frontend environment:

In `frontend/.env.production`:
```
REACT_APP_API_URL=https://your-backend-url.railway.app
```

Then redeploy frontend to Vercel:
```bash
vercel --prod
```

## ✅ Verification

Test your deployed backend:
```bash
curl https://your-backend-url.railway.app/
# Should return: {"message": "Crop Recommendation API is running", "status": "healthy"}
```

---

## 🎯 Recommended Flow:

1. **Deploy Backend to Railway** (easiest, free)
2. **Get backend URL** (e.g., `https://crop-api-production.up.railway.app`)
3. **Update frontend** environment variable
4. **Redeploy frontend** to Vercel

Your full-stack app will be:
- **Frontend**: `https://crop-recommendation.vercel.app`
- **Backend**: `https://crop-api.railway.app`