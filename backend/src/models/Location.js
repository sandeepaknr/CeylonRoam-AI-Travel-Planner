const mongoose = require('mongoose');

const LocationSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String,
});

module.exports = mongoose.model('Location', LocationSchema);