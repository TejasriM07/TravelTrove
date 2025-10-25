import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function PropertyDetails(){
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [guestCount, setGuestCount] = useState(1);

  useEffect(() => {
    const loadProperty = async () => {
      try {
        const res = await api.get(`/properties/${id}`);
        setProperty(res.data.property);
      } catch (err) {
        setError('Failed to load property details: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    loadProperty();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="text-gray-600">Loading property details...</div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-red-600 mb-6">{error || 'Property not found'}</p>
          <button
            onClick={() => navigate('/home')}
            className="bg-teal-600 text-white px-8 py-2 rounded font-semibold hover:bg-teal-700"
          >
            Back to Browse
          </button>
        </div>
      </div>
    );
  }

  const nextImage = () => {
    if (property.images?.length) {
      setCurrentImageIdx((prev) => (prev + 1) % property.images.length);
    }
  };

  const prevImage = () => {
    if (property.images?.length) {
      setCurrentImageIdx((prev) => (prev - 1 + property.images.length) % property.images.length);
    }
  };

  return (
    <div className="bg-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Header with Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="text-teal-600 hover:text-teal-700 font-semibold mb-6"
        >
          ← Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Carousel */}
          <div>
            <div className="relative bg-gray-200 rounded-lg overflow-hidden h-96">
              {property.images && property.images.length > 0 ? (
                <>
                  <img
                    src={property.images[currentImageIdx]}
                    alt={`${property.name} - ${currentImageIdx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {property.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 z-10"
                      >
                        ❮
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 z-10"
                      >
                        ❯
                      </button>
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-full text-sm">
                        {currentImageIdx + 1} / {property.images.length}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No images available
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {property.images && property.images.length > 1 && (
              <div className="mt-4 flex gap-2 overflow-x-auto">
                {property.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIdx(idx)}
                    className={`flex-shrink-0 w-20 h-20 rounded overflow-hidden border-2 ${
                      currentImageIdx === idx ? 'border-teal-600' : 'border-gray-300'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Property Details */}
          <div>
            <div className="mb-6">
              <span className="inline-block bg-teal-100 text-teal-800 px-3 py-1 rounded text-sm font-semibold mb-3">
                {property.type}
              </span>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{property.name}</h1>
              <p className="text-gray-600 text-lg">
                {property.address}, {property.city}, {property.state}
              </p>
            </div>

            {/* Rating & Reviews */}
            <div className="flex items-center gap-2 mb-6 pb-6 border-b border-gray-200">
              <span className="text-yellow-500">★</span>
              <span className="font-semibold">{property.rating || 4.5}</span>
              <span className="text-gray-600">({property.reviewCount || 0} reviews)</span>
            </div>

            {/* Pricing */}
            <div className="mb-6">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {property.pricePerDay ? (
                  <>
                    ₹{property.pricePerDay}
                    <span className="text-lg font-normal text-gray-600">/night</span>
                  </>
                ) : property.monthlyPrice ? (
                  <>
                    ₹{property.monthlyPrice}
                    <span className="text-lg font-normal text-gray-600">/month</span>
                  </>
                ) : property.leasePrice ? (
                  <>
                    ₹{property.leasePrice}
                    <span className="text-lg font-normal text-gray-600"> (Lease)</span>
                  </>
                ) : (
                  <span className="text-lg font-normal text-gray-600">Price on request</span>
                )}
              </div>
              {property.rentalType === 'Lease' && property.advanceAmount && (
                <p className="text-gray-600 text-sm mt-2">
                  Advance: ₹{property.advanceAmount} | Duration: {property.leaseTimeLimit} months
                </p>
              )}
            </div>

            {/* Property Details Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b border-gray-200">
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-gray-600 text-sm mb-1">Maximum Guests</p>
                <p className="text-2xl font-bold text-gray-900">{property.maxGuests}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded">
                <p className="text-gray-600 text-sm mb-1">Bedrooms</p>
                <p className="text-2xl font-bold text-gray-900">{property.bedrooms}</p>
              </div>
            </div>

            {/* Facilities */}
            {property.facilities && property.facilities.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Amenities</h3>
                <div className="grid grid-cols-2 gap-2">
                  {property.facilities.map((facility) => (
                    <div key={facility} className="flex items-center gap-2 text-gray-700">
                      <span className="text-teal-600">✓</span>
                      {facility}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Booking Section */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-900 mb-2">Number of Guests</label>
                <select
                  value={guestCount}
                  onChange={(e) => setGuestCount(parseInt(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-teal-600"
                >
                  {Array.from({ length: property.maxGuests }, (_, i) => i + 1).map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'Guest' : 'Guests'}
                    </option>
                  ))}
                </select>
              </div>

              {/* For Hotels, Resorts, Villas - Date Selection */}
              {['Hotel Room', 'Resort', 'Villa'].includes(property.type) && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Check-in Date</label>
                    <input
                      type="date"
                      id="checkInDate"
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-teal-600"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Check-out Date</label>
                    <input
                      type="date"
                      id="checkOutDate"
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-teal-600"
                    />
                  </div>
                </>
              )}

              {/* For Rental Houses - Duration Selection */}
              {property.type === 'House for Rent' && (
                <>
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Rental Duration</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        id="rentalDuration"
                        placeholder="Enter duration"
                        min="1"
                        defaultValue="1"
                        className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-teal-600"
                      />
                      <select
                        id="durationUnit"
                        defaultValue={property.rentalType === 'Lease' ? 'months' : 'months'}
                        className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:border-teal-600"
                      >
                        <option value="months">Months</option>
                        <option value="years">Years</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              <button
                onClick={() => {
                  let bookingParams = `?guests=${guestCount}`;
                  
                  // For hotels/resorts/villas - add dates
                  if (['Hotel Room', 'Resort', 'Villa'].includes(property.type)) {
                    const checkIn = document.getElementById('checkInDate').value;
                    const checkOut = document.getElementById('checkOutDate').value;
                    
                    if (!checkIn || !checkOut) {
                      alert('Please select both check-in and check-out dates');
                      return;
                    }
                    
                    const from = new Date(checkIn);
                    const to = new Date(checkOut);
                    if (to <= from) {
                      alert('Check-out date must be after check-in date');
                      return;
                    }
                    
                    bookingParams += `&from=${checkIn}&to=${checkOut}`;
                  }
                  
                  // For rental houses - add duration
                  if (property.type === 'House for Rent') {
                    const duration = document.getElementById('rentalDuration').value;
                    const unit = document.getElementById('durationUnit').value;
                    
                    if (!duration || duration < 1) {
                      alert('Please enter a valid duration');
                      return;
                    }
                    
                    bookingParams += `&duration=${duration}&durationUnit=${unit}`;
                  }
                  
                  navigate(`/booking/${property._id}${bookingParams}`);
                }}
                className="w-full bg-teal-600 text-white py-3 rounded font-bold text-lg hover:bg-teal-700 transition"
              >
                Book Now
              </button>

              <p className="text-gray-600 text-center text-sm mt-4">
                You won't be charged yet
              </p>
            </div>

            {/* Property Description */}
            {property.description && (
              <div className="mt-8">
                <h3 className="text-lg font-bold text-gray-900 mb-3">About This Property</h3>
                <p className="text-gray-700 leading-relaxed">{property.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Additional Info Sections */}
        <div className="mt-12 pt-12 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">📍 Location</h3>
              <p className="text-gray-600 mb-2">{property.address}</p>
              {property.gpsUrl && (
                <a
                  href={property.gpsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-600 hover:text-teal-700 font-semibold"
                >
                  View on Maps →
                </a>
              )}
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">🕐 Availability</h3>
              {property.openingTime && property.closingTime && (
                <p className="text-gray-600">
                  {property.openingTime} - {property.closingTime}
                </p>
              )}
              <p className="text-gray-600 mt-2">
                {property.available ? '✓ Available' : '✗ Not Available'}
              </p>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">🏠 Type</h3>
              <p className="text-gray-600">{property.type}</p>
              {property.rentalType && (
                <p className="text-gray-600 mt-2">Rental: {property.rentalType}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
