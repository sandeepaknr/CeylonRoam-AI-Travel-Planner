const mongoose = require('mongoose');

const PackageSchema = new mongoose.Schema({
  // ── Core fields ────────────────────────────────────────
  name:        { type: String, required: true },
  description: { type: String, required: true },
  price:       { type: Number, required: true },
  category:    { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  location:    { type: String, required: true },
  latitude:    { type: Number, default: null },
  longitude:   { type: Number, default: null },
  creator:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  image:       { type: String },
  images:      { type: [String], default: [] },
  createdAt:   { type: Date, default: Date.now },

  // ── NEW: Listing type ──────────────────────────────────
  // 'Service' = bookable resource (hotel room, guide, vehicle)
  // 'Package' = curated tour / itinerary
  listingType: {
    type: String,
    enum: ['Service', 'Package'],
    default: 'Service',
  },

  // ── Admin: Featured flag ───────────────────────────────
  isFeatured: { type: Boolean, default: false },

  // ── Analytics: View counter ────────────────────────────
  views: { type: Number, default: 0 },


  // ── Service category (for listingType === 'Service') ───
  serviceCategory: {
    type: String,
    enum: ['Hotel Package', 'Guide', 'Chauffeur Guide', 'Rent Vehicle', 'Hire Vehicle'],
    default: 'Hotel Package',
  },

  // ── Guide / Chauffeur service fields ───────────────────
  languages:      { type: [String], default: [] },
  specialization: { type: String,   default: '' },

  // ── Vehicle service fields ─────────────────────────────
  pricingType:   { type: String, default: '' },  // 'Per Day' | 'Per KM'
  includedKM:    { type: Number, default: null }, // Rent: KM included / day
  extraKMCharge: { type: Number, default: null }, // Rent: charge / extra KM

  // ── NEW: Package / itinerary fields ───────────────────
  // (only populated when listingType === 'Package')
  itinerary:  { type: String, default: '' },     // Day-by-day plan textarea
  inclusions: { type: [String], default: [] },   // e.g. ['Entry fees','Lunch','Guide']
  duration:   { type: String, default: '' },     // e.g. '2 Days / 1 Night'
});

module.exports = mongoose.model('Package', PackageSchema);