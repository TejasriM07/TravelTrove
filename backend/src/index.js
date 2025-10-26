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

// Health check endpoint (doesn't require DB)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Backend is running',
    mongoConnected: mongoose.connection.readyState === 1
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'TravelTrove Backend API',
    status: 'running'
  });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/travel_trove';

// Start server immediately (don't wait for MongoDB connection)
const server = app.listen(PORT, '0.0.0.0', () => {
  const host = process.env.NODE_ENV === 'production' ? 'production server' : `http://localhost:${PORT}`;
  console.log(`🚀 Backend API running at ${host}`);
  console.log(`Server started on port ${PORT}`);
  console.log(`CORS enabled for: ${allowedOrigins.join(', ')}`);
});

// Connect to MongoDB (non-blocking)
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Connected to MongoDB');
})
.catch(err => {
  console.error('❌ Failed to connect to MongoDB:', err.message);
  console.warn('⚠️  Server is running but database is not connected');
  console.warn('⚠️  Some features may not work until MongoDB is connected');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    mongoose.connection.close();
    process.exit(0);
  });
});
