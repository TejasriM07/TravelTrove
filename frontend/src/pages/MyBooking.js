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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bookings.map(b => (
              <div key={b._id} className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden">
                {/* Property Image */}
                <img
                  src={b.property?.images?.[0] || 'https://via.placeholder.com/400x250'}
                  alt={b.property?.name}
                  className="w-full h-48 object-cover"
                />
                {/* Booking Details */}
                <div className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{b.property?.name}</h2>
                  <p className="text-gray-600 mb-4">{b.property?.city}, {b.property?.state}</p>

                  <div className="space-y-3 mb-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Check-in:</span>
                      <span className="font-semibold">{new Date(b.fromDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Check-out:</span>
                      <span className="font-semibold">{new Date(b.toDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Guests:</span>
                      <span className="font-semibold">{b.guests}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Price:</span>
                      <span className="font-bold text-teal-600 text-lg">₹{b.totalPrice}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t">
                    <span className={`px-3 py-1 rounded text-sm font-semibold ${
                      b.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {b.paymentStatus || 'Pending'}
                    </span>
                    <span className="text-gray-600 text-sm">{b.paymentMethod || 'Payment Method'}</span>
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
