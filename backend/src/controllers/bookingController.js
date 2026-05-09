const Booking = require("../models/Booking");
const mongoose = require("mongoose");


exports.createBooking = async (req, res) => {
  try {
    const {
      packageId,
      customerId,
      startDate,
      endDate,
      numberOfDays,
      chargePerUnit,
      totalCharge,   // preferred field name
      totalPrice,    // fallback if frontend sends this
      status,
    } = req.body;

    // Accept either totalCharge or totalPrice from frontend
    const finalCharge = Number(totalCharge || totalPrice || 0);

    // Guard: reject if essential fields are missing
    if (!packageId || !customerId || !startDate || !endDate) {
      return res.status(400).json({ message: "packageId, customerId, startDate, and endDate are required." });
    }

    // Check for existing date conflict
    const existingBooking = await Booking.findOne({
      packageId,
      status: "Confirmed",
      $or: [
        { startDate: { $lte: new Date(endDate) }, endDate: { $gte: new Date(startDate) } }
      ]
    });

    if (existingBooking) {
      return res.status(400).json({ message: "Sorry, this package is already booked for the selected dates." });
    }

    // Auto-calculate 10% admin commission / 90% provider earnings
    const adminCommission   = parseFloat((finalCharge * 0.10).toFixed(2));
    const providerEarnings  = parseFloat((finalCharge * 0.90).toFixed(2));

    const newBooking = new Booking({
      packageId,
      customerId,
      startDate:        new Date(startDate),
      endDate:          new Date(endDate),
      numberOfDays:     Number(numberOfDays) || 1,
      chargePerUnit:    Number(chargePerUnit) || 0,
      totalCharge:      finalCharge,
      status:           status || "Confirmed",
      adminCommission,
      providerEarnings,
    });

    const savedBooking = await newBooking.save();

    // ✅ Verification log — visible in your backend terminal
    console.log("✅ New Booking Saved:", {
      _id:             savedBooking._id,
      packageId:       savedBooking.packageId,
      customerId:      savedBooking.customerId,
      numberOfDays:    savedBooking.numberOfDays,
      totalCharge:     savedBooking.totalCharge,
      status:          savedBooking.status,
      adminCommission: savedBooking.adminCommission,
      providerEarnings: savedBooking.providerEarnings,
    });

    res.status(201).json(savedBooking);
  } catch (err) {
    console.error("❌ createBooking error:", err.message);
    res.status(500).json({ message: "Server error during booking", error: err.message });
  }
};


exports.checkAvailability = async (req, res) => {
  try {
    const { packageId, startDate, endDate } = req.query;
    const existing = await Booking.findOne({
      packageId,
      $or: [
        { startDate: { $lte: new Date(endDate) }, endDate: { $gte: new Date(startDate) } }
      ]
    });
    res.json({ available: !existing });
  } catch (err) {
    res.status(500).json({ message: "Error checking availability" });
  }
};

exports.getBookingById = async (req, res) => {
    try {
        const { id } = req.params;

        const booking = await Booking.findById(id).populate('packageId');

        if (!booking) {
            return res.status(404).json({ message: "Booking record not found" });
        }

        res.status(200).json(booking);
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

exports.getMyBookings = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid or missing User ID" });
    }
    const bookings = await Booking.find({ 
      customerId: new mongoose.Types.ObjectId(userId) 
    })
    .populate("packageId")
    .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (err) {
    console.error("Backend Error:", err); 
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

/* ─────────────────────────────────────────────────────────
   GET /api/bookings/my-business-bookings/:userId
   Returns all bookings for packages owned by this seller.
   ───────────────────────────────────────────────────────── */
exports.getBusinessBookings = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid or missing User ID" });
    }

    const Package = require("../models/Package");

    // Step 1: find all packages owned by this seller
    const myPackages = await Package.find({
      creator: new mongoose.Types.ObjectId(userId),
    }).select("_id");

    const packageIds = myPackages.map(p => p._id);

    if (packageIds.length === 0) {
      return res.status(200).json([]);
    }

    // Step 2: find all bookings referencing those packages
    const bookings = await Booking.find({ packageId: { $in: packageIds } })
      .populate("customerId", "username email")
      .populate("packageId",  "name serviceCategory")
      .sort({ createdAt: -1 });

    res.status(200).json(bookings);
  } catch (err) {
    console.error("getBusinessBookings error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};