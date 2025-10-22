import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function Verify(){
  const { state } = useLocation();
  const navigate = useNavigate();
  const tokens = state?.tokens || {};
  const [emailToken, setEmailToken] = useState(tokens.emailToken || '');
  const [phoneToken, setPhoneToken] = useState(tokens.phoneToken || '');
  const [userId, setUserId] = useState(tokens.userId || '');
  const [message, setMessage] = useState(null);
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (type) => {
    setMessage(null);
    setLoading(true);
    try {
      await api.post('/auth/verify', { userId, type, token: type === 'email' ? emailToken : phoneToken });
      setMessage(`✓ ${type.charAt(0).toUpperCase() + type.slice(1)} verified successfully!`);
      if (type === 'email') setEmailVerified(true);
      else setPhoneVerified(true);
      
      if (type === 'phone') {
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (e) {
      setMessage(e.response?.data?.message || `${type} verification failed`);
    } finally {
      setLoading(false);
    }
  };

  const isComplete = emailVerified && phoneVerified;

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white py-12 px-4 flex items-center justify-center">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-4">✉️</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Verify Your Account</h1>
          <p className="text-gray-600">Complete verification to activate your account</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
          {/* Message */}
          {message && (
            <div className={`px-4 py-3 rounded-lg text-sm font-medium ${
              message.includes('✓') 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {message}
            </div>
          )}

          {/* Hidden User ID (for dev) */}
          <input 
            type="hidden"
            value={userId} 
            onChange={e => setUserId(e.target.value)} 
          />

          {/* Email Verification */}
          <div className={`border-2 rounded-lg p-4 transition ${
            emailVerified ? 'border-green-300 bg-green-50' : 'border-gray-300'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-semibold text-gray-900 flex items-center gap-2">
                {emailVerified ? '✓' : '📧'} Email Verification
              </label>
              {emailVerified && <span className="text-green-600 text-xs font-bold">VERIFIED</span>}
            </div>
            <input 
              type="text"
              placeholder="Enter email verification code" 
              value={emailToken} 
              onChange={e => setEmailToken(e.target.value)}
              disabled={emailVerified}
              className="w-full px-3 py-2 border border-gray-300 rounded mb-3 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
            />
            <button 
              onClick={() => submit('email')}
              disabled={emailVerified || !emailToken || loading}
              className="w-full bg-teal-600 text-white py-2 rounded font-semibold hover:bg-teal-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {emailVerified ? '✓ Email Verified' : 'Verify Email'}
            </button>
          </div>

          {/* Phone Verification */}
          <div className={`border-2 rounded-lg p-4 transition ${
            phoneVerified ? 'border-green-300 bg-green-50' : 'border-gray-300'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-semibold text-gray-900 flex items-center gap-2">
                {phoneVerified ? '✓' : '📱'} Phone Verification
              </label>
              {phoneVerified && <span className="text-green-600 text-xs font-bold">VERIFIED</span>}
            </div>
            <input 
              type="text"
              placeholder="Enter phone verification code" 
              value={phoneToken} 
              onChange={e => setPhoneToken(e.target.value)}
              disabled={phoneVerified}
              className="w-full px-3 py-2 border border-gray-300 rounded mb-3 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent disabled:bg-gray-50 disabled:cursor-not-allowed"
            />
            <button 
              onClick={() => submit('phone')}
              disabled={phoneVerified || !phoneToken || loading}
              className="w-full bg-teal-600 text-white py-2 rounded font-semibold hover:bg-teal-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {phoneVerified ? '✓ Phone Verified' : 'Verify Phone'}
            </button>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
            <p className="font-semibold mb-1">Dev Mode:</p>
            <p>Check your server logs for verification codes or use the provided tokens from registration.</p>
          </div>

          {/* Success Message */}
          {isComplete && (
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-green-600 font-semibold mb-2">✓ Account successfully verified!</p>
              <p className="text-sm text-gray-600">Redirecting to login page...</p>
            </div>
          )}
        </div>

        {/* Back to Login */}
        {!isComplete && (
          <p className="text-center text-gray-600 mt-6 text-sm">
            Already verified?{' '}
            <a href="/login" className="text-teal-600 hover:text-teal-700 font-semibold">
              Sign in here
            </a>
          </p>
        )}
      </div>
    </div>
  );
}
