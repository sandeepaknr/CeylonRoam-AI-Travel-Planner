const express = require("express");
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  uploadProfilePicture
} = require("../controllers/userController");
const upload = require("../middlewares/upload");

router.get("/:id", getUserProfile);
router.put("/update/:id", updateUserProfile);
router.post("/upload-picture/:id", upload.single("profilePicture"), uploadProfilePicture);

module.exports = router;
