const Payment = require("../models/Payment");
const Booking = require("../models/Booking");

exports.processPayment = async (req, res) => {
  try {
    const { bookingId, customerId, amount, transactionId, paymentMethod } = req.body;

    const newPayment = new Payment({
      bookingId,
      customerId,
      amount,
      transactionId,
      paymentMethod,
      status: "Completed"
    });

    const savedPayment = await newPayment.save();

    await Booking.findByIdAndUpdate(bookingId, {
      status: "Pending",
      paymentStatus: "Paid"
    });

    res.status(201).json({ success: true, message: "Payment Successful", data: savedPayment });
  } catch (err) {
    res.status(500).json({ success: false, message: "Payment processing failed", error: err.message });
  }
};