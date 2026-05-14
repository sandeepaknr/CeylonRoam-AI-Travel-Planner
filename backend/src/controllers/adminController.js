const User    = require("../models/User");
const Package = require("../models/Package");
const Booking = require("../models/Booking");
const Trip    = require("../models/Trip");

/* ─────────────────────────────────────────────────────────────
   GET /api/admin/dynamic-stats  (keep existing endpoint intact)
   ───────────────────────────────────────────────────────────── */
exports.getAdminStats = async (req, res) => {
  try {
    const totalUsers       = await User.countDocuments({ accountType: "user" });
    const businessUsers    = await User.countDocuments({ accountType: "business" });
    const pendingRequests  = await User.countDocuments({ accountType: "pending" });
    const totalPackages    = await Package.countDocuments();

    const recentBusinesses = await User.find({ accountType: { $in: ["business", "pending"] } })
      .sort({ createdAt: -1 })
      .limit(5);

    const uploadStats = [
      { name: "Mon", uploads: 4 },
      { name: "Tue", uploads: 7 },
      { name: "Wed", uploads: 5 },
      { name: "Thu", uploads: 12 },
      { name: "Fri", uploads: 9 },
    ];

    res.status(200).json({
      stats: { totalUsers, businessUsers, totalPackages, pendingRequests },
      recentBusinesses,
      uploadStats,
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

/* ─────────────────────────────────────────────────────────────
   GET /api/admin/analytics
   Aggregates live metrics for the Analytics Dashboard charts
   ───────────────────────────────────────────────────────────── */
exports.getAnalytics = async (req, res) => {
  try {
    /* ── 1. Monthly Revenue — aggregate confirmed/completed bookings ── */
    const monthlyRevenue = await Booking.aggregate([
      { $match: { status: { $in: ["Confirmed", "Completed"] } } },
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
          revenue: { $sum: "$totalCharge" },
          bookings: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 12 },
      {
        $project: {
          _id: 0,
          name: {
            $concat: [
              { $arrayElemAt: [
                  ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
                  { $subtract: ["$_id.month", 1] }
                ]
              },
              " ", { $toString: "$_id.year" }
            ]
          },
          revenue: 1,
          bookings: 1,
        },
      },
    ]);

    /* ── 2. Revenue by Service Category ── */
    const revenueByCategory = await Booking.aggregate([
      { $match: { status: { $in: ["Confirmed", "Completed"] } } },
      { $lookup: { from: "packages", localField: "packageId", foreignField: "_id", as: "pkg" } },
      { $unwind: "$pkg" },
      {
        $group: {
          _id: "$pkg.serviceCategory",
          value: { $sum: "$totalCharge" },
        },
      },
      { $project: { _id: 0, name: "$_id", value: 1 } },
      { $sort: { value: -1 } },
    ]);

    /* ── 3. Top 5 Most Viewed Packages ── */
    const topPackages = await Package.find()
      .sort({ views: -1 })
      .limit(5)
      .populate("creator", "username email")
      .select("name price views serviceCategory listingType creator");

    /* ── 4. Geographic Distribution: Bookings by Country ── */
    const bookingsByCountry = await Booking.aggregate([
      { $lookup: { from: "users", localField: "customerId", foreignField: "_id", as: "user" } },
      { $unwind: "$user" },
      { $group: { _id: "$user.country", count: { $sum: 1 } } },
      { $project: { _id: 0, country: "$_id", bookings: "$count" } },
      { $sort: { bookings: -1 } },
      { $limit: 10 }
    ]);

    /* ── 5. Geographic Distribution: Trips by Country ── */
    const tripsByCountry = await Trip.aggregate([
      { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "user" } },
      { $unwind: "$user" },
      { $group: { _id: "$user.country", count: { $sum: 1 } } },
      { $project: { _id: 0, country: "$_id", trips: "$count" } },
      { $sort: { trips: -1 } },
      { $limit: 10 }
    ]);

    /* ── 6. System-wide Counts ── */
    const [totalUsers, totalProviders, totalActivePackages, totalBookings, totalRevResult] =
      await Promise.all([
        User.countDocuments({ accountType: "user" }),
        User.countDocuments({ accountType: "business" }),
        Package.countDocuments(),
        Booking.countDocuments(),
        Booking.aggregate([
          { $match: { status: { $in: ["Confirmed", "Completed"] } } },
          { $group: { _id: null, total: { $sum: "$totalCharge" } } },
        ]),
      ]);

    const totalRevenue = totalRevResult[0]?.total || 0;

    res.status(200).json({
      monthlyRevenue,
      revenueByCategory,
      topPackages,
      bookingsByCountry,
      tripsByCountry,
      systemStats: { totalUsers, totalProviders, totalActivePackages, totalBookings, totalRevenue },
    });
  } catch (err) {
    console.error("[getAnalytics]", err.message);
    res.status(500).json({ message: "Analytics Error", error: err.message });
  }
};