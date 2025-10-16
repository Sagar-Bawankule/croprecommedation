# ✅ Vercel Deployment Checklist

## 📋 Pre-Deployment

- [x] Frontend builds successfully (`npm run build`)
- [x] Vercel configuration created (`vercel.json`)
- [x] Environment files configured
- [x] Backend deployment guides created
- [x] CORS settings documented

## 🚀 Deployment Steps

### Step 1: Deploy Backend (Choose One)
- [ ] **Railway** (Recommended): Deploy `backend` folder to Railway
- [ ] **Render**: Deploy backend as web service
- [ ] **Heroku**: Use git subtree to deploy backend
- [ ] **Other**: DigitalOcean, PythonAnywhere, etc.

#### Get Your Backend URL:
```
Backend URL: https://your-backend-name.railway.app
```

### Step 2: Deploy Frontend to Vercel
```bash
# Install Vercel CLI (if not installed)
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from project root
vercel

# Follow prompts:
# - Set up and deploy? Y
# - Which scope? (your account)
# - Link to existing project? N
# - Project name: crop-recommendation-system
# - In which directory is your code located? ./frontend
```

### Step 3: Configure Environment Variables
In Vercel Dashboard → Your Project → Settings → Environment Variables:

```
REACT_APP_API_URL = https://your-backend-url.railway.app
GENERATE_SOURCEMAP = false
CI = false
```

### Step 4: Deploy Production
```bash
vercel --prod
```

## 🔧 Configuration Files Created

### ✅ Vercel Configuration (`vercel.json`)
```json
{
  "version": 2,
  "name": "crop-recommendation-system",
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/frontend/build/$1"
    }
  ],
  "outputDirectory": "frontend/build",
  "installCommand": "cd frontend && npm install",
  "buildCommand": "cd frontend && npm run build"
}
```

### ✅ Frontend Environment (`.env.production`)
```
REACT_APP_API_URL=https://your-app-name.vercel.app/api
GENERATE_SOURCEMAP=false
CI=false
```

### ✅ Backend Files for Deployment
- `backend/Procfile` - Process file for Heroku/Railway
- `backend/runtime.txt` - Python version specification
- `backend/requirements.txt` - Updated with versions

## 🧪 Testing

### Local Testing
```bash
# Test frontend build
cd frontend
npm run build
npx serve -s build

# Test backend
cd backend
uvicorn main:app --reload
```

### Production Testing
After deployment, test these endpoints:

#### Frontend
- [ ] `https://your-app.vercel.app` - Main application loads
- [ ] Forms work correctly
- [ ] Maps display properly
- [ ] Responsive design works

#### Backend
- [ ] `https://your-backend.railway.app/` - Health check
- [ ] `https://your-backend.railway.app/docs` - API documentation
- [ ] POST requests work from frontend

## 🐛 Troubleshooting

### Common Issues:

#### Build Errors
```bash
# Clear cache and rebuild
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### API Connection Issues
1. Check CORS settings in backend
2. Verify environment variables in Vercel
3. Test API endpoints directly
4. Check browser console for errors

#### Deployment Failures
1. Check Vercel deployment logs
2. Verify build commands in `vercel.json`
3. Ensure Node.js version compatibility

### Debug Commands:
```bash
# Check Vercel logs
vercel logs

# Test API connection
curl https://your-backend-url.railway.app/

# Local development
npm start  # Frontend
uvicorn main:app --reload  # Backend
```

## 🎯 Final URLs

After successful deployment:

- **Frontend**: `https://crop-recommendation-system.vercel.app`
- **Backend**: `https://your-backend-name.railway.app`
- **API Docs**: `https://your-backend-name.railway.app/docs`

## 📞 Support Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)
- [React Deployment](https://create-react-app.dev/docs/deployment/)

---

## 🎉 Deployment Complete!

Your Crop Recommendation System is now live and ready to help farmers make data-driven decisions! 🌾