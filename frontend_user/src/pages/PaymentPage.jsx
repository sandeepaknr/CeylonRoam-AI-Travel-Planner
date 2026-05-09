import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
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

  const handlePay = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("💳 Processing your payment…");
    try {
      const paymentData = {
        bookingId: booking._id,
        customerId: user._id,
        amount: booking.totalCharge,
        transactionId: "TXN-" + Math.random().toString(36).substr(2, 9).toUpperCase(),
        paymentMethod: "Card"
      };

      await API.post("/payments/process", paymentData);
      toast.success("🎉 Payment successful! Your adventure is confirmed.", { id: toastId, duration: 5000 });
      navigate("/mybooking");
    } catch {
      toast.error("❌ Payment failed. Please check your details and try again.", { id: toastId });
    }
  };

  if (loading) return <div className="loader">Verifying Booking...</div>;

  return (
    <div className="payment-container">
      <div className="payment-card animate-in">
        <h2>💳 Secure Checkout</h2>
        <div className="summary-box">
          <p><strong>Package:</strong> {booking?.packageId?.name}</p>
          <p><strong>Total Amount:</strong> <span className="amt">Rs. {booking?.totalCharge}</span></p>
        </div>

        <form onSubmit={handlePay} className="payment-form">
          <div className="input-group">
            <label>Cardholder Name</label>
            <input type="text" placeholder="John Doe" required />
          </div>
          <div className="input-group">
            <label>Card Number</label>
            <input type="text" placeholder="xxxx xxxx xxxx xxxx" required />
          </div>
          <div className="row">
            <input type="text" placeholder="MM/YY" required />
            <input type="text" placeholder="CVC" required />
          </div>
          <button type="submit" className="pay-btn">Pay Now</button>
        </form>
      </div>
    </div>
  );
}