const path            = require("path");
const fs              = require("fs");
const multer          = require("multer");
const BusinessRequest = require("../models/BusinessRequest");
const User            = require("../models/User");

/* ════════════════════════════════════════════════════════════
   MULTER CONFIGURATION
   ════════════════════════════════════════════════════════════ */
const uploadDir = path.join(__dirname, "../../uploads/partner-requests");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename:    (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, unique + path.extname(file.originalname));
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = /jpeg|jpg|png|pdf|webp/;
  cb(null, allowed.test(path.extname(file.originalname).toLowerCase()));
};

const multerInstance = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });

// All possible file fields across the three categories
exports.upload = multerInstance.fields([
  // Hotel
  { name: "coverImage",           maxCount: 1 },
  { name: "gallery",              maxCount: 5 },
  // Guide
  { name: "profilePicture",       maxCount: 1 },
  { name: "licenseScan",          maxCount: 1 },
  { name: "vehiclePhotos",        maxCount: 5 },
  // Transport
  { name: "driverProfilePicture", maxCount: 1 },
  { name: "licensePlatePhoto",    maxCount: 1 },
  { name: "drivingLicense",       maxCount: 1 },
  { name: "revenueLicense",       maxCount: 1 },
  { name: "driverNICFront",       maxCount: 1 },
  { name: "driverNICBack",        maxCount: 1 },
  { name: "exteriorPhotos",       maxCount: 5 },
  { name: "interiorPhotos",       maxCount: 5 },
]);

/* ── Helper: extract path string from multer file object ─── */
const fp  = (files, field) => files?.[field]?.[0]?.path  || undefined;
const fps = (files, field) => files?.[field]?.map(f => f.path) || [];

/* ════════════════════════════════════════════════════════════
   SUBMIT PARTNER REQUEST
   ════════════════════════════════════════════════════════════ */
exports.submitPartnerRequest = async (req, res) => {
  try {
    const { category, owner } = req.body;
    const files = req.files || {};

    let details = {};

    if (category === "Hotel") {
      // Parse amenities array sent as JSON string
      let amenities = [];
      try { amenities = JSON.parse(req.body.amenities || "[]"); } catch { amenities = []; }

      let bankDetails = {};
      try { bankDetails = JSON.parse(req.body.bankDetails || "{}"); } catch { bankDetails = {}; }

      details = {
        hotelDetails: {
          hotelName:    req.body.hotelName,
          ownerName:    req.body.ownerName,
          managerName:  req.body.managerName,
          propertyType: req.body.propertyType,
          description:  req.body.description,
          address:      req.body.address,
          city:         req.body.city,
          district:     req.body.district,
          phone:        req.body.phone,
          latitude:     parseFloat(req.body.latitude)  || 7.8731,
          longitude:    parseFloat(req.body.longitude) || 80.7718,
          amenities,
          brn:          req.body.brn,
          bankDetails,
          coverImage:   fp(files, "coverImage"),
          gallery:      fps(files, "gallery"),
        },
      };
    } else if (category === "Guide") {
      details = {
        guideDetails: {
          fullName:        req.body.fullName,
          dateOfBirth:     req.body.dateOfBirth,
          baseCity:        req.body.baseCity,
          operatingRegions: req.body.operatingRegions,
          languages:       req.body.languages,
          guideType:       req.body.guideType,
          experience:      parseInt(req.body.experience) || 0,
          bio:             req.body.bio,
          nicNumber:       req.body.nicNumber,
          tourismBoardReg: req.body.tourismBoardReg,
          vehicleType:     req.body.vehicleType,
          vehicleModel:    req.body.vehicleModel,
          vehicleYear:     req.body.vehicleYear,
          vehicleAC:       req.body.vehicleAC,
          profilePicture:  fp(files, "profilePicture"),
          licenseScan:     fp(files, "licenseScan"),
          vehiclePhotos:   fps(files, "vehiclePhotos"),
        },
      };
    } else if (category === "Transport") {
      details = {
        transportDetails: {
          serviceType:       req.body.serviceType,
          ownerName:         req.body.ownerName,
          driverName:        req.body.driverName,
          phone:             req.body.phone,
          vehicleType:       req.body.vehicleType,
          vehicleMake:       req.body.vehicleMake,
          vehicleModel:      req.body.vehicleModel,
          yearOfManufacture: req.body.yearOfManufacture,
          transmission:      req.body.transmission,
          passengerCapacity: req.body.passengerCapacity,
          luggageCapacity:   req.body.luggageCapacity,
          airConditioned:    req.body.airConditioned,
          baseCity:          req.body.baseCity,
          airportTransfer:   req.body.airportTransfer,
          driverNIC:         req.body.driverNIC,
          driverProfilePicture: fp(files, "driverProfilePicture"),
          licensePlatePhoto:    fp(files, "licensePlatePhoto"),
          drivingLicense:       fp(files, "drivingLicense"),
          revenueLicense:       fp(files, "revenueLicense"),
          driverNICFront:       fp(files, "driverNICFront"),
          driverNICBack:        fp(files, "driverNICBack"),
          exteriorPhotos:       fps(files, "exteriorPhotos"),
          interiorPhotos:       fps(files, "interiorPhotos"),
        },
      };
    } else {
      return res.status(400).json({ message: "Invalid category" });
    }

    const newRequest = await BusinessRequest.create({
      owner,
      category,
      ...details,
    });

    // Flip user status to "pending"
    await User.findByIdAndUpdate(owner, { accountType: "pending" });

    res.status(201).json({
      message: "Partner request submitted successfully!",
      request: newRequest,
    });
  } catch (err) {
    console.error("PartnerRequest Error:", err.message);
    res.status(500).json({ message: "Submission failed", error: err.message });
  }
};

/* ════════════════════════════════════════════════════════════
   GET ALL PARTNER REQUESTS  (Admin)
   ════════════════════════════════════════════════════════════ */
exports.getPartnerRequests = async (req, res) => {
  try {
    const requests = await BusinessRequest.find()
      .populate("owner", "username email accountType country")
      .sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (err) {
    res.status(500).json({ message: "Fetch failed", error: err.message });
  }
};

/* ════════════════════════════════════════════════════════════
   GET REQUEST BY USER ID  (Admin — load on Inspect click)
   ════════════════════════════════════════════════════════════ */
exports.getRequestByUserId = async (req, res) => {
  try {
    const request = await BusinessRequest.findOne({ owner: req.params.userId })
      .sort({ createdAt: -1 });
    if (!request) return res.status(404).json({ message: "No partner request found for this user" });
    res.status(200).json(request);
  } catch (err) {
    res.status(500).json({ message: "Fetch failed", error: err.message });
  }
};

/* ════════════════════════════════════════════════════════════
   UPDATE STATUS  (Admin — approve / reject)
   ════════════════════════════════════════════════════════════ */
exports.updatePartnerRequestStatus = async (req, res) => {
  try {
    const { status } = req.body; // "approved" | "rejected"
    // Support both /review/:requestId (new) and /:id/status (legacy)
    const docId = req.params.requestId || req.params.id;
    const request = await BusinessRequest.findByIdAndUpdate(
      docId,
      { status },
      { new: true }
    );
    if (!request) return res.status(404).json({ message: "Request not found" });

    // If approved, elevate user to business account
    if (status === "approved") {
      await User.findByIdAndUpdate(request.owner, { accountType: "business" });
    } else if (status === "rejected") {
      // Revert back to regular user so they can re-apply
      await User.findByIdAndUpdate(request.owner, { accountType: "user" });
    }

    res.status(200).json({ message: `Request ${status} successfully`, request });
  } catch (err) {
    res.status(500).json({ message: "Status update failed", error: err.message });
  }
};

/* ════════════════════════════════════════════════════════════
   UPDATE PROFILE  (Business User Dashboard)
   ════════════════════════════════════════════════════════════ */
exports.updateBusinessProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const request = await BusinessRequest.findById(id);
    if (!request) return res.status(404).json({ message: "Business profile not found" });

    const safeUpdates = {};

    // Only map explicitly allowed fields
    if (request.category === "Hotel" && updateData.hotelDetails) {
      if (updateData.hotelDetails.phone) safeUpdates["hotelDetails.phone"] = updateData.hotelDetails.phone;
      if (updateData.hotelDetails.description) safeUpdates["hotelDetails.description"] = updateData.hotelDetails.description;
      if (updateData.hotelDetails.address) safeUpdates["hotelDetails.address"] = updateData.hotelDetails.address;
      if (updateData.hotelDetails.city) safeUpdates["hotelDetails.city"] = updateData.hotelDetails.city;
      if (updateData.hotelDetails.district) safeUpdates["hotelDetails.district"] = updateData.hotelDetails.district;
      if (updateData.hotelDetails.amenities) safeUpdates["hotelDetails.amenities"] = updateData.hotelDetails.amenities;
    } 
    else if (request.category === "Guide" && updateData.guideDetails) {
      if (updateData.guideDetails.bio) safeUpdates["guideDetails.bio"] = updateData.guideDetails.bio;
      if (updateData.guideDetails.languages) safeUpdates["guideDetails.languages"] = updateData.guideDetails.languages;
      if (updateData.guideDetails.baseCity) safeUpdates["guideDetails.baseCity"] = updateData.guideDetails.baseCity;
      if (updateData.guideDetails.operatingRegions) safeUpdates["guideDetails.operatingRegions"] = updateData.guideDetails.operatingRegions;
      if (updateData.guideDetails.vehicleAC) safeUpdates["guideDetails.vehicleAC"] = updateData.guideDetails.vehicleAC;
    } 
    else if (request.category === "Transport" && updateData.transportDetails) {
      if (updateData.transportDetails.phone) safeUpdates["transportDetails.phone"] = updateData.transportDetails.phone;
      if (updateData.transportDetails.baseCity) safeUpdates["transportDetails.baseCity"] = updateData.transportDetails.baseCity;
      if (updateData.transportDetails.airportTransfer) safeUpdates["transportDetails.airportTransfer"] = updateData.transportDetails.airportTransfer;
    }

    if (Object.keys(safeUpdates).length === 0) {
      return res.status(400).json({ message: "No valid fields provided for update" });
    }

    // Apply strict dot-notation mapping to only touch the updated inner fields
    const updatedRequest = await BusinessRequest.findByIdAndUpdate(
      id,
      { $set: safeUpdates },
      { new: true }
    );

    res.status(200).json({ message: "Profile updated successfully", request: updatedRequest });
  } catch (err) {
    res.status(500).json({ message: "Update failed", error: err.message });
  }
};
