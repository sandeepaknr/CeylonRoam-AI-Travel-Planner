const express = require("express");
const path = require('path');
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const packagesRoute = require("./routes/packagesRoutes");
const locationRoutes = require("./routes/locationRoutes");
const reviewRoute = require("./routes/reviewRoutes");
const businessplaceRoute = require("./routes/businessRoutes");
const tripplanRoute = require("./routes/tripplanRoute");
const profileRoute = require("./routes/profileRoutes");
const bookingRoute = require("./routes/bookingRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const salerbookingRoute = require("./routes/sellerBookingRoutes");
const featuresRoutes = require("./routes/featuresRoutes");
const accountManagementRoutes = require("./routes/adminuserRoutes");
const savepackageRoute = require("./routes/savepackageRoute");
const adminRoutes = require("./routes/adminRoutes");
const partnerRequestRoutes = require("./routes/partnerRequestRoutes");


const errorHandler = require("./middlewares/errorMiddleware");

const app = express();

// Middlewares
app.use(cors({ origin: '*' }));
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname,'..', 'uploads')));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/packages", packagesRoute);
app.use("/api/locations", locationRoutes);
app.use("/api/reviews", reviewRoute);
app.use("/api/business", businessplaceRoute);
app.use("/api/ai", tripplanRoute);
app.use("/api/user", profileRoute);
app.use("/api/bookings", bookingRoute);
app.use("/api/payments", paymentRoutes);
app.use("/api/paypal", paymentRoutes); // Fallback for paypal direct prefix
app.use("/api/seller-bookings", salerbookingRoute);
app.use("/api/features", featuresRoutes);
app.use("/api/accountmanagement", accountManagementRoutes);
app.use("/api/saved", savepackageRoute);
app.use("/api/admin", adminRoutes); 
app.use("/api/partner-request", partnerRequestRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("API running...");
});

// Error middleware 
app.use(errorHandler);

module.exports = app;
