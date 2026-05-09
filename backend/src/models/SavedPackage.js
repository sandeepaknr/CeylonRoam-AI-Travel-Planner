const mongoose = require("mongoose");

const SavedPackageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  packageId: { type: mongoose.Schema.Types.ObjectId, ref: "Package", required: true },
  savedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("SavedPackage", SavedPackageSchema);