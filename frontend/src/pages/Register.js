import React, { useState } from 'react';
import api from '../utils/api';
import { useNavigate, useLocation } from 'react-router-dom';
import deerAvatar from '../assets/deer.png';
import dogAvatar from '../assets/dog.png';
import owlAvatar from '../assets/owl.png';
import wolfAvatar from '../assets/wolf.png';
import jaguarAvatar from '../assets/jaguar.png';
import pandaAvatar from '../assets/panda-bear.png';
import turtleAvatar from '../assets/turtle.png';
import ganeshaAvatar from '../assets/ganesha.png';

export default function Register(){
  const [form, setForm] = useState({ name:'', email:'', phone:'', password:'', confirm:'', avatar:'' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const type = params.get('type'); // 'host' or 'guest'
  const isHostRegistration = type === 'host';

  const avatarOptions = [
    { name: 'Deer', image: deerAvatar },
    { name: 'Dog', image: dogAvatar },
    { name: 'Owl', image: owlAvatar },
    { name: 'Wolf', image: wolfAvatar },
    { name: 'Jaguar', image: jaguarAvatar },
    { name: 'Panda', image: pandaAvatar },
    { name: 'Turtle', image: turtleAvatar },
    { name: 'elephant', image: ganeshaAvatar }
  ];

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!form.name) return setError('Name is required');
    if (!form.email) return setError('Email is required');
    if (!form.phone) return setError('Phone is required');
    if (!form.password) return setError('Password is required');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    if (!/\d/.test(form.password)) return setError('Password must contain at least one number');
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(form.password)) return setError('Password must contain at least one special character (!@#$%^&* etc)');
    if (form.password !== form.confirm) return setError('Passwords do not match');
    if (!form.avatar) return setError('Please select an avatar');

    setLoading(true);
    try {
      const res = await api.post('/auth/register', {
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        avatar: form.avatar,
        isHost: isHostRegistration
      });
      if (res.data?.user) {
        setSuccess(true);
        setTimeout(() => navigate(`/login?type=${isHostRegistration ? 'host' : 'guest'}`), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-white py-12 px-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{isHostRegistration ? 'Register as a Host' : 'Create Account'}</h1>
          <p className="text-gray-600">{isHostRegistration ? 'Start hosting and earn with Travel Trove' : 'Join Travel Trove and start your journey'}</p>
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
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Full Name</label>
              <input 
                type="text"
                required
                placeholder="John Doe" 
                value={form.name} 
                onChange={e => setForm({...form, name: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Email Address</label>
              <input 
                type="email"
                required
                placeholder="you@example.com" 
                value={form.email} 
                onChange={e => setForm({...form, email: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Phone Number</label>
              <input 
                type="tel"
                required
                placeholder="+91 98765 43210" 
                value={form.phone} 
                onChange={e => setForm({...form, phone: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Password</label>
              <input 
                type="password"
                required
                placeholder="At least 6 characters" 
                value={form.password} 
                onChange={e => setForm({...form, password: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
              />
              <p className="text-xs text-gray-600 mt-2">Password must contain:</p>
              <ul className="text-xs text-gray-600 mt-1 space-y-1">
                <li className={form.password.length >= 6 ? 'text-green-600' : ''}>✓ At least 6 characters</li>
                <li className={/\d/.test(form.password) ? 'text-green-600' : ''}>✓ At least one number</li>
                <li className={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(form.password) ? 'text-green-600' : ''}>✓ At least one special character (!@#$%^&*)</li>
              </ul>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Confirm Password</label>
              <input 
                type="password"
                required
                placeholder="Re-enter your password" 
                value={form.confirm} 
                onChange={e => setForm({...form, confirm: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
              />
            </div>

            {/* Avatar Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-3">Choose Your Avatar</label>
              <div className="grid grid-cols-4 gap-3">
                {avatarOptions.map(avatar => (
                  <button
                    key={avatar.name}
                    type="button"
                    onClick={() => setForm({...form, avatar: avatar.name})}
                    className={`p-4 rounded-lg transition border-2 flex items-center justify-center h-24 ${
                      form.avatar === avatar.name
                        ? 'bg-teal-100 border-teal-600 ring-2 ring-teal-400 scale-105'
                        : 'bg-gray-50 border-gray-300 hover:border-teal-400'
                    }`}
                    title={avatar.name}
                  >
                    <img 
                      src={avatar.image} 
                      alt={avatar.name}
                      className="w-16 h-16 object-contain"
                    />
                  </button>
                ))}
              </div>
              {form.avatar && <p className="text-sm text-teal-600 mt-3">✓ {form.avatar} selected</p>}
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-teal-600 text-white py-2 rounded-lg font-semibold hover:bg-teal-700 transition disabled:bg-gray-400 mt-6"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Terms */}
          <p className="text-xs text-gray-600 text-center">
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>

        {/* Sign In Link */}
        <p className="text-center text-gray-600 mt-6">
          Already have an account?{' '}
          <a href="/login" className="text-teal-600 hover:text-teal-700 font-semibold">
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
