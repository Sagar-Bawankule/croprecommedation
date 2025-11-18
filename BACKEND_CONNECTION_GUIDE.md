# Backend Connection Troubleshooting Guide

If you're seeing "Backend Service Unavailable" error in your Vercel deployment, follow these steps to diagnose and fix the issue.

## 1. Test Your Render Backend Directly

First, verify your backend is actually running and accessible:

1. Open your Render dashboard and check if your service is "Live"
2. Click on your backend service and note the URL (should look like `https://your-app-name.onrender.com`)
3. Try accessing this URL directly in your browser
4. Also try accessing `https://your-app-name.onrender.com/docs` to see FastAPI's built-in documentation

If these URLs don't work, your backend isn't running. Check Render logs for errors.

## 2. Test with the Backend Test Tool

1. Open the `backend_test.html` file in your project
2. Edit the file and replace `REPLACE_WITH_YOUR_RENDER_URL` with your actual Render URL
3. Open the HTML file in your browser
4. Click "Test Backend Connection" and check the results

## 3. Check Environment Variables on Vercel

1. Go to your Vercel dashboard → Project → Settings → Environment Variables
2. Verify `REACT_APP_API_URL` is set to your **exact** Render backend URL
3. Make sure it has no trailing slashes (e.g., use `https://app.onrender.com` not `https://app.onrender.com/`)
4. Ensure this variable is enabled for **all environments** (Production, Preview, Development)
5. If you made any changes, redeploy your application

## 4. Check Browser Console for CORS Errors

1. Open your deployed Vercel application
2. Right-click → Inspect → Console
3. Look for any CORS-related errors (containing "CORS" or "Access-Control-Allow-Origin")
4. If you see CORS errors, verify your backend has proper CORS settings:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or specifically your Vercel domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 5. Test with Curl or Postman

```bash
# Test your backend API with curl
curl -v https://your-render-backend.onrender.com/
```

## 6. Common Issues and Solutions

### Backend Takes Too Long to Respond

Render free tier spins down after 15 minutes of inactivity. The first request may take 30-60 seconds to "wake up" the service. Subsequent requests will be fast. Solutions:

1. Be patient with the first request
2. Use a service like UptimeRobot to ping your backend every 14 minutes
3. Upgrade to Render's paid tier

### CORS Issues

If you see CORS errors even with proper middleware:

1. Make sure `allow_origins` includes your Vercel domain or uses `["*"]`
2. Check if your Vercel domain has a trailing slash that doesn't match the CORS setting
3. Try adding specific headers if needed

### Wrong API URL Format

Ensure your `REACT_APP_API_URL` follows these rules:

- No trailing slash
- Includes protocol (`https://` not just `your-app.onrender.com`)
- No path segments (unless your API is nested)

### Render Free Tier Limitations

Be aware of Render's free tier limitations:

- 750 hours/month
- Spins down after 15 minutes of inactivity
- Limited resources

## 7. Final Checks

1. Verify both frontend and backend are deployed and running
2. Check Vercel environment variables are set correctly
3. Test API connections directly before testing through the frontend
4. Check browser console for any JavaScript errors
5. Clear browser cache and try again

If all else fails, consider setting up a cron job to keep your Render backend alive, or explore other backend hosting options.