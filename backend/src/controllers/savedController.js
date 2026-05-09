const SavedPackage = require("../models/SavedPackage");

exports.toggleSavePackage = async (req, res) => {
  try {
    const { userId, packageId } = req.body;

    const existing = await SavedPackage.findOne({ userId, packageId });

    if (existing) {
      await SavedPackage.findByIdAndDelete(existing._id);
      return res.status(200).json({ saved: false, message: "Package removed from favorites" });
    }

    const newSave = new SavedPackage({ userId, packageId });
    await newSave.save();
    res.status(201).json({ saved: true, message: "Package saved to favorites!" });
    
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.checkIfSaved = async (req, res) => {
  try {
    const { userId, packageId } = req.query;
    const existing = await SavedPackage.findOne({ userId, packageId });
    res.status(200).json({ isSaved: !!existing });
  } catch (err) {
    res.status(500).json({ message: "Error checking status" });
  }
};

exports.getSavedPackages = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const savedList = await SavedPackage.find({ userId })
      .populate("packageId")
      .sort({ savedAt: -1 });

    res.status(200).json(savedList);
  } catch (err) {
    res.status(500).json({ message: "Error fetching saved packages", error: err.message });
  }
};