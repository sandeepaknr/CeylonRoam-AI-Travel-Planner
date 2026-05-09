require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/config/db");

connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// මේක තාවකාලික Route එකක් (Admin කෙනෙක්ව හදන්න විතරයි)
const bcrypt = require("bcryptjs");
const User = require("./src/models/User"); // User model එකට path එක හරියටම දුන්නා

app.get("/create-admin", async (req, res) => {
  try {
    // මේ ඊමේල් එකෙන් කලින් කෙනෙක් ඉන්නවද බලනවා
    const existingUser = await User.findOne({ email: "admin@travel.com" });
    if (existingUser) return res.send("Admin already exists!");

    // Password එක Encrypt කරනවා
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("admin123", salt);

    // අලුත් Admin කෙනෙක්ව User Database එකට දානවා
    const newAdmin = new User({
      username: "MainAdmin", // <--- මෙන්න මේ පේළිය තමයි අලුතින් එකතු කළේ
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
