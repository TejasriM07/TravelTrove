# 502 Error Troubleshooting Guide

## Problem
Getting a **502 Bad Gateway** error when accessing the deployed backend on Render.

## Root Causes

### 1. MongoDB Connection Failure ❌
**Previous Issue:** Server was waiting for MongoDB to connect before starting. If connection failed, server never started → 502 error.

**Fix Applied:** 
- Server now starts immediately WITHOUT waiting for MongoDB
- MongoDB connection happens in the background (non-blocking)
- Health check endpoint (`/health`) returns status even if DB is down

### 2. Environment Variables Not Set
**Issue:** Missing critical environment variables on Render dashboard.

**Solution:**
```
MONGODB_URI=your_connection_string
JWT_SECRET=your_secret
CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
RAZORPAY_KEY_ID=your_id
RAZORPAY_KEY_SECRET=your_secret
FRONTEND_URL=https://your-frontend.netlify.app
NODE_ENV=production
PORT=5000
```

### 3. Port Not Correctly Bound
**Issue:** Server listening on wrong interface or port.

**Fix Applied:**
- Changed from `app.listen(PORT)` to `app.listen(PORT, '0.0.0.0')`
- This allows server to accept connections from any interface (required for cloud)

---

## How to Debug 502 Error

### Step 1: Check Backend Health Endpoint
```bash
# Open in browser or curl
https://traveltrove-56f3.onrender.com/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "message": "Backend is running",
  "mongoConnected": true/false
}
```

- ✅ If you see this → Backend is running
- ❌ If you see 502 → Server crashed or won't start

### Step 2: Check Root Endpoint
```bash
https://traveltrove-56f3.onrender.com/
```

**Expected Response:**
```json
{
  "message": "TravelTrove Backend API",
  "status": "running"
}
```

### Step 3: Check Render Logs
1. Go to https://dashboard.render.com
2. Click on your `travel-trove-backend` service
3. Click "Logs"
4. Look for error messages

**Common Log Messages:**

✅ Good:
```
🚀 Backend API running at production server
✅ Connected to MongoDB
```

❌ Bad:
```
❌ Failed to connect to MongoDB: connection refused
```

### Step 4: Verify Environment Variables
1. Go to Render dashboard
2. Click your service → "Environment"
3. Check all required variables are set
4. Trigger a new deploy after adding/changing variables

---

## Quick Fixes (in order)

### Fix #1: Add Missing Environment Variables
1. Open Render dashboard
2. Go to Environment variables
3. Add all missing vars from the table above
4. Click "Deploy" or trigger manual deploy

### Fix #2: Restart the Service
1. Render dashboard → Your service
2. Click "Deploys"
3. Click "Reroll" on the latest deployment
4. Wait for new deploy to complete

### Fix #3: Check Logs for Specific Errors
Look for patterns:
- `ECONNREFUSED` → Can't connect to MongoDB
- `Cannot find module` → Missing dependency
- `CORS error` → Frontend URL not in CORS list
- `JWT error` → JWT_SECRET not set

### Fix #4: Force a Fresh Deploy
```bash
# On your local machine
git add -A
git commit -m "fix: Backend startup improvements"
git push origin master
# Render will auto-deploy
```

---

## Testing the Fix

### 1. Test Health Endpoint First
```bash
curl https://traveltrove-56f3.onrender.com/health
```

Should return immediately without 502 error.

### 2. Test API Endpoints
```bash
curl https://traveltrove-56f3.onrender.com/api/auth/me
```

If this returns 401/403 (not 502), the backend is working!

### 3. Test from Frontend
Go to https://your-frontend.netlify.app and:
- Open DevTools → Network tab
- Try to login
- API calls should NOT show 502 errors

---

## Key Changes Made

### `backend/src/index.js`

**Before:**
```javascript
mongoose.connect(MONGO_URI, {...})
.then(() => {
  app.listen(PORT, () => { ... });  // Only starts after DB connects
})
.catch(err => {
  process.exit(1);  // Server crashes if DB fails
});
```

**After:**
```javascript
// Start server immediately
const server = app.listen(PORT, '0.0.0.0', () => { ... });

// Connect to MongoDB in background (non-blocking)
mongoose.connect(MONGO_URI, {...})
.then(() => { console.log('Connected'); })
.catch(err => { console.warn('DB failed but server running'); });
```

### New Endpoints

**GET `/health`**
```json
{
  "status": "ok",
  "message": "Backend is running",
  "mongoConnected": true/false
}
```

**GET `/`**
```json
{
  "message": "TravelTrove Backend API",
  "status": "running"
}
```

These endpoints don't need MongoDB, so they'll work even if DB is down!

---

## Prevention

### 1. Set Environment Variables BEFORE Deploy
- Don't deploy without all required env vars
- Render won't show 502 if vars are set correctly

### 2. Use Non-Blocking MongoDB Connection
- ✅ Server starts even if DB fails
- ✅ Graceful degradation
- ✅ Better error messages

### 3. Monitor Logs
- Check Render logs after every deploy
- Set up alerts for errors

### 4. Test Health Check Regularly
- After deployment, immediately test `/health` endpoint
- Add to post-deploy checklist

---

## Still Getting 502?

### Common Issues:

**Issue: MongoDB Atlas IP Whitelist**
- Solution: Add Render IP to MongoDB Atlas whitelist
- Go to MongoDB Atlas → Security → IP Whitelist → Add 0.0.0.0/0

**Issue: MONGODB_URI format incorrect**
- Must be: `mongodb+srv://user:pass@cluster.mongodb.net/dbname`
- NOT: `mongodb://...` (old format)

**Issue: Port already in use**
- Render assigns ports, so this shouldn't happen
- But if you see "EADDRINUSE", check PORT env var

**Issue: Node version mismatch**
- Render uses latest Node by default
- Should be fine, but check if needed

---

## Checklist for 502 Fix

- [ ] Backend deployed to Render
- [ ] All environment variables set in Render dashboard
- [ ] Test `/health` endpoint returns 200
- [ ] Test `/` endpoint returns 200
- [ ] MONGODB_URI is set and correct
- [ ] Frontend REACT_APP_API_URL points to Render backend
- [ ] FRONTEND_URL env var set in backend (for CORS)
- [ ] Logs show "Backend API running" (no errors)
- [ ] Can make API calls from frontend

---

## Support

If 502 persists:
1. Check Render logs for specific error message
2. Verify all environment variables one more time
3. Try the "Reroll" deploy option
4. Force a new git push to trigger fresh deploy
