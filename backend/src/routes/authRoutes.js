const express = require("express");
const router  = express.Router();

const {
  registerUser, loginUser, adminLogin,
  sendPasswordOTP, verifyOTP, updatePassword,
  forgotPassword, resetPassword,
} = require("../controllers/authController");

// Shared Multer upload middleware (handles all 14 file fields)
// Non-blocking when no files are sent (Traveller flow still works)
const { upload } = require("../controllers/partnerRequestController");

router.post("/register",              upload, registerUser);
router.post("/login",                 loginUser);
router.post("/admin/login",           adminLogin);
router.post("/send-password-otp",     sendPasswordOTP);
router.post("/verify-otp",            verifyOTP);
router.put("/update-password/:id",    updatePassword);
router.post("/forgot-password",       forgotPassword);
router.post("/reset-password",        resetPassword);

module.exports = router;
