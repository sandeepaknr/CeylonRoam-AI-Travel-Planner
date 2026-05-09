const express = require("express");
const router = express.Router();
const aiController = require("../controllers/tripplanaiController");

router.post("/generate-plan", aiController.generateTripPlan);
router.post("/save", aiController.saveTripPlan);
router.get("/user/:userId", aiController.getUserTrips);
router.delete("/:id", aiController.deleteTrip);

module.exports = router;