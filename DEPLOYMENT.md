# TravelTrove Deployment Guide

## Deployment Options

### Option 1: Render.com (Recommended - Free Tier Available)

#### Backend Deployment

1. **Push code to GitHub** ✅ (Already done)

2. **Create Render account** at https://render.com

3. **Deploy Backend:**
   - Click "New" → "Web Service"
   - Connect GitHub repository
   - Set build command: `npm install` (in backend folder)
   - Set start command: `node src/index.js`
   - Add Environment Variables:
     ```
     PORT=3001
     NODE_ENV=production
     MONGODB_URI=your_mongodb_atlas_uri
     JWT_SECRET=your_secret_key
     CLOUDINARY_CLOUD_NAME=your_cloud_name
     CLOUDINARY_API_KEY=your_api_key
     CLOUDINARY_API_SECRET=your_api_secret
     RAZORPAY_KEY_ID=your_razorpay_key
     RAZORPAY_KEY_SECRET=your_razorpay_secret
     ```
   - Deploy!

4. **Deploy Frontend:**
   - Click "New" → "Web Service"
   - Connect GitHub repository
   - Set build command: `npm run build` (in frontend folder)
   - Set start command: `npm start` (in frontend folder)
   - Add Environment Variables:
     ```
     REACT_APP_API_URL=https://your-backend-url.onrender.com
     NODE_ENV=production
     ```
   - Deploy!

### Option 2: Netlify (Frontend Only)

Netlify is ideal for React frontend hosting.

1. **Connect Repository:**
   - Go to https://app.netlify.com
   - Click "New site from Git"
   - Select GitHub and choose your repository

2. **Build Settings:**
   - Build command: `npm run build`
   - Publish directory: `build`

3. **Environment Variables:**
   ```
   REACT_APP_API_URL=your_backend_api_url
   NODE_ENV=production
   ```

4. **Automatic Deployments:**
   - Every push to `master` branch triggers deployment

### Option 3: Vercel (Frontend & Backend)

Vercel supports both frontend and serverless functions.

1. **Deploy on Vercel Dashboard**
2. **Configure vercel.json** (optional)
3. **Backend as Serverless Functions** (optional)

## MongoDB Atlas Setup

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create cluster (M0 Free Tier)
4. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/database`
5. Add connection string to environment variables as `MONGODB_URI`

## Environment Variables Setup

### For Production (Render/Vercel):

**Backend (.env):**
```
PORT=3001
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/traveltrove
JWT_SECRET=generate_a_strong_random_secret
JWT_EXPIRES_IN=90d
JWT_COOKIE_EXPIRES_IN=90
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

**Frontend (.env):**
```
REACT_APP_API_URL=https://your-backend.onrender.com
NODE_ENV=production
```

## Local Development Setup

1. **Clone repository:**
   ```bash
   git clone https://github.com/TejasriM07/TravelTrove.git
   cd TravelTrove
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your local MongoDB and API keys
   npm run dev
   ```

3. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   npm start
   ```

## Troubleshooting

### Build Failed on Render

**Error: `npm install` failed**
- Solution: Ensure all dependencies are listed in `package.json`
- Check Node version compatibility

**Error: Port already in use**
- Solution: Set PORT in environment variables

### Frontend not connecting to Backend

**Error: CORS errors**
- Ensure backend has CORS enabled
- Check REACT_APP_API_URL environment variable

**Error: API calls failing**
- Verify REACT_APP_API_URL points to correct backend URL
- Check network tab in browser DevTools

### MongoDB Connection Issues

**Error: Cannot connect to MongoDB**
- Verify MONGODB_URI is correct
- Add your IP to MongoDB Atlas IP whitelist
- Check network connectivity

## Deployment Checklist

- [ ] Push code to GitHub
- [ ] Set up MongoDB Atlas
- [ ] Get Cloudinary credentials
- [ ] Get Razorpay credentials
- [ ] Deploy backend on Render/Vercel
- [ ] Deploy frontend on Netlify/Render/Vercel
- [ ] Set environment variables
- [ ] Test all features
- [ ] Monitor logs for errors
- [ ] Set up error tracking (optional - Sentry)

## Support

For issues during deployment:
1. Check environment variables are set correctly
2. Review deployment logs
3. Verify API endpoints are working
4. Check browser console for errors
5. Test locally first before deploying

## Next Steps

1. Configure your domain
2. Set up SSL certificates
3. Monitor application performance
4. Set up automated backups for MongoDB
5. Configure email notifications for errors
