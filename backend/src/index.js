require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const propertyRoutes = require('./routes/property');
const bookingRoutes = require('./routes/booking');

const app = express();
app.use(express.json());
app.use(cookieParser());

// CORS configuration with environment variables
const allowedOrigins = [
  'http://localhost:3000',      // Local development
  'http://localhost:5000',      // Local backend
  'http://127.0.0.1:3000',      // Local development alt
  process.env.FRONTEND_URL,     // Frontend URL from env (e.g., Netlify deployed)
  process.env.REACT_APP_FRONTEND_URL, // Alternative env variable name
].filter(Boolean); // Remove undefined values

app.use(cors({ 
  origin: allowedOrigins, 
  credentials: true 
}));

app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/bookings', bookingRoutes);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/travel_trove';

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
  console.log(`Server running on port ${PORT}`);
  console.log(`CORS enabled for: ${allowedOrigins.join(', ')}`);
  // Listen on 0.0.0.0 to accept connections from any interface (required for Render)
  app.listen(PORT, '0.0.0.0', () => {
    const host = process.env.NODE_ENV === 'production' ? 'production server' : `http://localhost:${PORT}`;
    console.log(`🚀 Backend API running at ${host}`);
  });
}).catch(err => {
  console.error('Failed to connect to MongoDB', err);
  process.exit(1);
});
