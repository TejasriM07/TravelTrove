import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { AuthContext } from '../utils/authContext';

export default function HostBookings() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pending, paid

  useEffect(() => {
    if (!user) {
      navigate('/login?next=host/bookings');
      return;
    }
    if (user && !user.isHost) {
      navigate('/home');
      return;
    }

    const loadBookings = async () => {
      try {
        const res = await api.get('/bookings/host/bookings');
        setBookings(res.data.bookings || []);
      } catch (err) {
        setMessage('Failed to load bookings: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, [user, navigate]);

  const getFilteredBookings = () => {
    if (filter === 'all') return bookings;
    if (filter === 'pending') return bookings.filter(b => b.paymentStatus === 'Pending');
    if (filter === 'paid') return bookings.filter(b => b.paymentStatus === 'Paid');
    return bookings;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDuration = (booking) => {
    if (booking.fromDate && booking.toDate) {
      const nights = Math.ceil(
        (new Date(booking.toDate) - new Date(booking.fromDate)) / (1000 * 60 * 60 * 24)
      );
      return `${nights} night${nights > 1 ? 's' : ''}`;
    }
    if (booking.duration && booking.durationUnit) {
      return `${booking.duration} ${booking.durationUnit}`;
    }
    return 'N/A';
  };

  const filteredBookings = getFilteredBookings();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="text-gray-600">Loading bookings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Guest Bookings</h1>
          <button
            onClick={() => navigate('/host/edit-my-listing')}
            className="bg-teal-600 text-white px-6 py-2 rounded font-semibold hover:bg-teal-700"
          >
            My Listings
          </button>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded ${message.includes('Failed') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
            {message}
          </div>
        )}

        {/* Filter Tabs */}
        <div className="mb-6 flex gap-4 border-b border-gray-200">
          <button
            onClick={() => setFilter('all')}
            className={`pb-3 font-semibold transition ${
              filter === 'all'
                ? 'text-teal-600 border-b-2 border-teal-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All Bookings ({bookings.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`pb-3 font-semibold transition ${
              filter === 'pending'
                ? 'text-teal-600 border-b-2 border-teal-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Pending ({bookings.filter(b => b.paymentStatus === 'Pending').length})
          </button>
          <button
            onClick={() => setFilter('paid')}
            className={`pb-3 font-semibold transition ${
              filter === 'paid'
                ? 'text-teal-600 border-b-2 border-teal-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Paid ({bookings.filter(b => b.paymentStatus === 'Paid').length})
          </button>
        </div>

        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600 text-lg mb-4">
              {bookings.length === 0 ? 'No bookings yet.' : 'No bookings with this status.'}
            </p>
            <p className="text-gray-500">
              {bookings.length === 0
                ? 'When guests book your properties, they will appear here.'
                : 'Try changing the filter to see more bookings.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map(booking => (
              <div key={booking._id} className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6">
                  {/* Property & Guest Info */}
                  <div className="md:col-span-2">
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-gray-500 mb-1">PROPERTY</p>
                      <p className="text-lg font-bold text-gray-900">{booking.property?.name}</p>
                      <p className="text-sm text-gray-600">
                        {booking.property?.city}, {booking.property?.state}
                      </p>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <p className="text-xs font-semibold text-gray-500 mb-1">GUEST</p>
                      <p className="text-lg font-bold text-gray-900">{booking.user?.name}</p>
                      <div className="text-sm text-gray-600 space-y-1 mt-2">
                        {booking.user?.phone && (
                          <p>
                            📞 <a href={`tel:${booking.user.phone}`} className="text-teal-600 hover:underline">
                              {booking.user.phone}
                            </a>
                          </p>
                        )}
                        {booking.user?.email && (
                          <p>
                            ✉️ <a href={`mailto:${booking.user.email}`} className="text-teal-600 hover:underline">
                              {booking.user.email}
                            </a>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Booking Details */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-2">BOOKING DETAILS</p>
                    <div className="space-y-2 text-sm">
                      {booking.fromDate && booking.toDate ? (
                        <>
                          <div>
                            <p className="text-gray-600">Check-in: {formatDate(booking.fromDate)}</p>
                            <p className="text-gray-600">Check-out: {formatDate(booking.toDate)}</p>
                          </div>
                        </>
                      ) : booking.duration ? (
                        <div>
                          <p className="text-gray-600">Duration: {booking.duration} {booking.durationUnit}</p>
                        </div>
                      ) : null}
                      <div>
                        <p className="text-gray-600">Guests: {booking.guests}</p>
                      </div>
                    </div>
                  </div>

                  {/* Payment & Amount */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-2">AMOUNT & STATUS</p>
                    <div className="space-y-2">
                      <p className="text-2xl font-bold text-teal-600">₹{booking.totalPrice}</p>
                      {/* Status Badge */}
                      <span className={`inline-block px-3 py-1 rounded text-sm font-semibold ${
                        booking.paymentStatus === 'Paid'
                          ? 'bg-green-100 text-green-800'
                          : booking.paymentStatus === 'Pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : booking.paymentStatus === 'Pay on Location'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {booking.paymentStatus}
                      </span>
                      {/* Payment Method */}
                      {booking.paymentMethod && (
                        <div className="text-xs text-gray-600 mt-2 pt-2 border-t border-gray-200">
                          <p className="font-semibold text-gray-700 mb-1">Payment:</p>
                          {booking.paymentMethod === 'Razorpay' ? (
                            <p>🔒 {booking.paymentMethod}</p>
                          ) : booking.paymentMethod === 'Pay on Location' ? (
                            <p>💵 Cash at Location</p>
                          ) : (
                            <p>{booking.paymentMethod}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Booking ID */}
                <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 flex justify-between items-center">
                  <p className="text-xs text-gray-500">
                    Booking ID: <span className="font-mono text-gray-700">{booking._id}</span>
                  </p>
                  <p className="text-xs text-gray-500">
                    Booked on: {new Date(booking.createdAt).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
