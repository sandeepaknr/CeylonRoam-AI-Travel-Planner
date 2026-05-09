const Booking = require("../models/Booking");
const Package = require("../models/Package");
const Payment = require("../models/Payment");
const Slip = require("../models/Slip");

exports.getSellerBookings = async (req, res) => {
  try {
    const { sellerId } = req.query;

    const sellerPackages = await Package.find({ creator: sellerId }).select("_id");
    const packageIds = sellerPackages.map(pkg => pkg._id);

    const bookings = await Booking.find({ packageId: { $in: packageIds } })
      .populate("packageId", "name price")
      .populate("customerId", "username email")
      .sort({ createdAt: -1 });

    const bookingsWithPayments = await Promise.all(
      bookings.map(async (booking) => {
        const payment = await Payment.findOne({ bookingId: booking._id });
        return {
          ...booking._doc,
          paymentStatus: payment ? payment.status : "Not Initiated",
          transactionId: payment ? payment.transactionId : "N/A"
        };
      })
    );

    res.status(200).json(bookingsWithPayments);
  } catch (err) {
    res.status(500).json({ message: "Error fetching seller bookings", error: err.message });
  }
};

exports.getSlipByBookingId = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const slip = await Slip.findOne({ bookingId: bookingId });

    if (!slip) {
      return res.status(404).json({ message: "Slip not found for this booking" });
    }

    res.status(200).json(slip);
  } catch (err) {
    res.status(500).json({ message: "Error retrieving slip", error: err.message });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status } = req.body;

    const updatedBooking = await Booking.findByIdAndUpdate(
      bookingId,
      { status },
      { new: true }
    ).populate("packageId customerId");

    if (status === "Confirmed") {
      const newSlip = new Slip({
        bookingId: updatedBooking._id,
        packageId: updatedBooking.packageId._id,
        customerId: updatedBooking.customerId._id,
        sellerId: updatedBooking.packageId.creator, 
        packageName: updatedBooking.packageId.name,
        customerName: updatedBooking.customerId.username,
        amount: updatedBooking.totalCharge,
        startDate: updatedBooking.startDate,
        endDate: updatedBooking.endDate
      });

      await newSlip.save();
      console.log("Slip generated successfully!");
    }

    res.status(200).json(updatedBooking);
  } catch (err) {
    res.status(500).json({ message: "Operation failed", error: err.message });
  }
};