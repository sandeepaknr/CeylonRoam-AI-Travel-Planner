const mongoose = require("mongoose");

/* ── Reusable bank sub-schema ─────────────────────────── */
const bankSchema = new mongoose.Schema({
  accountName: String,
  bank:        String,
  branch:      String,
  accountNumber: String,
}, { _id: false });

/* ── Hotel details (optional) ─────────────────────────── */
const hotelDetailsSchema = new mongoose.Schema({
  hotelName:    String,
  ownerName:    String,
  managerName:  String,
  propertyType: String,
  description:  String,
  address:      String,
  city:         String,
  district:     String,
  phone:        String,
  latitude:     Number,
  longitude:    Number,
  amenities:    [String],
  brn:          String,
  bankDetails:  bankSchema,
  coverImage:   String,
  gallery:      [String],
}, { _id: false });

/* ── Guide details (optional) ─────────────────────────── */
const guideDetailsSchema = new mongoose.Schema({
  fullName:        String,
  dateOfBirth:     String,
  baseCity:        String,
  operatingRegions: String,
  languages:       String,
  guideType:       String,
  experience:      Number,
  bio:             String,
  nicNumber:       String,
  tourismBoardReg: String,
  vehicleType:     String,
  vehicleModel:    String,
  vehicleYear:     String,
  vehicleAC:       String,
  profilePicture:  String,
  licenseScan:     String,
  vehiclePhotos:   [String],
}, { _id: false });

/* ── Transport details (optional) ─────────────────────── */
const transportDetailsSchema = new mongoose.Schema({
  serviceType:          String,
  ownerName:            String,
  driverName:           String,
  phone:                String,
  vehicleType:          String,
  vehicleMake:          String,
  vehicleModel:         String,
  yearOfManufacture:    String,
  transmission:         String,
  passengerCapacity:    String,
  luggageCapacity:      String,
  airConditioned:       String,
  baseCity:             String,
  airportTransfer:      String,
  driverNIC:            String,
  driverProfilePicture: String,
  licensePlatePhoto:    String,
  drivingLicense:       String,
  revenueLicense:       String,
  driverNICFront:       String,
  driverNICBack:        String,
  exteriorPhotos:       [String],
  interiorPhotos:       [String],
}, { _id: false });

/* ── Root User Schema ─────────────────────────────────── */
const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    accountType: {
      type: String,
      enum: ["user", "business", "admin", "pending"],
      default: "user"
    },
    country: {
      type: String,
      default: ""
    },
    dateOfBirth: {
      type: Date,
      default: null
    },
    jobRole: {
      type: String,
      default: ""
    },
    currency: {
      type: String,
      default: "LKR"
    },
    // Optional business profile — populated for pending/business accounts
    businessProfile: {
      category:         { type: String },
      hotelDetails:     hotelDetailsSchema,
      guideDetails:     guideDetailsSchema,
      transportDetails: transportDetailsSchema,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
