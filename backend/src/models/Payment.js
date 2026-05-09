const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: "LKR" },
  paymentMethod: { type: String, enum: ["Card", "Bank Transfer", "Cash"], default: "Card" },
  transactionId: { type: String, required: true }, 
  status: { type: String, enum: ["Pending", "Completed", "Failed"], default: "Pending" },
  paidAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Payment", PaymentSchema);