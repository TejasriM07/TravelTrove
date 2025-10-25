import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function MyBooking(){
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadBookings = async () => {
      try {
        const res = await api.get('/bookings/my');
        setBookings(res.data.bookings || []);
      } catch (e) {
        console.error('Failed to load bookings', e.message);
      } finally {
        setLoading(false);
      }
    };
    loadBookings();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">My Bookings</h1>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 text-lg mb-4">No bookings yet.</p>
            <p className="text-gray-500 mb-6">Start exploring our properties and book your next stay!</p>
            <button
              onClick={() => navigate('/home')}
              className="bg-teal-600 text-white px-8 py-3 rounded font-semibold hover:bg-teal-700"
            >
              Book Now
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map(b => (
              <div key={b._id} className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {/* Property Image */}
                  <div className="md:col-span-1">
                    <img
                      src={b.property?.images?.[0] || 'https://via.placeholder.com/300x250'}
                      alt={b.property?.name}
                      className="w-full h-64 md:h-full object-cover"
                    />
                  </div>

                  {/* Rest of Content */}
                  <div className="md:col-span-4 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Property Info */}
                  <div className="md:col-span-2">
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-gray-500 mb-1">PROPERTY</p>
                      <p className="text-lg font-bold text-gray-900">{b.property?.name}</p>
                      <p className="text-sm text-gray-600">
                        {b.property?.city}, {b.property?.state}
                      </p>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <p className="text-xs font-semibold text-gray-500 mb-2">PROPERTY TYPE</p>
                      <p className="text-sm text-gray-600">{b.property?.type || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Booking Details */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-2">BOOKING DETAILS</p>
                    <div className="space-y-2 text-sm">
                      {b.fromDate && b.toDate ? (
                        <>
                          <div>
                            <p className="text-gray-600">Check-in: {new Date(b.fromDate).toLocaleDateString('en-IN')}</p>
                            <p className="text-gray-600">Check-out: {new Date(b.toDate).toLocaleDateString('en-IN')}</p>
                          </div>
                        </>
                      ) : b.duration ? (
                        <div>
                          <p className="text-gray-600">Duration: {b.duration} {b.durationUnit}</p>
                        </div>
                      ) : null}
                      <div>
                        <p className="text-gray-600">Guests: {b.guests}</p>
                      </div>
                    </div>
                  </div>

                  {/* Amount & Status */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-2">AMOUNT & STATUS</p>
                    <div className="space-y-2">
                      <p className="text-2xl font-bold text-teal-600">₹{b.totalPrice}</p>
                      {/* Payment Status Badge */}
                      <span className={`inline-block px-3 py-1 rounded text-sm font-semibold ${
                        b.paymentStatus === 'Paid'
                          ? 'bg-green-100 text-green-800'
                          : b.paymentStatus === 'Pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : b.paymentStatus === 'Pay on Location'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {b.paymentStatus || 'Pending'}
                      </span>
                      {/* Payment Method Info */}
                      <div className="text-xs text-gray-600 mt-3 pt-2 border-t border-gray-200">
                        <p className="font-semibold text-gray-700 mb-1">Payment Method:</p>
                        {b.paymentMethod === 'Razorpay' ? (
                          <p className="flex items-center gap-1">
                            🔒 <span>{b.paymentMethod}</span>
                          </p>
                        ) : b.paymentMethod === 'Pay on Location' ? (
                          <p className="flex items-center gap-1">
                            💵 <span>Cash at Location</span>
                          </p>
                        ) : (
                          <p className="text-gray-600">{b.paymentMethod || 'Not specified'}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                  {/* Booking ID */}
                  <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex justify-between items-center">
                    <p className="text-xs text-gray-500">
                      Booking ID: <span className="font-mono text-gray-700">{b._id}</span>
                    </p>
                    <p className="text-xs text-gray-500">
                      Booked on: {new Date(b.createdAt).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                    </div>
                  </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
