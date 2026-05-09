import React from "react";
import "./styles/Legal.css";

export default function TermsOfService() {
  return (
    <div className="legal-wrapper">
      <div className="legal-header">
        <h1>Terms of Service</h1>
        <p>Please read these terms carefully before using our platform.</p>
      </div>

      <div className="legal-container text-content glass">
        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>By accessing TravelSystem, you agree to be bound by these terms and all applicable laws and regulations.</p>
        </section>

        <section>
          <h2>2. Booking Conditions</h2>
          <p>All bookings are subject to availability and confirmation by our local partners.</p>
        </section>

        <section>
          <h2>3. User Responsibilities</h2>
          <p>Users are responsible for maintaining the confidentiality of their account and password.</p>
        </section>
      </div>
    </div>
  );
}