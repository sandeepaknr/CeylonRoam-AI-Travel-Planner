const mongoose = require('mongoose');

const BusinessSchema = new mongoose.Schema({
  name: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Hotel', 'Guides', 'Rent a Car'], 
    required: true 
  },
  location: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
  longitude: { type: Number, required: true },
  latitude: { type: Number, required: true },
  address: { type: String, required: true },
  contact: { type: String, required: true },
  email: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Business', BusinessSchema);