const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");

router.post("/", reviewController.addReview);
router.get("/:packageId", reviewController.getPackageReviews);
router.post("/reaction", reviewController.handleReaction);
router.delete("/:id", reviewController.deleteReview);

module.exports = router;