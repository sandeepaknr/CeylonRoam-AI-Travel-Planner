const mongoose = require("mongoose");

/* ── Shared sub-schemas ─────────────────────────────────────── */
const bankSchema = new mongoose.Schema({
  accountName: String,
  bank:        String,
  branch:      String,
  accountNumber: String,
}, { _id: false });

/* ── Hotel details ──────────────────────────────────────────── */
const hotelDetailsSchema = new mongoose.Schema({
  hotelName:    String,
  ownerName:    String,
  managerName:  String,
  propertyType: { type: String, enum: ["Hotel", "Villa", "Resort", "Cabana"] },
  description:  String,
  address:      String,
  city:         String,
  district:     String,
  phone:        String,
  latitude:     Number,
  longitude:    Number,
  amenities:    [String],   // e.g. ["Free WiFi", "Swimming Pool"]
  brn:          String,     // Business Registration Number
  bankDetails:  bankSchema,
  // File paths (stored after Multer upload)
  coverImage:   String,
  gallery:      [String],   // up to 5
}, { _id: false });

/* ── Guide details ──────────────────────────────────────────── */
const guideDetailsSchema = new mongoose.Schema({
  fullName:       String,
  dateOfBirth:    String,
  baseCity:       String,
  operatingRegions: String,
  languages:      String,
  guideType:      { type: String, enum: ["National Guide", "Chauffeur Guide", "Adventure/Trekking Guide"] },
  experience:     Number,
  bio:            String,
  nicNumber:      String,
  tourismBoardReg: String,
  // Chauffeur-specific
  vehicleType:    String,
  vehicleModel:   String,
  vehicleYear:    String,
  vehicleAC:      String,
  // File paths
  profilePicture: String,
  licenseScan:    String,
  vehiclePhotos:  [String],
}, { _id: false });

/* ── Transport details ──────────────────────────────────────── */
const transportDetailsSchema = new mongoose.Schema({
  serviceType:   { type: String, enum: ["Rent", "Hire"] },
  ownerName:     String,
  driverName:    String,
  phone:         String,
  vehicleType:   { type: String, enum: ["Bike", "Tuk Tuk", "Mini Car", "Sedan/Cab", "Passenger Van", "SUV", "Bus"] },
  vehicleMake:   String,
  vehicleModel:  String,
  yearOfManufacture: String,
  transmission:  String,   // "Auto" | "Manual" — only for Rent
  passengerCapacity: String,
  luggageCapacity:   String,
  airConditioned:    String,
  baseCity:      String,
  airportTransfer: String,
  driverNIC:     String,
  // File paths
  driverProfilePicture: String,
  licensePlatePhoto:    String,
  drivingLicense:       String,
  revenueLicense:       String,
  driverNICFront:       String,
  driverNICBack:        String,
  exteriorPhotos:       [String],
  interiorPhotos:       [String],
}, { _id: false });

/* ── Root Schema ────────────────────────────────────────────── */
const businessRequestSchema = new mongoose.Schema({
  owner:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  category: { type: String, enum: ["Hotel", "Guide", "Transport"], required: true },
  status:   { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },

  hotelDetails:     hotelDetailsSchema,
  guideDetails:     guideDetailsSchema,
  transportDetails: transportDetailsSchema,
}, { timestamps: true });

module.exports = mongoose.model("BusinessRequest", businessRequestSchema);
