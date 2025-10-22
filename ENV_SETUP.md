# Environment Setup Guide

## Overview

The TravelTrove application uses environment variables for configuration, making it easy to deploy across different environments (development, staging, production).

## How It Works

### Frontend
- **API URL** comes from `REACT_APP_API_URL` environment variable
- **Fallback:** If not set, defaults to `http://localhost:5000` (local development)
- **Location:** `frontend/src/utils/api.js`

### Backend
- **Port** comes from `PORT` environment variable (default: 5000)
- **Database** comes from `MONGO_URI` or `MONGODB_URI` environment variable
- **CORS** is configured to accept requests from `FRONTEND_URL` environment variable
- **Location:** `backend/src/index.js`

## Local Development Setup

### Step 1: Create .env files

**Backend (.env):**
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/travel_trove
JWT_SECRET=your_secret_key_here
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

**Frontend (.env):**
```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:
```
REACT_APP_API_URL=http://localhost:5000
NODE_ENV=development
```

### Step 2: Run locally

**Terminal 1 (Backend):**
```bash
cd backend
npm install
npm run dev
# Output: Server running on port 5000
# CORS enabled for: http://localhost:3000, http://localhost:5000, http://127.0.0.1:3000
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm install
npm start
# Output: Compiled successfully!
# Local: http://localhost:3000
```

## Production Deployment Setup

### For Render.com (Backend)

Create environment variables in Render dashboard:

```
PORT=3001
NODE_ENV=production
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/traveltrove
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/traveltrove
JWT_SECRET=generate_a_very_secure_random_secret_here
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
FRONTEND_URL=https://your-frontend-domain.netlify.app
```

### For Netlify (Frontend)

Create environment variables in Netlify dashboard:

```
REACT_APP_API_URL=https://your-backend.onrender.com
NODE_ENV=production
```

### For Other Platforms

**Example for Vercel:**

**Frontend (.env.production):**
```
REACT_APP_API_URL=https://your-backend-api.com
```

**Backend (.env.production):**
```
PORT=3001
NODE_ENV=production
MONGO_URI=your_mongodb_connection_string
FRONTEND_URL=https://your-frontend.vercel.app
# ... other variables
```

## Environment Variables Reference

### Frontend Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `REACT_APP_API_URL` | Backend API base URL | `http://localhost:5000` or `https://api.example.com` |
| `NODE_ENV` | Environment type | `development` or `production` |

### Backend Variables

| Variable | Purpose | Example |
|----------|---------|---------|
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment type | `development` or `production` |
| `MONGO_URI` | MongoDB local connection | `mongodb://127.0.0.1:27017/travel_trove` |
| `MONGODB_URI` | MongoDB cloud connection | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `JWT_SECRET` | JWT signing key | Generate with: `openssl rand -base64 32` |
| `JWT_EXPIRES_IN` | JWT token expiry | `90d` |
| `JWT_COOKIE_EXPIRES_IN` | Cookie expiry (days) | `90` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account name | Your cloudinary name |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Your API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Your API secret |
| `RAZORPAY_KEY_ID` | Razorpay public key | Your Razorpay key |
| `RAZORPAY_KEY_SECRET` | Razorpay secret key | Your Razorpay secret |
| `FRONTEND_URL` | Frontend domain (for CORS) | `http://localhost:3000` or `https://example.com` |

## Deployment Workflow

### Step 1: Local Development
1. Create `.env` files from `.env.example`
2. Fill in values
3. Run `npm install` and `npm run dev` (backend) and `npm start` (frontend)
4. Test locally

### Step 2: Push to GitHub
```bash
git add .
git commit -m "Setup with environment variables"
git push origin master
```

### Step 3: Deploy Backend
1. Go to Render.com
2. Create Web Service
3. Connect GitHub repo
4. Set build: `npm install`
5. Set start: `node src/index.js`
6. Add all environment variables
7. Deploy

### Step 4: Deploy Frontend
1. Go to Netlify
2. Connect GitHub repo
3. Set build: `npm run build`
4. Set publish: `build`
5. Add `REACT_APP_API_URL` pointing to deployed backend
6. Deploy

### Step 5: Verify
1. Check backend logs: `CORS enabled for: ...`
2. Check frontend console: `API Base URL: ...`
3. Test API calls work

## Troubleshooting

### "Cannot GET /api/..."
- Backend is not running
- Check `PORT` environment variable
- Verify backend is accessible

### "CORS error"
- `FRONTEND_URL` not set on backend
- Frontend URL not in CORS allowed origins
- Add frontend URL to `CORS` configuration

### "Cannot connect to MongoDB"
- `MONGO_URI` or `MONGODB_URI` not set
- Connection string is incorrect
- Network/IP whitelist issue on MongoDB Atlas

### "API URL not found"
- `REACT_APP_API_URL` not set
- Frontend not rebuilt after changing env vars
- Restart dev server after changing `.env`

## Security Best Practices

1. **Never commit .env files** - Already in `.gitignore`
2. **Use strong JWT secrets** - `openssl rand -base64 32`
3. **Use environment-specific secrets** - Different values for dev/prod
4. **Rotate secrets regularly** - Update in deployment platforms
5. **Restrict CORS origins** - Only allow your frontend domain
6. **Use HTTPS in production** - All connections encrypted
7. **Enable MongoDB IP whitelist** - Only allow your app servers

## Quick Reference

### Generate Secure JWT Secret
```bash
openssl rand -base64 32
# Output: aBcDeFgHiJkLmNoPqRsTuVwXyZ123456+/=
```

### Test API Connection
```bash
# From frontend terminal
curl http://localhost:5000/api/auth/me -H "Authorization: Bearer YOUR_TOKEN"
```

### Check Logs

**Backend (Render):**
- Dashboard → Your Service → Logs

**Frontend (Netlify):**
- Dashboard → Deploys → Deploy logs and errors

---

**All set!** Your application is now configured to work seamlessly across development and production environments. 🚀
