const express = require("express");
const router = express.Router();
const sellerBookingController = require("../controllers/sellerBookingController");

router.get("/all", sellerBookingController.getSellerBookings);
router.patch("/update/:bookingId", sellerBookingController.updateBookingStatus);
router.get("/slip/:bookingId", sellerBookingController.getSlipByBookingId);

module.exports = router;