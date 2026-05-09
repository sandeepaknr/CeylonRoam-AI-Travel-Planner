const express  = require("express");
const router   = express.Router();
const ctrl     = require("../controllers/partnerRequestController");
const { upload } = require("../controllers/partnerRequestController");

// Submit a new partner request (multipart/form-data)
router.post("/",                  upload, ctrl.submitPartnerRequest);

// Admin — list all requests
router.get("/",                   ctrl.getPartnerRequests);

// Admin — fetch by user ID (called when clicking Inspect on a pending user)
router.get("/by-user/:userId",    ctrl.getRequestByUserId);

// Admin — approve or reject using requestId
router.put("/review/:requestId",  ctrl.updatePartnerRequestStatus);

// Legacy alias kept for compatibility
router.put("/:id/status",         ctrl.updatePartnerRequestStatus);

// Business User — update their own business public profile
router.put("/:id",                ctrl.updateBusinessProfile);

module.exports = router;
