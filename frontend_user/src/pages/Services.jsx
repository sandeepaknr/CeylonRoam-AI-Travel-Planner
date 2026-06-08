import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useProtectedNavigation from "../hooks/useProtectedNavigation";
import "./styles/Services.css";

/* ── Data ─────────────────────────────────────────────────── */
const SERVICES = [
 {
 icon: "",
 tag: "AI Powered",
 title: "Gemini AI Trip Planner",
 desc: "Describe your dream trip in plain words. Our Gemini 2.5-powered engine builds a full day-by-day Sri Lanka itinerary in seconds — personalised to your budget, travel style, and interests.",
 feats: ["Day-by-day itinerary generation", "Budget-aware recommendations", "Understands English & Sinhala"],
 img: "https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=700&auto=format&fit=crop&q=80",
 cardStyle: "svc-card-blue",
 span: "svc-card-wide",
 href: "/tripplan",
 },
 {
 icon: "",
 tag: "Vision AI",
 title: "Smart Place Detection",
 desc: "Upload any Sri Lanka photo. Our AI instantly identifies the location, landmark, or region and auto-fills your trip preferences.",
 feats: ["Instant landmark recognition", "Auto-fills trip details", "Works with any photo"],
 cardStyle: "svc-card-rose",
 span: "",
 href: "/tripplan",
 },
 {
 icon: "",
 tag: "Chatbot",
 title: "Roamy — Local AI Guide",
 desc: "Your 24/7 conversational travel expert. Ask Roamy anything — from bus routes in Ella to the best kottu spot in Colombo.",
 feats: ["Singlish/Sinhala friendly", "Local insider tips", "Available 24/7"],
 cardStyle: "svc-card-green",
 span: "svc-card-tall",
 href: "/tripplan",
 },
 {
 icon: "",
 tag: "Packages",
 title: "Curated Tour Packages",
 desc: "Browse and book 500+ handpicked Sri Lanka packages — ranging from 3-day beach escapes to 14-day grand island circuits.",
 feats: ["500+ curated packages", "Instant online booking", "Flexible cancellation"],
 cardStyle: "svc-card-amber",
 span: "",
 href: "/packages",
 },
 {
 icon: "",
 tag: "Itineraries",
 title: "Saved & Shared Trip Plans",
 desc: "Every AI plan is saved to your account. Download as PDF, share with your crew, and edit anytime before your trip.",
 feats: ["Cloud-saved itineraries", "One-click PDF export", "Share with anyone"],
 cardStyle: "svc-card-lavender",
 span: "",
 href: "/mytripplans",
 },
];

const TOS_SECTIONS = [
 { id: "acceptance", num: "01", title: "Acceptance of These Terms" },
 { id: "description", num: "02", title: "Service Description" },
 { id: "accounts", num: "03", title: "User Accounts" },
 { id: "bookings", num: "04", title: "Bookings & Payments" },
 { id: "content", num: "05", title: "User Content" },
 { id: "liability", num: "06", title: "Limitation of Liability" },
 { id: "privacy", num: "07", title: "Privacy & Data" },
 { id: "changes", num: "08", title: "Changes to Terms" },
 { id: "contact", num: "09", title: "Contact Us" },
];

/* ──────────────────────────────────────────────────────────
 COMPONENT
────────────────────────────────────────────────────────── */
export default function Services() {
 const navigate = useNavigate();
 const handleProtectedNavigation = useProtectedNavigation();
 const [activeSection, setActiveSection] = useState("acceptance");
 const observerRef = useRef(null);

 /* ── IntersectionObserver to track which ToS section is visible */
 useEffect(() => {
 const ids = TOS_SECTIONS.map(s => s.id);

 observerRef.current = new IntersectionObserver(
 (entries) => {
 entries.forEach(entry => {
 if (entry.isIntersecting) {
 setActiveSection(entry.target.id);
 }
 });
 },
 { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
 );

 ids.forEach(id => {
 const el = document.getElementById(id);
 if (el) observerRef.current.observe(el);
 });

 return () => observerRef.current && observerRef.current.disconnect();
 }, []);

 const scrollTo = (id) => {
 const el = document.getElementById(id);
 if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
 };

 return (
 <div className="svc-page">

 {/* ═══════════════════════════ ① HERO */}
 <div className="svc-hero">
 <div className="svc-hero-left">
 <div className="svc-hero-eyebrow"> Our Services</div>
 <h1 className="svc-hero-h1">
 Elevating Your<br />
 <em>Travel Experience</em>
 </h1>
 <p className="svc-hero-desc">
 CeylonRoam combines AI intelligence with deep local knowledge of Sri Lanka
 to turn your travel dreams into a seamless, personalised reality — from the
 first idea to the last sunset.
 </p>
 </div>

 {/* Stats panel */}
 <div className="svc-hero-stats">
 {[
 { emoji: "", num: "Gemini 2.5", label: "AI Engine powering trip plans" },
 { emoji: "", num: "500+", label: "Curated packages available" },
 { emoji: "⭐", num: "4.9 / 5", label: "Average traveller rating" },
 { emoji: "", num: "< 10 sec", label: "To generate a full itinerary" },
 ].map((s, i) => (
 <div key={i} className="svc-stat-chip">
 <span className="svc-stat-emoji">{s.emoji}</span>
 <div>
 <div className="svc-stat-num">{s.num}</div>
 <div className="svc-stat-label">{s.label}</div>
 </div>
 </div>
 ))}
 </div>
 </div>

 {/* ═══════════════════════════ ② BENTO GRID */}
 <div className="svc-bento-section">
 <div className="svc-bento-label">Core Services</div>

 <div className="svc-bento-grid">
 {SERVICES.map((svc, i) => (
 <div
 key={i}
 className={`svc-card ${svc.cardStyle} ${svc.span || ""}`}
 >
 <div className="svc-card-icon">{svc.icon}</div>
 <div className="svc-card-tag">{svc.tag}</div>
 <div className="svc-card-title">{svc.title}</div>
 <p className="svc-card-desc">{svc.desc}</p>

 {svc.feats && (
 <div className="svc-card-feats">
 {svc.feats.map((f, fi) => (
 <div key={fi} className="svc-card-feat">{f}</div>
 ))}
 </div>
 )}

 {svc.img && (
 <div className="svc-card-img-wrap">
 <img src={svc.img} alt={svc.title} loading="lazy" />
 </div>
 )}

 <button
 className="svc-card-cta"
 onClick={() => handleProtectedNavigation(svc.href)}
 >
 Try it now →
 </button>

 {/* Decorative background emoji */}
 <span className="svc-card-bg-em">{svc.icon}</span>
 </div>
 ))}
 </div>
 </div>

 {/* ═══════════════════════════ ③ TERMS OF SERVICE */}
 <div className="tos-section">

 {/* Masthead */}
 <div className="tos-masthead">
 <p className="tos-masthead-eyebrow">Legal</p>
 <h2>Terms of Service</h2>
 <div className="tos-masthead-meta">
 <span className="tos-meta-badge"> Effective: 1 January 2026</span>
 <span className="tos-meta-badge"> Jurisdiction: Sri Lanka</span>
 <span className="tos-meta-badge"> Governed by: Sri Lankan Law</span>
 </div>
 </div>

 {/* Sticky sidebar + content */}
 <div className="tos-layout">

 {/* Sidebar nav */}
 <aside className="tos-sidebar">
 <p className="tos-sidebar-title">On This Page</p>
 {TOS_SECTIONS.map(s => (
 <button
 key={s.id}
 className={`tos-nav-item ${activeSection === s.id ? "active" : ""}`}
 onClick={() => scrollTo(s.id)}
 >
 <span className="tos-nav-num">{s.num}</span>
 {s.title}
 </button>
 ))}

 <div className="tos-sidebar-info">
 <p>
 Questions about our terms?{" "}
 <a href="mailto:legal@ceylonroam.com">legal@ceylonroam.com</a>
 </p>
 </div>
 </aside>

 {/* Main legal document */}
 <main className="tos-content">

 {/* ─── 01 Acceptance ─── */}
 <div id="acceptance" className="tos-block">
 <p className="tos-block-num">01</p>
 <h3>Acceptance of These Terms</h3>
 <p>
 Welcome to CeylonRoam. By accessing or using our platform —
 including our website, mobile applications, AI Trip Planner, chatbot
 ("Roamy"), and all associated services — you agree to be bound by
 these Terms of Service ("Terms") and our Privacy Policy.
 </p>
 <p>
 If you do not agree to these Terms, you may not access or use our
 services. These Terms constitute a legally binding agreement between
 you and CeylonRoam Inc. ("Company," "we," "us," or "our").
 </p>
 <div className="tos-callout">
 <p>
 �️ By creating a CeylonRoam account or using our services, you
 represent that you are at least 18 years of age and have the legal
 capacity to enter into a binding agreement.
 </p>
 </div>
 </div>

 {/* ─── 02 Service Description ─── */}
 <div id="description" className="tos-block">
 <p className="tos-block-num">02</p>
 <h3>Service Description</h3>
 <p>
 CeylonRoam provides a technology platform for Sri Lanka travel planning,
 including AI-generated itineraries, package discovery and booking,
 AI chatbot support, and smart destination detection via uploaded photographs.
 </p>
 <p>
 We act as an intermediary between travellers and third-party service
 providers (tour operators, hotels, transport companies). We do not
 directly operate hotels, flights, or guided tours.
 </p>
 <ul>
 <li>AI-generated trip itineraries are suggestions, not guaranteed bookings.</li>
 <li>Package availability is subject to third-party operator confirmation.</li>
 <li>Pricing displayed is indicative and may change at the time of booking.</li>
 <li>Our AI services may be updated, suspended, or discontinued without notice.</li>
 </ul>
 </div>

 {/* ─── 03 User Accounts ─── */}
 <div id="accounts" className="tos-block">
 <p className="tos-block-num">03</p>
 <h3>User Accounts</h3>
 <p>
 To access certain features of CeylonRoam (saving itineraries, making
 bookings, managing trips), you must create an account. You agree to:
 </p>
 <ul>
 <li>Provide accurate, complete, and current account information at all times.</li>
 <li>Maintain the security of your password and accept responsibility for all activities under your account.</li>
 <li>Notify us immediately of any unauthorized use of your account at <a href="mailto:support@ceylonroam.com" style={{ color: "#26658C" }}>support@ceylonroam.com</a>.</li>
 <li>Not share your account credentials with any third party.</li>
 </ul>
 <p>
 We reserve the right to terminate or suspend accounts that violate
 these Terms, engage in fraudulent activity, or pose a security risk
 to our platform or other users.
 </p>
 </div>

 {/* ─── 04 Bookings & Payments ─── */}
 <div id="bookings" className="tos-block">
 <p className="tos-block-num">04</p>
 <h3>Bookings & Payments</h3>
 <p>
 When you make a booking through CeylonRoam, you enter into a contract
 with the relevant third-party service provider. We are not a party to
 that contract, but we facilitate the booking on their behalf.
 </p>
 <p>
 All payments are processed through our secure payment gateway.
 By booking, you authorise us to charge the specified amount to your
 provided payment method. All prices are displayed in Sri Lankan Rupees
 (LKR) unless otherwise stated.
 </p>
 <div className="tos-callout">
 <p>
 CeylonRoam uses industry-standard SSL encryption for all
 payment transactions. We do not store your full card details on our servers.
 </p>
 </div>
 <p>
 Cancellation and refund policies vary by service provider. Please
 review the specific terms on each package or booking before confirming.
 CeylonRoam's platform fee (if applicable) is non-refundable once a
 booking is confirmed.
 </p>
 </div>

 {/* ─── 05 User Content ─── */}
 <div id="content" className="tos-block">
 <p className="tos-block-num">05</p>
 <h3>User Content</h3>
 <p>
 CeylonRoam may allow you to submit, upload, or share content including
 travel reviews, photographs, and itinerary feedback ("User Content").
 By submitting User Content, you grant us a non-exclusive, worldwide,
 royalty-free licence to use, display, and distribute that content
 within our platform and marketing materials.
 </p>
 <p>You represent and warrant that your User Content:</p>
 <ul>
 <li>Does not infringe any third-party intellectual property rights.</li>
 <li>Is not defamatory, obscene, or otherwise unlawful.</li>
 <li>Does not contain malware, spam, or misleading information.</li>
 <li>Accurately reflects your genuine experience.</li>
 </ul>
 <p>
 We reserve the right to remove any User Content that violates these
 Terms or our Community Guidelines, without prior notice.
 </p>
 </div>

 {/* ─── 06 Limitation of Liability ─── */}
 <div id="liability" className="tos-block">
 <p className="tos-block-num">06</p>
 <h3>Limitation of Liability</h3>
 <p>
 To the fullest extent permitted by applicable law, CeylonRoam and
 its affiliates, officers, employees, and agents shall not be liable
 for any indirect, incidental, special, consequential, or punitive
 damages, including but not limited to:
 </p>
 <ul>
 <li>Loss of profits, revenue, or data.</li>
 <li>Personal injury or property damage arising from your use of services.</li>
 <li>Any errors or omissions in AI-generated itineraries or recommendations.</li>
 <li>Service interruptions, delays, or failures of third-party providers.</li>
 </ul>
 <p>
 Our aggregate liability to you for any claim arising from or relating
 to these Terms or our services shall not exceed the total amounts paid
 by you to CeylonRoam in the twelve (12) months preceding the claim.
 </p>
 </div>

 {/* ─── 07 Privacy & Data ─── */}
 <div id="privacy" className="tos-block">
 <p className="tos-block-num">07</p>
 <h3>Privacy & Data</h3>
 <p>
 Your use of CeylonRoam is also governed by our{" "}
 <a href="/privacy" style={{ color: "#26658C", fontWeight: 600 }}>Privacy Policy</a>,
 which is incorporated into these Terms by reference. By using our
 services, you consent to the collection, processing, and use of your
 personal data as described in that policy.
 </p>
 <p>
 We collect information including your name, email address, travel
 preferences, booking history, and device identifiers. This data is
 used to improve our AI recommendations, personalise your experience,
 and process transactions.
 </p>
 <div className="tos-callout">
 <p>
 CeylonRoam never sells your personal data to third parties.
 Data shared with booking partners is limited to what is necessary
 to fulfil your booking.
 </p>
 </div>
 </div>

 {/* ─── 08 Changes to Terms ─── */}
 <div id="changes" className="tos-block">
 <p className="tos-block-num">08</p>
 <h3>Changes to Terms</h3>
 <p>
 We reserve the right to modify these Terms at any time. When changes
 are made, we will update the "Effective Date" at the top of this page
 and, for material changes, notify registered users by email or
 in-app notification.
 </p>
 <p>
 Your continued use of CeylonRoam after any changes become effective
 constitutes your acceptance of the revised Terms. If you do not agree
 to the updated Terms, you must discontinue use of our services and
 may request account deletion by contacting our support team.
 </p>
 </div>

 {/* ─── 09 Contact ─── */}
 <div id="contact" className="tos-block">
 <p className="tos-block-num">09</p>
 <h3>Contact Us</h3>
 <p>
 If you have any questions, concerns, or complaints regarding these
 Terms of Service, please contact us through any of the following channels:
 </p>
 <ul>
 <li> Email: <a href="mailto:legal@ceylonroam.com" style={{ color: "#26658C" }}>legal@ceylonroam.com</a></li>
 <li> Address: 123 Galle Road, Colombo 03, Western Province, Sri Lanka</li>
 <li> Phone: +94 11 234 5678 (Monday – Friday, 9 AM – 6 PM IST)</li>
 </ul>
 <p>
 We aim to respond to all legal inquiries within five (5) business days.
 For urgent matters, please mark your email subject line with "URGENT – Legal".
 </p>
 </div>

 </main>
 </div>
 </div>

 </div>
 );
}