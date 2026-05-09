const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  tripTitle: String,
  totalEstimatedCost: String,
  fullPlanDescription: String,
  itinerary: { type: Array, default: [] },
  budget: String,
  days: Number,
  members: Number,
  transport: String
}, { timestamps: true });

module.exports = mongoose.model("Trip", tripSchema);