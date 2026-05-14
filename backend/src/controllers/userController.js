const User = require("../models/User");

// GET profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Profile Update 
exports.updateUserProfile = async (req, res) => {
    try {
        const { id } = req.params; 
        const { username, email } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { $set: { username, email } },
            { new: true } 
        ).select("-password");

        if (!updatedUser) return res.status(404).json({ message: "User not found" });

        res.json(updatedUser);
    } catch (err) {
        res.status(500).json({ message: "Server error during update" });
    }
};

// Upload Profile Picture
exports.uploadProfilePicture = async (req, res) => {
    console.log("[DEBUG] Profile picture upload request received for ID:", req.params.id);
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const { id } = req.params;
        const profilePicture = `/uploads/${req.file.filename}`;

        const updatedUser = await User.findByIdAndUpdate(
            id,
            { $set: { profilePicture } },
            { new: true }
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(updatedUser);
    } catch (err) {
        console.error("Profile picture upload error:", err);
        res.status(500).json({ message: "Server error during image upload" });
    }
};
