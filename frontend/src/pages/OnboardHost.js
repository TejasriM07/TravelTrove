import React, { useContext, useState } from 'react';
import api from '../utils/api';
import { AuthContext } from '../utils/authContext';

export default function OnboardHost(){
  const { user, setUser } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState(null);
  const [accountId, setAccountId] = useState('');
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null); // 'success' or 'error'

  const start = async () => {
    setLoading(true);
    try {
      const res = await api.post('/auth/razorpay-onboard', { businessName: user?.name || 'My Business', phone: user?.phone, email: user?.email });
      setUrl(res.data.onboardingUrl);
    } catch (e) {
      setUrl(null);
      setMessage('Failed to start onboarding. Please try again.');
      setMessageType('error');
    } finally { 
      setLoading(false); 
    }
  };

  const handleSaveAccountId = async () => {
    setMessage(null);
    setMessageType(null);
    
    if (!accountId.trim()) {
      setMessage('Please enter a Razorpay Account ID');
      setMessageType('error');
      return;
    }

    try {
      await api.post('/auth/save-razorpay-id', { razorpayAccountId: accountId });
      // refresh user
      const me = await api.get('/auth/me');
      setUser(me.data.user);
      setMessage('🎉 Congratulations! You are now a host. You can start listing properties.');
      setMessageType('success');
      setTimeout(() => window.location.href = '/host/list-property', 2000);
    } catch (e) { 
      setMessage(e.response?.data?.message || 'Failed to save. Please try again.');
      setMessageType('error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Host Onboarding</h1>
          <p className="text-gray-600 text-lg">Complete your Razorpay verification to start hosting</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {!url ? (
            // Step 1: Start Onboarding
            <div className="p-8 md:p-12">
              <div className="flex items-start gap-6 mb-8">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-teal-100">
                    <span className="text-teal-600 text-xl font-bold">1</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Start Razorpay Onboarding</h3>
                  <p className="text-gray-600 leading-relaxed">
                    To become a host and start earning, you need to complete Razorpay onboarding. This is a simple process where you'll provide your business details and complete KYC verification.
                  </p>
                </div>
              </div>

              <div className="bg-teal-50 border border-teal-200 rounded-lg p-6 mb-8">
                <p className="text-sm text-teal-900 font-medium mb-2">✓ What you'll need:</p>
                <ul className="text-sm text-teal-800 space-y-2">
                  <li>• Valid government-issued ID</li>
                  <li>• Bank account details</li>
                  <li>• Business information</li>
                  <li>• Contact information (already filled)</li>
                </ul>
              </div>

              {message && (
                <div className={`mb-6 p-4 rounded-lg ${messageType === 'error' ? 'bg-red-50 border border-red-200 text-red-800' : 'bg-green-50 border border-green-200 text-green-800'}`}>
                  {message}
                </div>
              )}

              <button 
                onClick={start} 
                disabled={loading}
                className="w-full bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 transition disabled:bg-gray-400 text-lg"
              >
                {loading ? 'Starting Onboarding...' : 'Start Onboarding Now'}
              </button>

              <p className="text-xs text-gray-500 text-center mt-6">
                You will be redirected to Razorpay's secure portal to complete verification.
              </p>
            </div>
          ) : (
            // Step 2: Complete Onboarding & Enter Account ID
            <div className="p-8 md:p-12">
              <div className="space-y-8">
                {/* Step 2 - Open Link */}
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-teal-100">
                      <span className="text-teal-600 text-xl font-bold">2</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Complete Razorpay Verification</h3>
                    <p className="text-gray-600 mb-4">
                      Click the button below to open the Razorpay onboarding portal. Complete all required steps to verify your information.
                    </p>
                    <a 
                      href={url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                    >
                      Open Razorpay Onboarding Link →
                    </a>
                  </div>
                </div>

                <div className="border-t border-gray-200"></div>

                {/* Step 3 - Enter Account ID */}
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-teal-100">
                      <span className="text-teal-600 text-xl font-bold">3</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Save Your Account ID</h3>
                    <p className="text-gray-600 mb-6">
                      After completing the onboarding on Razorpay, you'll receive your Account ID. Copy it and paste it below to complete the setup.
                    </p>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Razorpay Account ID *</label>
                        <input 
                          type="text"
                          placeholder="acme_xxxxxxxxxxxx" 
                          value={accountId} 
                          onChange={e => setAccountId(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          You can find this in your Razorpay account settings under "Account ID" or in the onboarding confirmation email.
                        </p>
                      </div>

                      {message && (
                        <div className={`p-4 rounded-lg ${messageType === 'error' ? 'bg-red-50 border border-red-200 text-red-800' : 'bg-green-50 border border-green-200 text-green-800'}`}>
                          {message}
                        </div>
                      )}

                      <button 
                        onClick={handleSaveAccountId}
                        className="w-full bg-teal-600 text-white py-3 rounded-lg font-semibold hover:bg-teal-700 transition text-lg"
                      >
                        Save Account ID & Become a Host
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-12 p-6 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Need help?</span> If you encounter any issues, please contact our support team at support@traveltrove.com
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-teal-50 border border-teal-200 rounded-lg p-6">
          <p className="text-sm text-teal-900">
            <span className="font-semibold">🔒 Your data is secure:</span> All information is processed through Razorpay's secure payment infrastructure with bank-grade encryption.
          </p>
        </div>
      </div>
    </div>
  );
}
