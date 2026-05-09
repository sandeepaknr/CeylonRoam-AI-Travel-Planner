const User    = require("../models/User");
const Package = require("../models/Package");
const Booking = require("../models/Booking");

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ accountType: { $ne: "admin" } }).select("-password");
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users", error: err.message });
  }
};

exports.suspendUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "User account suspended successfully" });
  } catch (err) {
    res.status(500).json({ message: "Suspend failed", error: err.message });
  }
};

/* ─────────────────────────────────────────────────────────────
   DELETE /api/accountmanagement/users/delete/:id
   Admin: cascading delete — Packages → Bookings → User
   ───────────────────────────────────────────────────────────── */
exports.deleteUserCascade = async (req, res) => {
  const { id } = req.params;
  try {
    // 1️⃣  Find all packages this user created (need IDs for booking cleanup)
    const userPackages = await Package.find({ creator: id }).select("_id");
    const packageIds   = userPackages.map(p => p._id);

    // 2️⃣  Delete associated bookings
    //     — bookings the user made (bookedBy)
    //     — bookings referencing packages they own (package field)
    const bookingResult = await Booking.deleteMany({
      $or: [
        { bookedBy: id },
        { package:  { $in: packageIds } },
      ],
    });

    // 3️⃣  Delete all packages they created
    const packageResult = await Package.deleteMany({ creator: id });

    // 4️⃣  Delete the user document
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) return res.status(404).json({ message: "User not found" });

    res.status(200).json({
      message:         "User and all associated data deleted successfully.",
      deletedPackages: packageResult.deletedCount,
      deletedBookings: bookingResult.deletedCount,
    });
  } catch (err) {
    console.error("[deleteUserCascade]", err.message);
    res.status(500).json({ message: "Cascade delete failed: " + err.message });
  }
};