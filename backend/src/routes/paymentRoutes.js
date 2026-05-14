const express = require("express");
const router = express.Router();
const { processPayment } = require("../controllers/paymentController");
const { createOrder, captureOrder } = require("../controllers/paypalController");

router.get("/test", (req, res) => res.send("Payment routes active"));
router.post("/process", processPayment);
router.post("/create-order", createOrder);
router.post("/capture-order", captureOrder);

module.exports = router;