const User            = require("../models/User");
const BusinessRequest = require("../models/BusinessRequest");
const bcrypt          = require("bcryptjs");
const generateToken   = require("../utils/generateToken");
const jwt             = require("jsonwebtoken");
const sendMail        = require("../middlewares/mailer");



let otpCache = {};

/* ══════════════════════════════════════════════════════════════
   OTP — unchanged
   ══════════════════════════════════════════════════════════════ */
exports.sendPasswordOTP = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  otpCache[email] = { otp, expires: Date.now() + 300000 };

  const subject = "Verification Code for Password Update";
  const body = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Password Reset Verification</h2>
      <p>Your verification code is: <b style="font-size: 24px; color: #008080;">${otp}</b></p>
      <p>This code is valid for 5 minutes only.</p>
    </div>
  `;

  const mailResult = await sendMail(email, subject, body);
  if (mailResult.success) {
    res.json({ message: "OTP sent successfully" });
  } else {
    res.status(500).json({ message: "Failed to send email" });
  }
};

exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  const data = otpCache[email];

  if (data && data.otp === otp && data.expires > Date.now()) {
    delete otpCache[email];
    res.json({ success: true, message: "OTP Verified" });
  } else {
    res.status(400).json({ success: false, message: "Invalid or expired OTP" });
  }
};

exports.updatePassword = async (req, res) => {
  try {
    const { password } = req.body;
    const userId = req.params.id;

    if (!password)
      return res.status(400).json({ message: "New password is required" });

    if (password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters long" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { password: hashedPassword },
      { new: true }
    );

    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "Password updated successfully!" });
  } catch (err) {
    console.error("Update Pass Error:", err);
    res.status(500).json({ message: "Server error during password update" });
  }
};

/* ══════════════════════════════════════════════════════════════
   FORGOT PASSWORD — Step 1: send 6-digit OTP to email
   POST /api/auth/forgot-password
   ══════════════════════════════════════════════════════════════ */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ message: "Email address is required." });

    /* ── Verify the account exists ── */
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user)
      return res.status(404).json({ message: "No account found with that email address." });

    /* ── Generate a cryptographically-sufficient 6-digit OTP ── */
    const otp     = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

    /* ── Cache it (namespace 'fp:' avoids collisions with register OTPs) ── */
    otpCache[`fp:${email}`] = { otp, expires };

    /* ── Premium-styled email body ── */
    const subject = "Reset your CeylonRoam password";
    const body = `
      <div style="font-family:'Segoe UI',Arial,sans-serif;max-width:520px;margin:0 auto;padding:0;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.10);">
        <!-- Header -->
        <div style="background:linear-gradient(135deg,#0a3d62 0%,#1a6fa8 60%,#2d6a4f 100%);padding:40px 48px 36px;">
          <div style="font-size:28px;font-weight:800;color:#fff;letter-spacing:-1px;margin-bottom:4px;">CeylonRoam.</div>
          <div style="font-size:13px;color:rgba(255,255,255,0.65);">Your AI-powered Sri Lanka travel companion</div>
        </div>
        <!-- Body -->
        <div style="background:#ffffff;padding:44px 48px;">
          <h2 style="margin:0 0 12px;font-size:22px;font-weight:800;letter-spacing:-0.5px;color:#0f172a;">Password Reset Request</h2>
          <p style="margin:0 0 28px;font-size:15px;color:#475569;line-height:1.75;">We received a request to reset the password for your CeylonRoam account. Use the code below — it expires in <strong>10 minutes</strong>.</p>
          <!-- OTP box -->
          <div style="text-align:center;background:#f0f9ff;border:2px dashed #bae6fd;border-radius:18px;padding:32px 24px;margin-bottom:28px;">
            <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:2.5px;color:#0369a1;margin-bottom:16px;">Your verification code</div>
            <div style="font-size:48px;font-weight:800;letter-spacing:16px;color:#0a3d62;line-height:1;">${otp}</div>
          </div>
          <p style="margin:0 0 8px;font-size:13.5px;color:#94a3b8;line-height:1.7;">If you did not request a password reset, please ignore this email. Your password will remain unchanged.</p>
          <p style="margin:0;font-size:13.5px;color:#94a3b8;">For security, never share this code with anyone.</p>
        </div>
        <!-- Footer -->
        <div style="background:#f8fafc;padding:20px 48px;border-top:1px solid #e2e8f0;">
          <p style="margin:0;font-size:12px;color:#cbd5e1;text-align:center;">© 2026 CeylonRoam Inc. · Built with ❤️ for Sri Lanka</p>
        </div>
      </div>
    `;

    const mailResult = await sendMail(email, subject, body);
    if (!mailResult.success)
      return res.status(500).json({ message: "Failed to send reset email. Please try again." });

    res.json({ message: "Password reset code sent to your email.", email });

  } catch (err) {
    console.error("forgotPassword Error:", err.message);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

/* ══════════════════════════════════════════════════════════════
   RESET PASSWORD — Step 2: verify OTP + hash + save new password
   POST /api/auth/reset-password
   ══════════════════════════════════════════════════════════════ */
exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword)
      return res.status(400).json({ message: "Email, OTP, and new password are all required." });

    if (newPassword.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters long." });

    /* ── Look up cached OTP ── */
    const entry = otpCache[`fp:${email}`];
    if (!entry)
      return res.status(400).json({ message: "No password reset was requested for this email, or the code has already been used." });

    /* ── Check expiry first (more informative than wrong-code message) ── */
    if (entry.expires < Date.now()) {
      delete otpCache[`fp:${email}`];
      return res.status(400).json({ message: "Your reset code has expired. Please request a new one." });
    }

    /* ── Validate OTP ── */
    if (entry.otp !== otp)
      return res.status(400).json({ message: "Incorrect reset code. Please check your email and try again." });

    /* ── OTP is valid — consume immediately (prevents replay attacks) ── */
    delete otpCache[`fp:${email}`];

    /* ── Hash the new password ── */
    const salt           = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    /* ── Update the user document ── */
    const updatedUser = await User.findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      { password: hashedPassword },
      { new: true }
    );

    if (!updatedUser)
      return res.status(404).json({ message: "Account not found. Please contact support." });

    res.json({ message: "Password reset successfully! You can now sign in with your new password." });

  } catch (err) {
    console.error("resetPassword Error:", err.message);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

/* ══════════════════════════════════════════════════════════════
   HELPERS — shared file path extractors (same as partnerRequest)
   ══════════════════════════════════════════════════════════════ */
const fp  = (files, field) => files?.[field]?.[0]?.path || undefined;
const fps = (files, field) => files?.[field]?.map(f => f.path) || [];

/* ══════════════════════════════════════════════════════════════
   REGISTER USER
   — Handles BOTH:
     1. Traveller (JSON or form-data, no files)
     2. Business / Operator (multipart/form-data with files)
   ══════════════════════════════════════════════════════════════ */
exports.registerUser = async (req, res) => {
  try {
    const {
      username, email, password, confirmPassword,
      accountType, country, dateOfBirth, jobRole, currency,
      category,
    } = req.body;

    /* ── Basic validation ── */
    if (password !== confirmPassword)
      return res.status(400).json({ message: "Passwords do not match" });

    const userExists = await User.findOne({ email });
    if (userExists)
      return res.status(400).json({ message: "User already exists" });

    const salt           = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    /* ─────────────────────────────────────────────────────────
       TRAVELLER  — fast path (no business data)
       ───────────────────────────────────────────────────────── */
    if (accountType !== "business") {
      const user = await User.create({
        username,
        email,
        password:    hashedPassword,
        accountType: accountType || "user",
        country,
        dateOfBirth,
        jobRole,
        currency:    currency || "LKR",
      });

      return res.status(201).json({
        _id:         user._id,
        username:    user.username,
        email:       user.email,
        accountType: user.accountType,
        country:     user.country,
        dateOfBirth: user.dateOfBirth,
        jobRole:     user.jobRole,
        currency:    user.currency,
        token:       generateToken(user._id),
      });
    }

    /* ─────────────────────────────────────────────────────────
       BUSINESS / OPERATOR — parse details + create BusinessRequest
       ───────────────────────────────────────────────────────── */
    if (country !== "Sri Lanka")
      return res.status(400).json({ message: "Business registration is only available for Sri Lanka-based users." });

    const files = req.files || {};
    let businessProfile = { category };
    let requestDetails  = {};

    /* ── Hotel ── */
    if (category === "Hotel") {
      let amenities = [];
      try { amenities = JSON.parse(req.body.amenities || "[]"); } catch { amenities = []; }
      let bankDetails = {};
      try { bankDetails = JSON.parse(req.body.bankDetails || "{}"); } catch { bankDetails = {}; }

      businessProfile.hotelDetails = {
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
      };
      requestDetails = { hotelDetails: businessProfile.hotelDetails };

    /* ── Guide ── */
    } else if (category === "Guide") {
      businessProfile.guideDetails = {
        fullName:        req.body.fullName,
        dateOfBirth:     Array.isArray(req.body.dateOfBirth) ? req.body.dateOfBirth[0] : req.body.dateOfBirth,
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
      };
      requestDetails = { guideDetails: businessProfile.guideDetails };

    /* ── Transport ── */
    } else if (category === "Transport") {
      businessProfile.transportDetails = {
        serviceType:          req.body.serviceType,
        ownerName:            req.body.ownerName,
        driverName:           req.body.driverName,
        phone:                req.body.phone,
        vehicleType:          req.body.vehicleType,
        vehicleMake:          req.body.vehicleMake,
        vehicleModel:         req.body.vehicleModel,
        yearOfManufacture:    req.body.yearOfManufacture,
        transmission:         req.body.transmission,
        passengerCapacity:    req.body.passengerCapacity,
        luggageCapacity:      req.body.luggageCapacity,
        airConditioned:       req.body.airConditioned,
        baseCity:             req.body.baseCity,
        airportTransfer:      req.body.airportTransfer,
        driverNIC:            req.body.driverNIC,
        driverProfilePicture: fp(files, "driverProfilePicture"),
        licensePlatePhoto:    fp(files, "licensePlatePhoto"),
        drivingLicense:       fp(files, "drivingLicense"),
        revenueLicense:       fp(files, "revenueLicense"),
        driverNICFront:       fp(files, "driverNICFront"),
        driverNICBack:        fp(files, "driverNICBack"),
        exteriorPhotos:       fps(files, "exteriorPhotos"),
        interiorPhotos:       fps(files, "interiorPhotos"),
      };
      requestDetails = { transportDetails: businessProfile.transportDetails };
    }

    /* ── Save user with accountType: "pending" ── */
    const user = await User.create({
      username,
      email,
      password:       hashedPassword,
      accountType:    "pending",
      country,
      dateOfBirth,
      jobRole,
      currency:       currency || "LKR",
      businessProfile,
    });

    /* ── Create BusinessRequest doc for Admin review ── */
    await BusinessRequest.create({
      owner:    user._id,
      category,
      status:   "pending",
      ...requestDetails,
    });

    res.status(201).json({
      _id:         user._id,
      username:    user.username,
      email:       user.email,
      accountType: user.accountType,   // "pending"
      country:     user.country,
      dateOfBirth: user.dateOfBirth,
      jobRole:     user.jobRole,
      currency:    user.currency,
      token:       generateToken(user._id),
    });

  } catch (err) {
    console.error("Register Error:", err.message);
    res.status(500).json({ message: err.message });
  }
};

/* ══════════════════════════════════════════════════════════════
   LOGIN — unchanged
   ══════════════════════════════════════════════════════════════ */
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    res.json({
      _id:         user._id,
      username:    user.username,
      email:       user.email,
      accountType: user.accountType,
      country:     user.country,
      currency:    user.currency || "LKR",
      token:       generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ══════════════════════════════════════════════════════════════
   ADMIN LOGIN — unchanged
   ══════════════════════════════════════════════════════════════ */
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Admin not found!" });

    if (user.accountType !== "admin")
      return res.status(403).json({ message: "Access denied. Not an admin account!" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials!" });

    const token = jwt.sign(
      { id: user._id, role: user.accountType },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      token,
      user: { id: user._id, username: user.username, accountType: user.accountType }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error", error: err.message });
  }
};