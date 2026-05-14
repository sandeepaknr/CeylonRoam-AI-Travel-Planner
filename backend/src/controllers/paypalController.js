const axios = require('axios');
const Payment = require("../models/Payment");
const Booking = require("../models/Booking");

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET;
const PAYPAL_BASE = process.env.PAYPAL_MODE === 'sandbox' 
    ? "https://api-m.sandbox.paypal.com" 
    : "https://api-m.paypal.com";

/**
 * Generate an OAuth2 access token from PayPal
 */
const generateAccessToken = async () => {
  try {
    const auth = Buffer.from(PAYPAL_CLIENT_ID + ":" + PAYPAL_SECRET).toString("base64");
    const response = await axios({
      url: `${PAYPAL_BASE}/v1/oauth2/token`,
      method: "post",
      data: "grant_type=client_credentials",
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });
    return response.data.access_token;
  } catch (error) {
    console.error("Failed to generate Access Token:", error);
    throw error;
  }
};

/**
 * Create a PayPal Order
 */
exports.createOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    const accessToken = await generateAccessToken();
    const url = `${PAYPAL_BASE}/v2/checkout/orders`;
    
    const response = await axios({
      url,
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      data: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD", // PayPal support limited for LKR, usually best to convert or use USD
              value: amount,
            },
          },
        ],
      }),
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error("Failed to create order:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to create PayPal order" });
  }
};

/**
 * Capture a PayPal Order
 */
exports.captureOrder = async (req, res) => {
  try {
    const { orderID, bookingId, customerId } = req.body;
    const accessToken = await generateAccessToken();
    const url = `${PAYPAL_BASE}/v2/checkout/orders/${orderID}/capture`;

    const response = await axios({
      url,
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const captureData = response.data;

    if (captureData.status === "COMPLETED") {
      // Create a payment record in our DB
      const newPayment = new Payment({
        bookingId,
        customerId,
        amount: captureData.purchase_units[0].payments.captures[0].amount.value,
        transactionId: captureData.id,
        paymentMethod: "PayPal",
        status: "Completed"
      });

      await newPayment.save();

      // Update Booking status
      await Booking.findByIdAndUpdate(bookingId, {
        paymentStatus: "Paid",
        status: "Confirmed"
      });

      return res.status(200).json({ success: true, data: captureData });
    }

    res.status(400).json({ success: false, message: "Payment not completed" });
  } catch (error) {
    console.error("Failed to capture order:", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to capture PayPal order" });
  }
};
