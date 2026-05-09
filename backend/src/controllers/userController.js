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
