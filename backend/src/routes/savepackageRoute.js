const express = require("express");
const router = express.Router();
const savedController = require("../controllers/savedController");

router.post("/save-package", savedController.toggleSavePackage);
router.get("/check-saved", savedController.checkIfSaved);
router.get("/user/:userId", savedController.getSavedPackages);

module.exports = router; 