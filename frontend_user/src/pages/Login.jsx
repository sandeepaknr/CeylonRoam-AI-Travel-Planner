import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import "./styles/auth.css";

export default function Login() {
  /* ── ALL ORIGINAL LOGIC — UNTOUCHED ─────────────────────── */
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    const toastId = toast.loading("🔐 Signing you in…");
    try {
      const { data } = await API.post("/auth/login", form);
      toast.success("🌴 Welcome back! Redirecting…", { id: toastId });
      login(data);
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed. Please try again.", { id: toastId });
    }
  };

  /* ── PREMIUM UI ──────────────────────────────────────────── */
  return (
    <div className="auth-page">

      {/* ═══════════════════ LEFT — VISUAL PANEL */}
      <div className="auth-visual">
        <img
          className="auth-visual-img"
          src="https://images.unsplash.com/photo-1583001931096-959e9a1a6223?w=1400&auto=format&fit=crop&q=85"
          alt="Ella, Sri Lanka"
        />
        <div className="auth-visual-overlay" />

        <div className="auth-visual-content">
          {/* Logo */}
          <Link to="/" className="auth-visual-logo">
            Ceylon<span>Roam.</span>
          </Link>

          {/* Quote */}
          <div>
            <p className="auth-visual-quote">
              Welcome back to your<br />
              <em>island adventure.</em>
            </p>
            <div className="auth-visual-chips">
              <div className="auth-chip">🌴 200+ Destinations</div>
              <div className="auth-chip">🤖 AI Trip Planner</div>
              <div className="auth-chip">⭐ 4.9 / 5 Rating</div>
            </div>
          </div>

          {/* Social proof strip */}
          <div className="auth-visual-footer">
            <div className="auth-visual-avatar-row">
              {[
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&q=80",
                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&auto=format&q=80",
                "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&auto=format&q=80",
              ].map((src, i) => (
                <div key={i} className="auth-visual-avatar">
                  <img src={src} alt="traveller" />
                </div>
              ))}
            </div>
            <p className="auth-visual-footer-text">
              Joined by 10,000+ Sri Lanka travellers
            </p>
          </div>
        </div>
      </div>

      {/* ═══════════════════ RIGHT — FORM PANEL */}
      <div className="auth-form-panel">
        <div className="auth-form-box">

          {/* Mobile-only logo */}
          <Link to="/" className="auth-mobile-logo">
            Ceylon<span>Roam.</span>
          </Link>

          {/* Heading */}
          <div className="auth-heading">
            <p className="auth-eyebrow">Welcome back</p>
            <h1 className="auth-h1">Sign in to<br />CeylonRoam</h1>
            <p className="auth-sub">
              Your next Sri Lanka adventure is waiting.
            </p>
          </div>

          {/* ── FORM — all handlers & names exactly as original ── */}
          <form className="auth-form" onSubmit={handleSubmit}>

            {/* Email */}
            <div className="auth-field">
              <label className="auth-label">Email address</label>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">✉️</span>
                <input
                  className="auth-input"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Password */}
            <div className="auth-field">
              <div className="auth-field-helper">
                <label className="auth-label">Password</label>
                <Link to="/forgot-password" className="auth-forgot">
                  Forgot password?
                </Link>
              </div>
              <div className="auth-input-wrap">
                <span className="auth-input-icon">🔒</span>
                <input
                  className="auth-input"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Submit */}
            <button type="submit" className="auth-submit">
              Sign In →
            </button>

          </form>

          {/* Divider */}
          <div className="auth-divider">or</div>

          {/* Bottom link */}
          <p className="auth-bottom-text">
            Don't have an account?{" "}
            <Link to="/register">Create one free</Link>
          </p>

          {/* Trust strip */}
          <div className="auth-trust">
            <div className="auth-trust-item">🔒 Secure login</div>
            <div className="auth-trust-item">🛡️ Data protected</div>
            <div className="auth-trust-item">🌿 No spam, ever</div>
          </div>

        </div>
      </div>

    </div>
  );
}
