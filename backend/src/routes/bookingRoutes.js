const express = require("express");
const router = express.Router();
const {
  createBooking,
  checkAvailability,
  getBookingById,
  getMyBookings,
  getBusinessBookings,
} = require("../controllers/bookingController");

router.post("/",                           createBooking);
router.get("/check",                       checkAvailability);
router.get("/my-bookings",                 getMyBookings);
router.get("/my-business-bookings/:userId",getBusinessBookings);
router.get("/:id",                         getBookingById);

module.exports = router;