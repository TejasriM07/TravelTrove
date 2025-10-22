const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  host: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['Hotel Room','Resort','Villa','House for Rent'], required: true },
  state: { type: String },
  city: { type: String },
  address: { type: String },
  gpsUrl: { type: String },
  openingTime: { type: String },
  closingTime: { type: String },
  pricePerDay: { type: Number },
  rentalType: { type: String, enum: ['Rent','Lease'] },
  monthlyPrice: { type: Number },
  leaseTimeLimit: { type: String },
  advanceAmount: { type: Number },
  leasePrice: { type: Number },
  maxGuests: { type: Number },
  bedrooms: { type: String },
  facilities: [String],
  images: [String],
  available: { type: Boolean, default: true },
  // Track listing completion status
  completionStatus: {
    basicInfo: { type: Boolean, default: false },
    images: { type: Boolean, default: false },
    pricing: { type: Boolean, default: false },
    razorpay: { type: Boolean, default: false }
  }
}, { timestamps: true });

module.exports = mongoose.model('Property', propertySchema);
