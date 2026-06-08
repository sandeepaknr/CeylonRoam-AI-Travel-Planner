import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import "./styles/editPassword.css";

export default function EditPassword() {
 const { user } = useContext(AuthContext);
 const navigate = useNavigate();

 const [step, setStep] = useState(1);
 const [otp, setOtp] = useState("");
 const [newPassword, setNewPassword] = useState("");
 const [confirmPassword, setConfirmPassword] = useState("");
 const [loading, setLoading] = useState(false);

 useEffect(() => {
 if (!user) {
 navigate("/login");
 }
 }, [user, navigate]);

 const handleSendOTP = async () => {
 setLoading(true);
 const toastId = toast.loading("Sending verification code...");
 try {
 await API.post("/auth/send-password-otp", { email: user.email });
 setStep(2);
 toast.success(`Code sent to ${user.email}`, { id: toastId });
 } catch (err) {
 toast.error(err.response?.data?.message || "Error sending OTP. Please try again.", { id: toastId });
 } finally {
 setLoading(false);
 }
 };

 const handleVerifyOTP = async () => {
 setLoading(true);
 const toastId = toast.loading("Verifying code...");
 try {
 const res = await API.post("/auth/verify-otp", { email: user.email, otp });
 if (res.data.success) {
 toast.success("Code verified!", { id: toastId });
 setStep(3);
 }
 } catch (err) {
 toast.error(err.response?.data?.message || "Invalid or expired OTP!", { id: toastId });
 } finally {
 setLoading(false);
 }
 };

 const handlePasswordUpdate = async (e) => {
 e.preventDefault();

 if (newPassword.length < 6) {
 toast.error("Password must be at least 6 characters long!");
 return;
 }

 if (newPassword !== confirmPassword) {
 toast.error("Passwords do not match!");
 return;
 }

 setLoading(true);
 const toastId = toast.loading("Updating your password...");
 try {
 const res = await API.put(`/auth/update-password/${user._id}`, { password: newPassword });
 toast.success(res.data.message || "Password updated successfully!", { id: toastId });
 navigate("/profile");
 } catch (err) {
 console.error("Update error:", err);
 toast.error(err.response?.data?.message || "Failed to update password.", { id: toastId });
 } finally {
 setLoading(false);
 }
 };

 return (
 <div className="password-update-container">
 <div className="update-card">
 <h2 className="update-title">Secure Password Update</h2>

 <div className="step-indicator">
 <span className={step >= 1 ? "is-active" : ""}>1</span>
 <span className={step >= 2 ? "is-active" : ""}>2</span>
 <span className={step >= 3 ? "is-active" : ""}>3</span>
 </div>

 {step === 1 && (
 <div className="step-ui animate-in">
 <p className="info-text">We need to verify your identity before changing the password.</p>
 <p className="email-note">Code will be sent to: <strong>{user?.email}</strong></p>
 <button onClick={handleSendOTP} disabled={loading} className="ep-btn-primary">
 {loading ? "Sending..." : "Send OTP to Email"}
 </button>
 </div>
 )}

 {step === 2 && (
 <div className="step-ui animate-in">
 <label className="input-label">Enter the 6-digit code</label>
 <input
 type="text"
 value={otp}
 maxLength="6"
 className="otp-input"
 onChange={(e) => setOtp(e.target.value)}
 placeholder="Enter OTP"
 autoFocus
 />
 <button onClick={handleVerifyOTP} disabled={loading || otp.length < 6} className="ep-btn-primary">
 {loading ? "Verifying..." : "Verify & Continue"}
 </button>
 <button onClick={() => setStep(1)} className="btn-link">Wrong email? Go back</button>
 </div>
 )}

 {step === 3 && (
 <form onSubmit={handlePasswordUpdate} className="step-ui animate-in">
 <div className="input-group">
 <label className="input-label">New Password</label>
 <input
 type="password"
 required
 className="pass-input"
 placeholder="At least 6 characters"
 onChange={(e) => setNewPassword(e.target.value)}
 />
 </div>
 <div className="input-group">
 <label className="input-label">Confirm New Password</label>
 <input
 type="password"
 required
 className="pass-input"
 placeholder="Repeat password"
 onChange={(e) => setConfirmPassword(e.target.value)}
 />
 </div>
 <button type="submit" disabled={loading} className="ep-btn-primary">
 {loading ? "Updating..." : "Update Password"}
 </button>
 </form>
 )}
 </div>
 </div>
 );
}
