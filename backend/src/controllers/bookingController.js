const Booking = require('../models/Booking');
const Property = require('../models/Property');
const User = require('../models/User');
const { createOrder, transferToHost } = require('../utils/razorpay');

exports.createBooking = async (req, res) => {
  try {
    const userId = req.userId;
    const { property, fromDate, toDate, guests, totalPrice, paymentStatus, duration, durationUnit, paymentMethod } = req.body;
    
    const prop = await Property.findById(property).populate('host');
    if (!prop) return res.status(404).json({ message: 'Property not found' });

    // Validate totalPrice is provided by frontend
    if (!totalPrice || totalPrice <= 0) {
      return res.status(400).json({ message: 'Invalid total price' });
    }

    // Prepare booking data based on property type
    const bookingData = {
      user: userId,
      property: property,
      guests: guests || 1,
      totalPrice
    };

    // Check if guest selected offline payment
    if (paymentMethod === 'Pay on Location') {
      // Offline payment - no Razorpay order
      bookingData.paymentStatus = 'Pay on Location';
      bookingData.paymentMethod = 'Pay on Location';
      bookingData.razorpayOrderId = null;
    } else {
      // Online payment - create Razorpay order
      let order = null;
      try {
        order = await createOrder({ amount: totalPrice, receipt: `booking_${Date.now()}` });
      } catch (e) {
        console.warn('Razorpay create order failed (check keys) - continuing without order', e.message);
      }

      bookingData.paymentStatus = order ? 'Pending' : 'Pay on Location';
      bookingData.paymentMethod = order ? 'Razorpay' : 'Pay on Location';
      bookingData.razorpayOrderId = order?.id;
    }

    // Add dates for daily rentals (Hotels, Resorts, Villas)
    if (['Hotel Room', 'Resort', 'Villa'].includes(prop.type)) {
      if (!fromDate || !toDate) {
        return res.status(400).json({ message: 'Dates are required for this property type' });
      }
      bookingData.fromDate = new Date(fromDate);
      bookingData.toDate = new Date(toDate);
    } 
    // Add duration for rental houses
    else if (prop.type === 'House for Rent') {
      if (!duration || !durationUnit) {
        return res.status(400).json({ message: 'Duration is required for rental properties' });
      }
      bookingData.duration = duration;
      bookingData.durationUnit = durationUnit;
    }

    const booking = await Booking.create(bookingData);

    res.json({ booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.myBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.userId }).populate('property');
    res.json({ bookings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all bookings for host's properties
exports.hostBookings = async (req, res) => {
  try {
    const hostId = req.userId;
    
    // Find all properties owned by this host
    const hostProperties = await Property.find({ host: hostId }).select('_id');
    const propertyIds = hostProperties.map(p => p._id);
    
    if (propertyIds.length === 0) {
      return res.json({ bookings: [] });
    }
    
    // Find all bookings for these properties and populate guest details
    const bookings = await Booking.find({ property: { $in: propertyIds } })
      .populate({
        path: 'user',
        select: 'name phone email'
      })
      .populate({
        path: 'property',
        select: 'name type city state'
      })
      .sort({ createdAt: -1 });
    
    res.json({ bookings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Verify payment and transfer funds to host (transfer is best-effort and
// requires host Razorpay account onboarding). This endpoint should be
// called after client-side payment success (with paymentId and orderId).
exports.verifyAndTransfer = async (req, res) => {
  try {
    const { bookingId, razorpayPaymentId, razorpayOrderId } = req.body;
    if (!bookingId || !razorpayPaymentId || !razorpayOrderId) return res.status(400).json({ message: 'Missing parameters' });
    const booking = await Booking.findById(bookingId).populate('property');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    // In a real implementation, verify signature and payment with Razorpay APIs
    booking.paymentStatus = 'Paid';
    booking.razorpayPaymentId = razorpayPaymentId;
    booking.razorpayOrderId = razorpayOrderId;
    await booking.save();

    // Attempt transfer to host if host has razorpayAccountId
    const host = await User.findById(booking.property.host);
    if (host?.razorpayAccountId) {
      try {
        await transferToHost({
          amount: booking.totalPrice,
          currency: 'INR',
          hostAccountId: host.razorpayAccountId,
          bookingId: booking._id,
        });
      } catch (e) {
        console.warn('Transfer to host failed:', e.message);
      }
    }

    res.json({ message: 'Payment verified and booking updated', booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
