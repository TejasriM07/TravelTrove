# TravelTrove Deployment Guide

## Problem: Backend Running on Localhost

**Issue:** Backend was configured to listen on `localhost` which doesn't accept external connections when deployed on Render.

**Solution:** Changed server to listen on `0.0.0.0` (all interfaces) instead of `localhost`.

---

## What Was Fixed

### 1. Backend Server Configuration (`backend/src/index.js`)

**Before:**
```javascript
app.listen(PORT, () => {
  console.log(`🚀 Backend API running at http://localhost:${PORT}`);
});
```

**After:**
```javascript
app.listen(PORT, '0.0.0.0', () => {
  const host = process.env.NODE_ENV === 'production' ? 'production server' : `http://localhost:${PORT}`;
  console.log(`🚀 Backend API running at ${host}`);
});
```

**Why:** 
- `localhost` only listens on the machine itself
- `0.0.0.0` listens on ALL network interfaces
- Required for Render (and other cloud platforms) to access the service

### 2. Port Configuration (`render.yaml`)

**Changed:**
```yaml
PORT=3001  # ❌ Wrong
PORT=5000  # ✅ Correct
```

**Why:** 
- Keep consistent with your backend configuration
- Render will assign the actual external port automatically

---

## Deployment Checklist

### Backend Environment Variables (Set in Render Dashboard)

```
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
RAZORPAY_KEY_ID=your-key-id
RAZORPAY_KEY_SECRET=your-key-secret
FRONTEND_URL=https://your-frontend.netlify.app
```

### Frontend Environment Variables (Set in Netlify Dashboard)

```
REACT_APP_API_URL=https://your-backend.onrender.com
```

---

## How to Deploy

### Step 1: Push Changes to GitHub
```bash
git add -A
git commit -m "fix: Configure backend to listen on 0.0.0.0 for cloud deployment"
git push origin master
```

### Step 2: Deploy Backend (Render)
1. Go to https://dashboard.render.com
2. Select your TravelTrove backend service
3. Go to "Deploys"
4. Click "New Deploy"
5. Select "Latest Commit"
6. Wait for deployment to complete

### Step 3: Deploy Frontend (Netlify)
1. Go to https://app.netlify.com
2. Select your TravelTrove site
3. Trigger a new deploy:
   - Either: Push to GitHub (auto-deploy)
   - Or: Click "Trigger deploy" → "Deploy site"

### Step 4: Verify

**Backend Status:**
- Visit `https://your-backend.onrender.com` (should show Render banner)
- Check logs for: `🚀 Backend API running at production server`

**Frontend Status:**
- Visit `https://your-frontend.netlify.app`
- Open DevTools → Network tab
- Try to login or book a property
- Check that API calls go to your backend URL

---

## Common Issues & Fixes

### Issue: CORS Errors
**Solution:** Ensure `FRONTEND_URL` environment variable is set correctly in Render dashboard.

```javascript
// This is automatically added to allowedOrigins in backend/src/index.js
process.env.FRONTEND_URL  // e.g., https://your-frontend.netlify.app
```

### Issue: Backend shows "localhost" in production logs
**Solution:** The new code only shows `http://localhost:PORT` in development. In production, it shows "production server" because actual URL varies.

### Issue: Frontend can't connect to backend
**Solution:** 
1. Check that `REACT_APP_API_URL` is set in Netlify
2. Verify backend is running (check Render dashboard)
3. Check browser console for CORS errors
4. Ensure URLs don't have trailing slashes

---

## Architecture Overview

```
┌─────────────────────────────────────┐
│     Netlify (Frontend)              │
│  https://your-app.netlify.app       │
│                                     │
│  - React 18                         │
│  - Runs: npm start                  │
│                                     │
└────────────────────┬────────────────┘
                     │ API Calls
                     │ (REACT_APP_API_URL)
                     │
                     ▼
┌─────────────────────────────────────┐
│     Render (Backend)                │
│  https://your-backend.onrender.com  │
│                                     │
│  - Node.js + Express                │
│  - Listens on 0.0.0.0:5000          │
│  - Runs: npm start                  │
│                                     │
└────────────────────┬────────────────┘
                     │ Database
                     │ + Storage
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
   MongoDB       Cloudinary   Razorpay
  (Atlas)        (Images)    (Payments)
```

---

## Testing Your Deployment

### 1. Test Backend Connectivity
```bash
# In your browser console
fetch('https://your-backend.onrender.com/api/auth/me')
  .then(r => r.json())
  .then(d => console.log(d))
```

### 2. Test Full User Flow
1. Go to frontend URL
2. Register as a new user
3. Login
4. Try to list a property (should work with offline payment now!)
5. Logout and try to book as a guest

### 3. Check Production Logs
- **Render:** Dashboard → Service → Logs
- **Netlify:** Site → Deploys → Deploy logs

---

## Environment Variables Reference

| Variable | Backend | Frontend | Purpose |
|----------|---------|----------|---------|
| `NODE_ENV` | ✅ | ✅ | `production` or `development` |
| `PORT` | ✅ | ❌ | Backend port (5000) |
| `MONGODB_URI` | ✅ | ❌ | MongoDB connection string |
| `JWT_SECRET` | ✅ | ❌ | Secret for JWT tokens |
| `CLOUDINARY_*` | ✅ | ❌ | Image upload service |
| `RAZORPAY_*` | ✅ | ❌ | Payment processing |
| `FRONTEND_URL` | ✅ | ❌ | Frontend URL for CORS |
| `REACT_APP_API_URL` | ❌ | ✅ | Backend API base URL |

---

## Key Changes Made

1. ✅ Backend now listens on `0.0.0.0` (all interfaces)
2. ✅ Port set to 5000 consistently
3. ✅ Environment variables properly configured
4. ✅ CORS includes both localhost (dev) and production URLs

---

**Next Steps:**
1. Commit and push these changes
2. Set environment variables in Render dashboard
3. Trigger a new deployment
4. Test the full flow end-to-end
