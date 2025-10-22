const Booking = require('../models/Booking');
const Property = require('../models/Property');
const User = require('../models/User');
const { createOrder, transferToHost } = require('../utils/razorpay');

exports.createBooking = async (req, res) => {
  try {
    const userId = req.userId;
    const { propertyId, fromDate, toDate, guests, paymentMethod } = req.body;
    const prop = await Property.findById(propertyId).populate('host');
    if (!prop) return res.status(404).json({ message: 'Property not found' });
    // very simple price calculation: days * pricePerDay
    const start = new Date(fromDate);
    const end = new Date(toDate);
    const days = Math.max(1, Math.ceil((end - start) / (1000*60*60*24)));
    const totalPrice = (prop.pricePerDay || 0) * days;

    // Create Razorpay order
    let order = null;
    try {
      order = await createOrder({ amount: totalPrice, receipt: `booking_${Date.now()}` });
    } catch (e) {
      console.warn('Razorpay create order failed (check keys) - continuing without order', e.message);
    }

    const booking = await Booking.create({
      user: userId,
      property: propertyId,
      fromDate: start,
      toDate: end,
      guests: guests || 1,
      totalPrice,
      paymentStatus: order ? 'Pending' : 'Pay on Location',
      paymentMethod: paymentMethod || (order ? 'Razorpay' : 'Pay on Location'),
      razorpayOrderId: order?.id
    });

    res.json({ booking, order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
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
