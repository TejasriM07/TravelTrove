import React, { useState, useEffect, useContext } from 'react';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../utils/authContext';

export default function EditMyListing(){
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login?next=host/edit-my-listing');
      return;
    }
    if (user && !user.isHost) {
      navigate('/host/onboard');
      return;
    }
    
    const loadProperties = async () => {
      try {
        const res = await api.get('/properties/my-properties');
        setProperties(res.data.properties || []);
      } catch (err) {
        setMessage('Failed to load properties: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    
    loadProperties();
  }, [user, navigate]);

  const handleEdit = (prop) => {
    // Navigate to full edit form with all details including Razorpay
    navigate(`/host/list-property?edit=${prop._id}&full=true`);
  };

  const handleComplete = (prop) => {
    const completionStatus = prop.completionStatus;
    
    // Check which required step is incomplete (only basic, images, pricing are required)
    if (!completionStatus?.basicInfo || !completionStatus?.images || !completionStatus?.pricing) {
      // Redirect to list property form to complete basic info, images, or pricing
      navigate(`/host/list-property?edit=${prop._id}`);
      return;
    }
    
    // If all required steps are complete, show success message
    // Razorpay is optional, so don't redirect if only that's incomplete
    alert('🎉 Your listing is complete and active! Guests can now book your property.\n\nRazorpay is optional - you can receive offline payments too.');
  };

  const handleDelete = async (propId) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      await api.delete(`/properties/${propId}`);
      setProperties(properties.filter(p => p._id !== propId));
      setMessage('Listing deleted successfully');
    } catch (err) {
      setMessage('Failed to delete listing: ' + err.message);
    }
  };

  // Helper function to calculate completion percentage (only required steps)
  const getCompletionPercentage = (status) => {
    if (!status) return 0;
    // Only count required steps: basicInfo, images, pricing (3 steps)
    // Razorpay is optional
    const requiredSteps = [status.basicInfo, status.images, status.pricing];
    const completed = requiredSteps.filter(v => v).length;
    return Math.round((completed / 3) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="text-gray-600">Loading your listings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">My Listings</h1>
          <button
            onClick={() => navigate('/host/list-property')}
            className="bg-teal-600 text-white px-6 py-2 rounded font-semibold hover:bg-teal-700"
          >
            + Add New Listing
          </button>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded ${message.includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {message}
          </div>
        )}

        {properties.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 mb-6">You haven't listed any properties yet.</p>
            <button
              onClick={() => navigate('/host/list-property')}
              className="bg-teal-600 text-white px-8 py-3 rounded font-semibold hover:bg-teal-700"
            >
              Create Your First Listing
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {properties.map((prop) => {
              const completionPercentage = getCompletionPercentage(prop.completionStatus);
              const isComplete = completionPercentage === 100;
              
              return (
                <div key={prop._id} className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {/* Property Image */}
                    <div className="md:col-span-1">
                      {prop.images && prop.images.length > 0 ? (
                        <img
                          src={prop.images[0]}
                          alt={prop.name}
                          className="w-full h-64 md:h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-64 md:h-full bg-gray-200 flex items-center justify-center text-gray-400">
                          No image
                        </div>
                      )}
                    </div>

                    {/* Main Content */}
                    <div className="md:col-span-4 p-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Property Info & Completion */}
                        <div className="md:col-span-2">
                          {/* Header */}
                          <div className="mb-4">
                            <div className="flex justify-between items-start gap-2 mb-2">
                              <div>
                                <p className="text-xs font-semibold text-gray-500 mb-1">PROPERTY</p>
                                <h3 className="text-lg font-bold text-gray-900">{prop.name}</h3>
                              </div>
                              <div className="bg-teal-600 text-white px-2 py-1 rounded text-xs font-semibold whitespace-nowrap">
                                {prop.type}
                              </div>
                            </div>
                            <p className="text-sm text-gray-600">
                              {prop.city}, {prop.state}
                            </p>
                          </div>

                          {/* Completion Progress */}
                          <div className="border-t border-gray-200 pt-4">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-xs font-semibold text-gray-700">Completion Progress</p>
                              <span className={`text-xs font-bold px-2 py-1 rounded ${isComplete ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {completionPercentage}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden mb-3">
                              <div 
                                className={`h-full transition-all ${isComplete ? 'bg-green-500' : 'bg-yellow-500'}`}
                                style={{ width: `${completionPercentage}%` }}
                              ></div>
                            </div>

                            {/* Step Indicators */}
                            <div className="space-y-2 text-xs">
                              <div className="flex items-center gap-2">
                                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0 ${prop.completionStatus?.basicInfo ? 'bg-green-500' : 'bg-red-500'}`}>
                                  {prop.completionStatus?.basicInfo ? '✓' : '✗'}
                                </span>
                                <span className={prop.completionStatus?.basicInfo ? 'text-gray-700 font-semibold' : 'text-gray-600'}>
                                  Basic Info
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0 ${prop.completionStatus?.images ? 'bg-green-500' : 'bg-red-500'}`}>
                                  {prop.completionStatus?.images ? '✓' : '✗'}
                                </span>
                                <span className={prop.completionStatus?.images ? 'text-gray-700 font-semibold' : 'text-gray-600'}>
                                  Images (5+)
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0 ${prop.completionStatus?.pricing ? 'bg-green-500' : 'bg-red-500'}`}>
                                  {prop.completionStatus?.pricing ? '✓' : '✗'}
                                </span>
                                <span className={prop.completionStatus?.pricing ? 'text-gray-700 font-semibold' : 'text-gray-600'}>
                                  Pricing
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0 ${prop.completionStatus?.razorpay ? 'bg-green-500' : 'bg-gray-400'}`}>
                                  {prop.completionStatus?.razorpay ? '✓' : '○'}
                                </span>
                                <span className={prop.completionStatus?.razorpay ? 'text-gray-700 font-semibold' : 'text-gray-600'}>
                                  Razorpay (Optional)
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Property Details */}
                        <div>
                          <p className="text-xs font-semibold text-gray-500 mb-3">PROPERTY DETAILS</p>
                          <div className="space-y-3 text-sm">
                            <div>
                              <p className="text-gray-600 text-xs">Max Guests</p>
                              <p className="font-semibold text-gray-900">{prop.maxGuests} people</p>
                            </div>
                            <div>
                              <p className="text-gray-600 text-xs">Bedrooms</p>
                              <p className="font-semibold text-gray-900">{prop.bedrooms}</p>
                            </div>
                            {prop.pricePerDay && (
                              <div>
                                <p className="text-gray-600 text-xs">Daily Rate</p>
                                <p className="font-semibold text-teal-600">₹{prop.pricePerDay}/day</p>
                              </div>
                            )}
                            {prop.monthlyPrice && (
                              <div>
                                <p className="text-gray-600 text-xs">Monthly Rate</p>
                                <p className="font-semibold text-teal-600">₹{prop.monthlyPrice}/month</p>
                              </div>
                            )}
                            {prop.leasePrice && (
                              <div>
                                <p className="text-gray-600 text-xs">Lease Price</p>
                                <p className="font-semibold text-teal-600">₹{prop.leasePrice}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Amenities */}
                      {prop.facilities && prop.facilities.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="text-xs font-semibold text-gray-700 mb-2">AMENITIES</p>
                          <div className="flex flex-wrap gap-2">
                            {prop.facilities.slice(0, 4).map((f) => (
                              <span key={f} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                {f}
                              </span>
                            ))}
                            {prop.facilities.length > 4 && (
                              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                +{prop.facilities.length - 4}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Status Alert */}
                      {!isComplete && (
                        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                          <p className="text-xs text-amber-800 font-semibold">
                            ⚠️ Complete all required steps to activate this listing
                          </p>
                        </div>
                      )}

                      {isComplete && (
                        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-xs text-green-800 font-semibold">
                            ✅ Your listing is active! Guests can book and pay offline or online.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                    <div className="flex gap-2 mb-2">
                      <button
                        onClick={() => handleComplete(prop)}
                        className={`flex-1 py-2 rounded font-semibold text-sm transition ${
                          isComplete
                            ? 'bg-green-500 text-white hover:bg-green-600'
                            : 'bg-amber-500 text-white hover:bg-amber-600'
                        }`}
                      >
                        {isComplete ? '✅ Complete' : `⏳ Complete (${completionPercentage}%)`}
                      </button>
                      <button
                        onClick={() => handleEdit(prop)}
                        className="flex-1 bg-blue-500 text-white py-2 rounded font-semibold hover:bg-blue-600 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(prop._id)}
                        className="flex-1 bg-red-500 text-white py-2 rounded font-semibold hover:bg-red-600 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                    
                    {!prop.completionStatus?.razorpay && (
                      <button
                        onClick={() => navigate('/host/onboard')}
                        className="w-full bg-indigo-500 text-white py-2 rounded font-semibold hover:bg-indigo-600 text-sm"
                      >
                        + Add Razorpay (Optional)
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
