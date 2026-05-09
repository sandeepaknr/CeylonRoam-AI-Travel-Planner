const mongoose = require("mongoose");

const SlipSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
  packageId: { type: mongoose.Schema.Types.ObjectId, ref: "Package", required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  packageName: String,
  customerName: String,
  amount: Number,
  startDate: Date,
  endDate: Date,
  generatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Slip", SlipSchema);