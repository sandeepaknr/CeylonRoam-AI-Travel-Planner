const Business = require("../models/Business");
const Package = require("../models/Package");
const User = require("../models/User");

exports.registerBusiness = async (req, res) => {
  try {
    const newBusiness = new Business(req.body);
    const savedBusiness = await newBusiness.save();
    res.status(201).json(savedBusiness);
  } catch (err) {
    res.status(500).json({ message: "Registration failed", error: err.message });
  }
};

exports.requestBusinessRegistration = async (req, res) => {
  try {
    const { owner, ...businessData } = req.body;

    const newBusiness = new Business({
      ...businessData,
      owner: owner 
    });
    const savedBusiness = await newBusiness.save();

    await User.findByIdAndUpdate(owner, { 
      accountType: "pending" 
    });

    res.status(201).json({
      message: "Business request submitted. Account status is now pending approval.",
      business: savedBusiness
    });

  } catch (err) {
    console.error("Registration Error:", err.message);
    res.status(500).json({ message: "Registration failed", error: err.message });
  }
};

exports.updateBusiness = async (req, res) => {
  try {
    const updatedBusiness = await Business.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(updatedBusiness);
  } catch (err) {
    res.status(500).json({ message: "Update failed", error: err.message });
  }
};

exports.getUserBusiness = async (req, res) => {
  try {
    const business = await Business.findOne({ owner: req.params.userId });
    if (!business) {
      return res.status(404).json({ message: "No business found for this owner." });
    }
    res.status(200).json(business);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getBusinessByPackage = async (req, res) => {
  try {
    const { packageId } = req.params;

    const foundPackage = await Package.findById(packageId);
    
    if (!foundPackage) {
      return res.status(404).json({ message: "Package not found" });
    }

    if (!foundPackage.creator) {
      return res.status(404).json({ message: "Package creator info not found" });
    }

    const creatorId = foundPackage.creator;
    const business = await Business.findOne({ owner: creatorId });
    
    if (!business) {
      return res.status(404).json({ message: "No business registered for this user" });
    }

    res.status(200).json(business);

  } catch (err) {
    console.error("🔥 Server Error:", err.message);
    res.status(500).json({ message: "Server Error", error: err.message });
  }
};

exports.getDetailedBusinesses = async (req, res) => {
  try {
    const businesses = await Business.find()
      .populate("owner", "username email")
      .populate("location", "name");
    res.status(200).json(businesses);
  } catch (err) {
    res.status(500).json({ message: "Fetch failed", error: err.message });
  }
};

exports.getPendingRequests = async (req, res) => {
  try {
    const pendingBusinesses = await Business.find().populate("owner", "username email accountType");
    
    const filtered = pendingBusinesses.filter(biz => biz.owner.accountType === "pending");
    
    res.status(200).json(filtered);
  } catch (err) {
    res.status(500).json({ message: "Error fetching requests" });
  }
};

exports.approveBusiness = async (req, res) => {
  try {
    const { userId } = req.body;

    await User.findByIdAndUpdate(userId, { accountType: "business" });

    res.status(200).json({ message: "Business approved successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Approval failed" });
  }
};

exports.getAllBusinesses = async (req, res) => {
  try {
    const businesses = await User.find({ accountType: "business" }).select("-password");
    res.status(200).json(businesses);
  } catch (err) {
    res.status(500).json({ message: "Error fetching businesses", error: err.message });
  }
};

exports.suspendBusiness = async (req, res) => {
  try {
    await Business.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Business removed from system" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed", error: err.message });
  }
};

/* 
   GET /api/business/stats/:userId
   Aggregate live dashboard metrics for the Business Dashboard
    */
exports.getBusinessStats = async (req, res) => {
  try {
    const { userId } = req.params;
    const mongoose = require("mongoose");
    const Booking  = require("../models/Booking");

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const userObjId = new mongoose.Types.ObjectId(userId);

    // 1. Count Active Listings
    const activeListings = await Package.countDocuments({ creator: userObjId });

    // 2. Get all package IDs created by this business user
    const packages   = await Package.find({ creator: userObjId }).select("_id");
    const packageIds = packages.map(p => p._id);

    if (packageIds.length === 0) {
      return res.status(200).json({ activeListings, totalBookings: 0, totalRevenue: 0 });
    }

    // 3. Use aggregation for accurate booking count + revenue
    //    Revenue = sum of totalCharge for Confirmed and Completed bookings only
    const [result] = await Booking.aggregate([
      { $match: { packageId: { $in: packageIds } } },
      {
        $group: {
          _id:          null,
          totalBookings: { $sum: 1 },
          totalRevenue: {
            $sum: {
              $cond: [
                { $in: ["$status", ["Confirmed", "Completed"]] },
                "$totalCharge",
                0
              ]
            }
          }
        }
      }
    ]);

    const totalBookings = result?.totalBookings ?? 0;
    const totalRevenue  = result?.totalRevenue  ?? 0;

    console.log(`📊 Stats for user ${userId}:`, { activeListings, totalBookings, totalRevenue });

    res.status(200).json({ activeListings, totalBookings, totalRevenue });

  } catch (err) {
    console.error("❌ Stats Error:", err.message);
    res.status(500).json({ message: "Error calculating stats", error: err.message });
  }
};
