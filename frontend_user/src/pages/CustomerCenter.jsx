import React from "react";
import "./styles/Legal.css";

export default function CustomerCenter() {
  return (
    <div className="legal-wrapper">
      <div className="legal-header">
        <h1>Customer Support Center</h1>
        <p>How can we help you today?</p>
      </div>

      <div className="legal-container">
        <div className="support-cards">
          <div className="s-card glass">
            <div className="icon">📞</div>
            <h3>Call Us</h3>
            <p>+94 11 234 5678</p>
          </div>
          <div className="s-card glass">
            <div className="icon">✉️</div>
            <h3>Email Us</h3>
            <p>support@travelsystem.com</p>
          </div>
          <div className="s-card glass">
            <div className="icon">💬</div>
            <h3>Live Chat</h3>
            <p>Available 24/7</p>
          </div>
        </div>

        <div className="faq-section">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-item glass">
            <h4>How do I book a travel package?</h4>
            <p>You can browse our packages page, select your favorite, and click 'Book Now'.</p>
          </div>
          <div className="faq-item glass">
            <h4>What is your refund policy?</h4>
            <p>Cancellations made 7 days before the trip are eligible for a full refund.</p>
          </div>
        </div>
      </div>
    </div>
  );
}