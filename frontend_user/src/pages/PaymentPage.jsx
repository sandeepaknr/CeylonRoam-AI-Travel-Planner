import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { PayPalButtons } from "@paypal/react-paypal-js";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import "./styles/payment.css";

export default function PaymentPage() {
 const { bookingId } = useParams();
 const navigate = useNavigate();
 const { user } = useContext(AuthContext);
 const [booking, setBooking] = useState(null);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 const fetchBooking = async () => {
 try {
 const res = await API.get(`/bookings/${bookingId}`);
 setBooking(res.data);
 } catch (err) { console.error(err); }
 finally { setLoading(false); }
 };
 fetchBooking();
 }, [bookingId]);

 // PayPal doesn't support LKR in sandbox/some regions well. 
 // We'll convert to USD for the demo (Assuming 1 USD = 300 LKR)
 const getUSDAmount = () => {
 if (!booking) return "0.00";
 return (booking.totalCharge / 300).toFixed(2);
 };

 const createPayPalOrder = async () => {
 try {
 const res = await API.post("/paypal/create-order", {
 amount: getUSDAmount()
 });
 return res.data.id;
 } catch (err) {
 toast.error("Failed to initiate PayPal payment.");
 throw err;
 }
 };

 const onPayPalApprove = async (data) => {
 const toastId = toast.loading("Confirming your payment...");
 try {
 const res = await API.post("/paypal/capture-order", {
 orderID: data.orderID,
 bookingId: booking._id,
 customerId: user._id
 });
 if (res.data.success) {
 toast.success(" Payment successful! Your adventure is confirmed.", { id: toastId, duration: 5000 });
 navigate("/mybooking");
 }
 } catch (err) {
 toast.error(" Payment confirmation failed.", { id: toastId });
 }
 };

 if (loading) return <div className="loader">Verifying Booking...</div>;

 return (
 <div className="payment-container">
 <div className="payment-card animate-in">
 <div className="payment-header">
 <div className="payment-icon"></div>
 <h2>Secure Checkout</h2>
 <p className="payment-sub">Complete your booking with PayPal</p>
 </div>

 <div className="summary-box">
 <div className="summary-row">
 <span>Package / Service</span>
 <strong>{booking?.packageId?.name}</strong>
 </div>
 <div className="summary-row">
 <span>Total Amount</span>
 <strong className="amt">Rs. {booking?.totalCharge?.toLocaleString()}</strong>
 </div>
 <div className="summary-row conversion">
 <span>Approx. USD (PayPal)</span>
 <span>${getUSDAmount()}</span>
 </div>
 </div>

 <div className="paypal-button-container">
 <PayPalButtons 
 style={{ layout: "vertical", shape: "pill", color: "blue" }}
 createOrder={createPayPalOrder}
 onApprove={onPayPalApprove}
 onError={(err) => {
 console.error("PayPal Error:", err);
 toast.error("An error occurred with PayPal.");
 }}
 />
 </div>
 
 <p className="payment-footer">
 Your payment is encrypted and secure.
 </p>
 </div>
 </div>
 );
}