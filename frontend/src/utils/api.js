import axios from 'axios';

// Get API base URL from environment variables
// In development: http://localhost:5000/api
// In production: use REACT_APP_API_URL environment variable
const baseURL = process.env.REACT_APP_API_URL 
  ? `${process.env.REACT_APP_API_URL}/api`
  : 'http://localhost:5000/api';

const api = axios.create({
  baseURL: baseURL,
  withCredentials: true,
});

// Debug: Log the API base URL in development
if (process.env.NODE_ENV === 'development') {
  console.log('API Base URL:', baseURL);
}

export default api;
