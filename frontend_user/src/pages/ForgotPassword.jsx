import React, { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { LuMail, LuKey, LuLock, LuArrowLeft, LuCheck } from "react-icons/lu";
import API from "../api/axios";
import "./styles/ForgotPassword.css";

export default function ForgotPassword() {
  const navigate = useNavigate();

  // UX Steps: 1 = Email, 2 = OTP + New Password, 3 = Success
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");

  // Step 2 Countdown Timer
  const [timeLeft, setTimeLeft] = useState(600); // 10 mins

  // Refs for OTP inputs
  const otpRefs = useRef([]);

  // ── Handlers for Step 1 (Email Request) ──
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    if (!email) return toast.error("Please enter your email address.");

    setLoading(true);
    const toastId = toast.loading("Sending recovery code...");
    try {
      await API.post("/auth/forgot-password", { email });
      toast.success("Code sent! Check your inbox.", { id: toastId });
      setStep(2);
      setTimeLeft(600); // Reset timer to 10 mins
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send code.", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // ── Timer Logic for Step 2 ──
  useEffect(() => {
    if (step !== 2) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [step]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // ── OTP Input Handlers ──
  const handleOtpChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    // If pasting a full code
    if (value.length > 1) {
      const pastedData = value.slice(0, 6).split("");
      for (let i = 0; i < 6; i++) {
        newOtp[i] = pastedData[i] || "";
      }
      setOtp(newOtp);
      // Focus last filled box
      const focusIndex = pastedData.length < 6 ? pastedData.length : 5;
      if (otpRefs.current[focusIndex]) otpRefs.current[focusIndex].focus();
      return;
    }

    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance
    if (value && index < 5 && otpRefs.current[index + 1]) {
      otpRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0 && otpRefs.current[index - 1]) {
      otpRefs.current[index - 1].focus();
    }
  };

  // ── Password Strength UI ──
  const getPasswordStrength = (pass) => {
    if (pass.length === 0) return { score: 0, label: "", color: "var(--border)" };
    if (pass.length < 6) return { score: 1, label: "Weak", color: "#ef4444" };
    if (pass.length < 10) return { score: 2, label: "Good", color: "#f59e0b" };
    return { score: 3, label: "Strong", color: "#10b981" };
  };
  const strength = getPasswordStrength(newPassword);

  // ── Handlers for Step 2 (Verify & Reset) ──
  const handleResetPassword = async (e) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length !== 6) return toast.error("Please enter the full 6-digit code.");
    if (!newPassword || newPassword.length < 6) return toast.error("Password must be at least 6 characters.");

    setLoading(true);
    const toastId = toast.loading("Verifying and resetting password...");
    try {
      await API.post("/auth/reset-password", {
        email,
        otp: otpCode,
        newPassword,
      });
      toast.success("Password reset successful!", { id: toastId });
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid code or reset failed.", { id: toastId });
      // Shake animation on error
      const row = document.getElementById("otp-row");
      if (row) {
        row.classList.remove("fp-shake");
        void row.offsetWidth; // trigger reflow
        row.classList.add("fp-shake");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fp-page">
      <div className="fp-card">
        <div className="fp-card-body">
          
          {/* Brand */}
          <Link to="/" className="fp-brand">
            <div className="fp-brand-logo">✈️</div>
            <div className="fp-brand-name">Ceylon<span>Roam.</span></div>
          </Link>

          {/* ── STEP 1: EMAIL REQUEST ── */}
          {step === 1 && (
            <div className="fp-step">
              <div className="fp-dots">
                <div className="fp-dot active"></div>
                <div className="fp-dot inactive"></div>
              </div>
              
              <div className="fp-heading">
                <div className="fp-eyebrow">Recovery</div>
                <h1 className="fp-h1">Forgot Password?</h1>
                <p className="fp-sub">No worries, we'll send you reset instructions.</p>
              </div>

              <form className="fp-form" onSubmit={handleRequestOTP}>
                <div className="fp-field">
                  <label className="fp-label">Email address</label>
                  <div className="fp-input-wrap">
                    <span className="fp-input-icon"><LuMail /></span>
                    <input
                      className="fp-input"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                </div>

                <button type="submit" className="fp-submit" disabled={loading}>
                  {loading ? <div className="fp-spinner" /> : "Send Reset Code →"}
                </button>
              </form>

              <div style={{ textAlign: "center" }}>
                <Link to="/login" className="fp-back"><LuArrowLeft /> Back to login</Link>
              </div>
            </div>
          )}

          {/* ── STEP 2: VERIFY OTP & NEW PASSWORD ── */}
          {step === 2 && (
            <div className="fp-step">
              <div className="fp-dots">
                <div className="fp-dot done"></div>
                <div className="fp-dot active"></div>
              </div>

              <div className="fp-heading">
                <div className="fp-eyebrow">Verification</div>
                <h1 className="fp-h1">Set New Password</h1>
                <p className="fp-sub">We sent a 6-digit code to <strong>{email}</strong></p>
              </div>

              <form className="fp-form" onSubmit={handleResetPassword}>
                <div className="fp-field" style={{ marginBottom: "8px" }}>
                  <label className="fp-label" style={{ textAlign: "center" }}>Verification Code</label>
                  <div className="fp-otp-row" id="otp-row">
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => (otpRefs.current[i] = el)}
                        className={`fp-otp-digit ${digit ? "fp-otp-filled" : ""}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={6} // allow pasting full code
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        autoFocus={i === 0}
                      />
                    ))}
                  </div>
                  
                  <div className="fp-resend-row">
                    {timeLeft > 0 ? (
                      <>Code expires in <span className="fp-timer">{formatTime(timeLeft)}</span></>
                    ) : (
                      <>
                        Code expired. <button type="button" className="fp-resend-btn" onClick={handleRequestOTP} disabled={loading}>Resend code</button>
                      </>
                    )}
                  </div>
                </div>

                <div className="fp-field">
                  <label className="fp-label">New Password</label>
                  <div className="fp-input-wrap">
                    <span className="fp-input-icon"><LuLock /></span>
                    <input
                      className="fp-input"
                      type="password"
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  {/* Password Strength */}
                  {newPassword && (
                    <div className="fp-strength">
                      <div className="fp-strength-track">
                        <div 
                          className="fp-strength-fill" 
                          style={{ 
                            width: `${(strength.score / 3) * 100}%`,
                            background: strength.color 
                          }}
                        />
                      </div>
                      <div className="fp-strength-label" style={{ color: strength.color }}>
                        {strength.label}
                      </div>
                    </div>
                  )}
                </div>

                <button type="submit" className="fp-submit" disabled={loading || timeLeft === 0}>
                  {loading ? <div className="fp-spinner" /> : "Reset Password"}
                </button>
              </form>
            </div>
          )}

          {/* ── STEP 3: SUCCESS ── */}
          {step === 3 && (
            <div className="fp-success">
              <div className="fp-success-ring"><LuCheck color="#059669" /></div>
              <h2 className="fp-success-h2">All done!</h2>
              <p className="fp-success-p">Your password has been reset successfully. You can now log in to your account with your new credentials.</p>
              
              <button 
                className="fp-submit" 
                onClick={() => navigate("/login")}
              >
                Go to Login
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
