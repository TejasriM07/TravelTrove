import React, { useState, useContext } from 'react';
import api from '../utils/api';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../utils/authContext';

export default function Login(){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('guest'); // 'host' or 'guest'
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { search } = useLocation();
  const { setUser } = useContext(AuthContext);
  const params = new URLSearchParams(search);
  const next = params.get('next');
  const type = params.get('type'); // 'host' or 'guest' from registration
  
  // Set default role based on type parameter
  React.useEffect(() => {
    if (type === 'host') setRole('host');
    else if (type === 'guest') setRole('guest');
  }, [type]);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password, role });
      console.log('Login response:', res.data);
      if (res.data?.user) {
        console.log('Setting user:', res.data.user);
        setUser(res.data.user);
        if (next === 'host/list-property') navigate('/host/list-property');
        else if (next === 'host/onboard') navigate('/host/onboard');
        else if (next === 'host/home') navigate('/host');
        else if (next) navigate('/' + next);
        else if (role === 'host') navigate('/host');
        else navigate('/home');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your Travel Trove account</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={submit} className="space-y-4">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">Login as:</label>
              <div className="flex gap-6">
                <label className="flex items-center cursor-pointer">
                  <input 
                    type="radio" 
                    name="role" 
                    value="guest" 
                    checked={role === 'guest'}
                    onChange={e => setRole(e.target.value)}
                    className="w-4 h-4 text-teal-600 cursor-pointer accent-teal-600"
                  />
                  <span className="ml-2 text-gray-700 font-medium">Guest</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input 
                    type="radio" 
                    name="role" 
                    value="host" 
                    checked={role === 'host'}
                    onChange={e => setRole(e.target.value)}
                    className="w-4 h-4 text-teal-600 cursor-pointer accent-teal-600"
                  />
                  <span className="ml-2 text-gray-700 font-medium">Host</span>
                </label>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Email Address</label>
              <input 
                type="email"
                required
                placeholder="you@example.com" 
                value={email} 
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Password</label>
              <input 
                type="password"
                required
                placeholder="Enter your password" 
                value={password} 
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
              />
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-gray-700">Remember me</span>
              </label>
              <a href="#" className="text-teal-600 hover:text-teal-700 font-medium">Forgot password?</a>
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-teal-600 text-white py-2 rounded-lg font-semibold hover:bg-teal-700 transition disabled:bg-gray-400 mt-6"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-300"></div>
            <span className="text-gray-500 text-sm">or</span>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          {/* Social Login */}
          <div className="space-y-2">
            <button className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition">
              Sign in with Google
            </button>
          </div>
        </div>

        {/* Sign Up Link */}
        <p className="text-center text-gray-600 mt-6">
          Don't have an account?{' '}
          <a href={`/register?type=${role}`} className="text-teal-600 hover:text-teal-700 font-semibold">
            Create one
          </a>
        </p>
      </div>
    </div>
  );
}
