const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  fromDate: { type: Date },
  toDate: { type: Date },
  guests: { type: Number, default: 1 },
  totalPrice: { type: Number, required: true },
  paymentStatus: { type: String, enum: ['Paid','Pending','Pay on Location'], default: 'Pending' },
  paymentMethod: { type: String },
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
  // For rental properties (months/years)
  duration: { type: Number },
  durationUnit: { type: String, enum: ['months', 'years'] },
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
