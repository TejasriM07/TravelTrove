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
    const completionStatus = prop.completionStatus;
    
    // If all steps are complete, go to edit form
    if (completionStatus?.basicInfo && completionStatus?.images && completionStatus?.pricing && completionStatus?.razorpay) {
      navigate(`/host/list-property?edit=${prop._id}`);
      return;
    }
    
    // If Razorpay is not complete, go to onboarding
    if (!completionStatus?.razorpay) {
      navigate(`/host/onboard?propertyId=${prop._id}`);
      return;
    }
    
    // For any other incomplete step, go to edit form
    navigate(`/host/list-property?edit=${prop._id}`);
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

  // Helper function to calculate completion percentage
  const getCompletionPercentage = (status) => {
    if (!status) return 0;
    const completed = Object.values(status).filter(v => v).length;
    return Math.round((completed / 4) * 100);
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((prop) => {
              const completionPercentage = getCompletionPercentage(prop.completionStatus);
              const isComplete = completionPercentage === 100;
              
              return (
                <div key={prop._id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition">
                  {/* Property Image */}
                  <div className="relative h-48 bg-gray-200 overflow-hidden">
                    {prop.images && prop.images.length > 0 ? (
                      <img
                        src={prop.images[0]}
                        alt={prop.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        No image
                      </div>
                    )}
                    <div className="absolute top-3 right-3 bg-teal-600 text-white px-3 py-1 rounded text-sm font-semibold">
                      {prop.type}
                    </div>
                  </div>

                  {/* Property Info */}
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{prop.name}</h3>
                    <p className="text-gray-600 text-sm mb-3">
                      {prop.city}, {prop.state}
                    </p>

                    {/* Completion Status Badge */}
                    <div className="mb-4 pb-4 border-b border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-gray-700">Listing Progress</span>
                        <span className={`text-xs font-bold px-2 py-1 rounded ${isComplete ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                          {completionPercentage}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-full transition-all ${isComplete ? 'bg-green-500' : 'bg-yellow-500'}`}
                          style={{ width: `${completionPercentage}%` }}
                        ></div>
                      </div>

                      {/* Step Indicators */}
                      <div className="mt-3 space-y-1 text-xs">
                        <div className="flex items-center gap-2">
                          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-white font-bold text-xs ${prop.completionStatus?.basicInfo ? 'bg-green-500' : 'bg-red-500'}`}>
                            {prop.completionStatus?.basicInfo ? '✓' : '✗'}
                          </span>
                          <span className={prop.completionStatus?.basicInfo ? 'text-gray-700 font-semibold' : 'text-gray-600'}>
                            Basic Info
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-white font-bold text-xs ${prop.completionStatus?.images ? 'bg-green-500' : 'bg-red-500'}`}>
                            {prop.completionStatus?.images ? '✓' : '✗'}
                          </span>
                          <span className={prop.completionStatus?.images ? 'text-gray-700 font-semibold' : 'text-gray-600'}>
                            Images (5+)
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-white font-bold text-xs ${prop.completionStatus?.pricing ? 'bg-green-500' : 'bg-red-500'}`}>
                            {prop.completionStatus?.pricing ? '✓' : '✗'}
                          </span>
                          <span className={prop.completionStatus?.pricing ? 'text-gray-700 font-semibold' : 'text-gray-600'}>
                            Pricing
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-white font-bold text-xs ${prop.completionStatus?.razorpay ? 'bg-green-500' : 'bg-red-500'}`}>
                            {prop.completionStatus?.razorpay ? '✓' : '✗'}
                          </span>
                          <span className={prop.completionStatus?.razorpay ? 'text-gray-700 font-semibold' : 'text-gray-600'}>
                            Razorpay Payment
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Pricing Info */}
                    <div className="mb-4 pb-4 border-b border-gray-200">
                      {prop.pricePerDay && (
                        <p className="text-gray-700 font-semibold">
                          ₹{prop.pricePerDay}/day
                        </p>
                      )}
                      {prop.monthlyPrice && (
                        <p className="text-gray-700 text-sm">
                          ₹{prop.monthlyPrice}/month
                        </p>
                      )}
                    </div>

                    {/* Property Details */}
                    <div className="grid grid-cols-2 gap-2 mb-4 text-sm text-gray-600">
                      <div>
                        <p className="font-semibold text-gray-900">Guests</p>
                        <p>{prop.maxGuests} people</p>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Rooms</p>
                        <p>{prop.bedrooms}</p>
                      </div>
                    </div>

                    {/* Facilities */}
                    {prop.facilities && prop.facilities.length > 0 && (
                      <div className="mb-4">
                        <p className="text-xs font-semibold text-gray-900 mb-1">Amenities:</p>
                        <div className="flex flex-wrap gap-1">
                          {prop.facilities.slice(0, 3).map((f) => (
                            <span key={f} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                              {f}
                            </span>
                          ))}
                          {prop.facilities.length > 3 && (
                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                              +{prop.facilities.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Status Alert */}
                    {!isComplete && (
                      <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-xs text-amber-800 font-semibold">
                          ⚠️ Complete all steps to activate this listing
                        </p>
                      </div>
                    )}

                    {isComplete && (
                      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-xs text-green-800 font-semibold">
                          ✅ Listing is complete and active
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
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
