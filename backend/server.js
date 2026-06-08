require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/config/db");

connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// This is a temporary Route (used only to create an Admin account)
const bcrypt = require("bcryptjs");
const User = require("./src/models/User"); // Providing the correct path to the User model

app.get("/create-admin", async (req, res) => {
  try {
    // Check if a user with this email already exists
    const existingUser = await User.findOne({ email: "admin@travel.com" });
    if (existingUser) return res.send("Admin already exists!");

    // Encrypt the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("admin123", salt);

    // Insert the new Admin into the User Database
    const newAdmin = new User({
      username: "MainAdmin", 
      email: "admin@travel.com",
      password: hashedPassword,
      role: "admin",
    });

    await newAdmin.save();
    res.send(
      "✅ Admin successfully created! Email: admin@travel.com | Password: admin123"
    );
  } catch (err) {
    res.status(500).send("Error creating admin: " + err.message);
  }
});
