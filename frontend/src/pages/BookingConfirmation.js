import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import { AuthContext } from '../utils/authContext';

export default function BookingConfirmation() {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useContext(AuthContext);
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('online'); // 'online' or 'offline'

  // Get booking details from URL params
  const fromDate = searchParams.get('from');
  const toDate = searchParams.get('to');
  const guests = searchParams.get('guests') || 1;
  const rentalDuration = searchParams.get('duration');
  const durationUnit = searchParams.get('durationUnit');

  useEffect(() => {
    if (!user) {
      navigate(`/login?next=booking/${propertyId}`);
      return;
    }

    const loadProperty = async () => {
      try {
        const res = await api.get(`/properties/${propertyId}`);
        setProperty(res.data.property);
      } catch (err) {
        setMessage('Failed to load property: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    loadProperty();
  }, [propertyId, user, navigate]);

  const handleCreateBooking = async () => {
    const pricingInfo = calculatePricingInfo();
    if (!pricingInfo) {
      setMessage('Please provide all booking details');
      return;
    }

    setIsSubmitting(true);
    try {
      const bookingData = {
        property: propertyId,
        guests: parseInt(guests),
        paymentStatus: paymentMethod === 'offline' ? 'Pay on Location' : 'Pending',
        totalPrice: pricingInfo.totalPrice,
        paymentMethod: paymentMethod === 'online' ? 'Razorpay' : 'Pay on Location'
      };

      // Add appropriate date/duration fields
      if (pricingInfo.type === 'daily') {
        bookingData.fromDate = pricingInfo.fromDate;
        bookingData.toDate = pricingInfo.toDate;
      } else {
        bookingData.duration = pricingInfo.duration;
        bookingData.durationUnit = pricingInfo.durationUnit;
      }

      // Create booking
      const res = await api.post('/bookings', bookingData);

      if (res.data.booking) {
        navigate('/my-bookings', { state: { message: 'Booking created! ' + (paymentMethod === 'online' ? 'Proceed to Razorpay payment.' : 'You will pay the host at location.') } });
      }
    } catch (err) {
      setMessage('Failed to create booking: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate pricing and duration info
  const calculatePricingInfo = () => {
    if (!property) return null;

    // For daily rentals (Hotels, Resorts, Villas)
    if (['Hotel Room', 'Resort', 'Villa'].includes(property.type)) {
      if (!fromDate || !toDate) return null;

      const from = new Date(fromDate);
      const to = new Date(toDate);
      const nights = Math.ceil((to - from) / (1000 * 60 * 60 * 24));
      const pricePerDay = property.pricePerDay || 0;
      const totalPrice = pricePerDay * nights;

      return {
        type: 'daily',
        nights,
        pricePerDay,
        totalPrice,
        fromDate,
        toDate
      };
    }

    // For rental houses
    if (property.type === 'House for Rent' && rentalDuration && durationUnit) {
      const duration = parseInt(rentalDuration);
      
      if (property.rentalType === 'Rent') {
        const monthlyPrice = property.monthlyPrice || 0;
        // For monthly rentals, calculate based on months
        let totalMonths = duration;
        if (durationUnit === 'years') {
          totalMonths = duration * 12;
        }
        const totalPrice = monthlyPrice * totalMonths;

        return {
          type: 'rental-rent',
          duration,
          durationUnit,
          totalMonths,
          monthlyPrice,
          totalPrice
        };
      } else if (property.rentalType === 'Lease') {
        // For leases, use the lease price regardless of selected duration
        const leasePrice = property.leasePrice || 0;
        const advanceAmount = property.advanceAmount || 0;
        const totalPrice = leasePrice + advanceAmount;

        return {
          type: 'rental-lease',
          duration,
          durationUnit,
          leasePrice,
          advanceAmount,
          totalPrice
        };
      }
    }

    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600 text-lg">Loading property details...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">Property not found</p>
          <button
            onClick={() => navigate('/home')}
            className="bg-teal-600 text-white px-6 py-2 rounded font-semibold hover:bg-teal-700"
          >
            Back to Properties
          </button>
        </div>
      </div>
    );
  }

  const pricingInfo = calculatePricingInfo();

  if (!pricingInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-gray-600 text-lg mb-4">Please provide all booking details</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-teal-600 text-white px-6 py-2 rounded font-semibold hover:bg-teal-700"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-6">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Confirm Your Booking</h1>

        {message && (
          <div className={`mb-6 p-4 rounded ${message.includes('Failed') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Property Details */}
          <div className="md:col-span-2 bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Property Details</h2>

            {/* Property Image */}
            <div className="mb-6">
              <img
                src={property.images?.[0] || 'https://via.placeholder.com/500x300'}
                alt={property.name}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>

            {/* Property Info */}
            <div className="space-y-3 mb-6">
              <h3 className="text-xl font-bold text-gray-900">{property.name}</h3>
              <p className="text-gray-600">{property.address}</p>
              <p className="text-gray-600">
                {property.city}, {property.state}
              </p>
              <p className="text-teal-600 font-semibold text-lg">
                {pricingInfo.type === 'daily' && `₹${property.pricePerDay}/night`}
                {pricingInfo.type === 'rental-rent' && `₹${property.monthlyPrice}/month`}
                {pricingInfo.type === 'rental-lease' && `₹${property.leasePrice} (Lease)`}
              </p>
            </div>

            <hr className="my-6" />

            {/* Booking Summary */}
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Booking Summary</h2>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Number of Guests:</span>
                <span className="font-semibold">{guests}</span>
              </div>

              {/* For Daily Rentals */}
              {pricingInfo.type === 'daily' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Check-in:</span>
                    <span className="font-semibold">{new Date(pricingInfo.fromDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Check-out:</span>
                    <span className="font-semibold">{new Date(pricingInfo.toDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Number of Nights:</span>
                    <span className="font-semibold">{pricingInfo.nights}</span>
                  </div>

                  <hr className="my-4" />

                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      ₹{pricingInfo.pricePerDay} × {pricingInfo.nights} night{pricingInfo.nights > 1 ? 's' : ''}
                    </span>
                    <span className="font-semibold">₹{pricingInfo.totalPrice}</span>
                  </div>
                </>
              )}

              {/* For Monthly Rentals */}
              {pricingInfo.type === 'rental-rent' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-semibold">
                      {pricingInfo.duration} {pricingInfo.durationUnit === 'years' ? 'Year(s)' : 'Month(s)'}
                      {pricingInfo.durationUnit === 'years' && ` (${pricingInfo.totalMonths} months)`}
                    </span>
                  </div>

                  <hr className="my-4" />

                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      ₹{pricingInfo.monthlyPrice} × {pricingInfo.totalMonths} month{pricingInfo.totalMonths > 1 ? 's' : ''}
                    </span>
                    <span className="font-semibold">₹{pricingInfo.totalPrice}</span>
                  </div>
                </>
              )}

              {/* For Lease Rentals */}
              {pricingInfo.type === 'rental-lease' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lease Price:</span>
                    <span className="font-semibold">₹{pricingInfo.leasePrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Advance Amount:</span>
                    <span className="font-semibold">₹{pricingInfo.advanceAmount}</span>
                  </div>

                  <hr className="my-4" />

                  <div className="flex justify-between">
                    <span className="text-gray-600">Lease + Advance:</span>
                    <span className="font-semibold">₹{pricingInfo.totalPrice}</span>
                  </div>
                </>
              )}

              <hr className="my-4" />

              <div className="flex justify-between text-lg font-bold text-teal-600">
                <span>Total Price:</span>
                <span>₹{pricingInfo.totalPrice}</span>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Method</h3>
              <div className="space-y-3">
                {/* Online Payment Option */}
                <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer transition" style={{borderColor: paymentMethod === 'online' ? '#06b6d4' : '#e5e7eb', backgroundColor: paymentMethod === 'online' ? '#ecf9fb' : 'white'}}>
                  <input
                    type="radio"
                    name="payment"
                    value="online"
                    checked={paymentMethod === 'online'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 mr-3"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Pay Online (Razorpay)</p>
                    <p className="text-sm text-gray-600">Secure online payment, immediate confirmation</p>
                  </div>
                </label>

                {/* Offline Payment Option */}
                <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer transition" style={{borderColor: paymentMethod === 'offline' ? '#06b6d4' : '#e5e7eb', backgroundColor: paymentMethod === 'offline' ? '#ecf9fb' : 'white'}}>
                  <input
                    type="radio"
                    name="payment"
                    value="offline"
                    checked={paymentMethod === 'offline'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-4 h-4 mr-3"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">Pay at Location</p>
                    <p className="text-sm text-gray-600">Pay directly to the host when you arrive</p>
                  </div>
                </label>
              </div>
            </div>

            <button
              onClick={handleCreateBooking}
              disabled={isSubmitting}
              className="w-full bg-teal-600 text-white py-3 rounded font-bold text-lg hover:bg-teal-700 transition disabled:bg-gray-400"
            >
              {isSubmitting ? 'Processing...' : `Confirm Booking (${paymentMethod === 'online' ? 'Pay Online' : 'Pay at Location'})`}
            </button>

            <p className="text-gray-600 text-center text-sm mt-4">
              {paymentMethod === 'online' ? 'You will be redirected to Razorpay for payment' : 'The host will confirm once you arrive and complete payment'}
            </p>
          </div>

          {/* Price Breakdown Sidebar */}
          <div className="bg-white rounded-lg shadow p-6 h-fit">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Price Breakdown</h3>

            <div className="space-y-3 text-sm">
              {pricingInfo.type === 'daily' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nightly rate:</span>
                    <span className="font-semibold">₹{pricingInfo.pricePerDay}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Number of nights:</span>
                    <span className="font-semibold">{pricingInfo.nights}</span>
                  </div>
                </>
              )}

              {pricingInfo.type === 'rental-rent' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monthly rate:</span>
                    <span className="font-semibold">₹{pricingInfo.monthlyPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-semibold">{pricingInfo.totalMonths} months</span>
                  </div>
                </>
              )}

              {pricingInfo.type === 'rental-lease' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lease price:</span>
                    <span className="font-semibold">₹{pricingInfo.leasePrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Advance:</span>
                    <span className="font-semibold">₹{pricingInfo.advanceAmount}</span>
                  </div>
                </>
              )}

              <hr className="my-3" />

              <div className="flex justify-between text-base font-bold">
                <span>Total:</span>
                <span className="text-teal-600">₹{pricingInfo.totalPrice}</span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-800">
                ℹ️ This booking will be confirmed after payment processing. The host will be notified immediately.
              </p>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-8">
          <button
            onClick={() => navigate(-1)}
            className="text-teal-600 font-semibold hover:text-teal-700"
          >
            ← Back
          </button>
        </div>
      </div>
    </div>
  );
}
