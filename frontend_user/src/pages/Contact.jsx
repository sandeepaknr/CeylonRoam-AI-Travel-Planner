import React, { useState } from 'react';
import toast from 'react-hot-toast';
import './styles/contact.css';

/* ══════════════════════════════════════════════════════════
   CONTACT INFO CARDS DATA
══════════════════════════════════════════════════════════ */
const INFO_CARDS = [
  {
    icon: '✉️',
    label: 'Email',
    value: 'hello@ceylonroam.com',
    color: 'lavender',
  },
  {
    icon: '📞',
    label: 'Phone',
    value: '+94 11 234 5678',
    color: 'cyan',
  },
  {
    icon: '📍',
    label: 'Location',
    value: 'Colombo 03, Sri Lanka',
    color: 'lime',
  },
];

/* ══════════════════════════════════════════════════════════
   COMPONENT
══════════════════════════════════════════════════════════ */
export default function Contact() {
  /* ── State (form fields) ─────────────────────────────── */
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  /* ── Handlers ───────────────────────────────────────── */
  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      /* ── Replace with your real API call or email service ─ */
      await new Promise(r => setTimeout(r, 1400)); // simulated delay
      setSuccess(true);
      setForm({ fullName: '', email: '', subject: '', message: '' });
    } catch {
      toast.error("❌ Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ══════════════════════════════════════════════════════
     PREMIUM UI
  ══════════════════════════════════════════════════════ */
  return (
    <div className="contact-page">
      <div className="contact-page-inner">
        <div className="contact-grid">

          {/* ═════════════ LEFT — INFO COLUMN */}
          <div className="contact-info-col">

            <div className="contact-eyebrow">✦ Contact Us</div>

            <h1 className="contact-h1">
              Let's plan<br />
              something<br />
              <em>incredible.</em>
            </h1>

            <p className="contact-desc">
              Have a question about Sri Lanka, a custom trip request, or a
              partnership proposal? Our team is happy to help — we typically
              respond within a few hours.
            </p>

            {/* Info mini-cards */}
            <div className="contact-info-cards">
              {INFO_CARDS.map((card, i) => (
                <div key={i} className={`contact-info-card ${card.color}`}>
                  <div className="contact-card-icon">{card.icon}</div>
                  <div className="contact-card-text">
                    <div className="contact-card-label">{card.label}</div>
                    <div className="contact-card-value">{card.value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Live availability chip */}
            <div className="contact-response-chip">
              <span className="contact-pulse" />
              We typically reply within 2–4 hours
            </div>

          </div>

          {/* ═════════════ RIGHT — FORM CARD */}
          <div className="contact-form-card">
            <div className="contact-form-header">
              <h2 className="contact-form-title">Send us a message</h2>
              <p className="contact-form-sub">
                Fill in the form below and our team will get back to you as
                soon as possible.
              </p>
            </div>

            {/* Success state */}
            {success && (
              <div className="contact-success">
                <span className="contact-success-icon">🎉</span>
                <span>
                  Your message was sent! We'll be in touch very soon.
                </span>
              </div>
            )}

            {/* Form */}
            {!success && (
              <form className="contact-form" onSubmit={handleSubmit}>

                {/* Row 1: Name + Email */}
                <div className="contact-form-row">
                  <div className="contact-field">
                    <label className="contact-label">Full Name</label>
                    <div className="contact-input-wrap">
                      <span className="contact-input-icon">👤</span>
                      <input
                        className="contact-input"
                        type="text"
                        name="fullName"
                        value={form.fullName}
                        placeholder="e.g. Amal Perera"
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="contact-field">
                    <label className="contact-label">Email Address</label>
                    <div className="contact-input-wrap">
                      <span className="contact-input-icon">✉️</span>
                      <input
                        className="contact-input"
                        type="email"
                        name="email"
                        value={form.email}
                        placeholder="you@example.com"
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Subject select */}
                <div className="contact-field">
                  <label className="contact-label">Subject</label>
                  <div className="contact-input-wrap">
                    <span className="contact-input-icon">📋</span>
                    <select
                      className="contact-select"
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Choose a subject…</option>
                      <option value="trip-planning">AI Trip Planning Help</option>
                      <option value="packages">Tour Packages Enquiry</option>
                      <option value="booking">Booking Support</option>
                      <option value="partnership">Business Partnership</option>
                      <option value="feedback">App Feedback</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Message */}
                <div className="contact-field">
                  <label className="contact-label">Message</label>
                  <div className="contact-input-wrap">
                    <span className="contact-input-icon top">💬</span>
                    <textarea
                      className="contact-textarea"
                      name="message"
                      value={form.message}
                      placeholder="Tell us how we can help you…"
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="contact-submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="contact-spinner" />
                      Sending…
                    </>
                  ) : (
                    <>
                      ✈️ Send Message
                    </>
                  )}
                </button>

                {/* Privacy note */}
                <p className="contact-privacy">
                  🔒 Your information is safe. We never share it with third parties.
                </p>

              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}