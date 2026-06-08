import React from "react";
import "./styles/Legal.css";

export default function PrivacyPolicy() {
 return (
 <div className="legal-wrapper">
 <div className="legal-header">
 <h1>Privacy Policy</h1>
 <p>Last Updated: March 2026</p>
 </div>

 <div className="legal-container text-content glass">
 <section>
 <h2>1. Information We Collect</h2>
 <p>We collect information you provide directly to us, such as when you create an account, make a booking, or contact support.</p>
 </section>
 
 <section>
 <h2>2. How We Use Your Data</h2>
 <p>Your data is used to process bookings, provide customer support, and send personalized travel recommendations.</p>
 </section>

 <section>
 <h2>3. Data Security</h2>
 <p>We implement industry-standard encryption to protect your personal and payment information.</p>
 </section>
 </div>
 </div>
 );
}