import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import useProtectedNavigation from "../hooks/useProtectedNavigation";
import {
 LuBot,
 LuPackage,
 LuHotel,
 LuCar,
 LuUtensils,
 LuTicket,
} from "react-icons/lu";
import "./styles/About.css";

/* ── Static data ──────────────────────────────────────────── */
const FEATURE_ROWS = [
 { icon: <LuBot />, name: "AI Trip Planner", desc: "Generate full itineraries with Gemini 2.5", live: true, href: "/tripplan" },
 { icon: <LuPackage />, name: "Tour Packages", desc: "Browse 500+ curated Sri Lanka packages", live: true, href: "/packages" },
 { icon: <LuHotel />, name: "Hotel Booking", desc: "Smart accommodation recommendations", live: false, href: "/hotels" },
 { icon: <LuCar />, name: "Transport & Transfers", desc: "Private cars, tuk tuks & intercity buses", live: false, href: "/transport" },
 { icon: <LuUtensils />, name: "Restaurant Finder", desc: "Local eats, fine dining & street food maps", live: false, href: "/restaurants" },
 { icon: <LuTicket />, name: "Experiences & Tours", desc: "Safaris, surfing, cooking classes & more", live: false, href: "/experiences" },
];

const STATS = [
 { target: 10, suffix: "k+", label: "Happy travellers", decimals: 0 },
 { target: 200, suffix: "+", label: "Destinations", decimals: 0 },
 { target: 45, suffix: "k+", label: "AI plans created", decimals: 0 },
 { target: 4.9, suffix: "★", label: "Average rating", decimals: 1 },
];

/* ──────────────────────────────────────────────────────────
 COMPONENT
────────────────────────────────────────────────────────── */
export default function About() {
 const navigate = useNavigate();
 const handleProtectedNavigation = useProtectedNavigation();
 const [statValues, setStatValues] = useState(() => STATS.map(() => 0));
 const statsRef = useRef(null);

 /* Scroll-reveal — untouched logic */
 useEffect(() => {
 const els = document.querySelectorAll(".section");
 const io = new IntersectionObserver(
 entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("active"); }),
 { threshold: 0.08, rootMargin: "0px 0px -8% 0px" }
 );
 els.forEach(el => io.observe(el));
 return () => io.disconnect();
 }, []);

 useEffect(() => {
 let rafId;

 const animateStats = () => {
 const durationMs = 1300;
 const start = performance.now();

 const tick = now => {
 const progress = Math.min((now - start) / durationMs, 1);
 const eased = 1 - Math.pow(1 - progress, 3);
 setStatValues(STATS.map(s => s.target * eased));
 if (progress < 1) {
 rafId = requestAnimationFrame(tick);
 }
 };

 cancelAnimationFrame(rafId);
 setStatValues(STATS.map(() => 0));
 rafId = requestAnimationFrame(tick);
 };

 const observer = new IntersectionObserver(
 entries => {
 const [entry] = entries;
 if (entry.isIntersecting) animateStats();
 },
 { threshold: 0.45 }
 );

 if (statsRef.current) observer.observe(statsRef.current);

 return () => {
 cancelAnimationFrame(rafId);
 observer.disconnect();
 };
 }, []);

 return (
 <div className="about-page">

 {/* ════════════════════════ ① HERO */}
 <section className="section about-hero active">

 <h1 className="about-hero-h1 reveal" style={{ "--d": "0.08s" }}>
 Redefining how you experience<br />
 <em>Sri Lanka.</em>
 </h1>

 <div className="about-hero-sub">
 <p className="about-hero-desc reveal" style={{ "--d": "0.14s" }}>
 CeylonRoam was born from a simple belief: Sri Lanka is one of the
 world's most extraordinary destinations, and it deserves a travel
 platform that matches its brilliance. We combine AI intelligence
 with deep local knowledge to turn your ideas into unforgettable journeys.
 </p>

 {/* Stat strip — bento card style */}
 <div className="about-hero-stats reveal" style={{ "--d": "0.20s" }} ref={statsRef}>
 {STATS.map((s, i) => (
 <div key={i} className="about-stat">
 <span className="about-stat-num">
 {statValues[i].toFixed(s.decimals)}
 {s.suffix}
 </span>
 <span className="about-stat-label">{s.label}</span>
 </div>
 ))}
 </div>
 </div>

 {/* Full-width hero banner */}
 <div className="about-hero-img-wrap reveal" style={{ "--d": "0.22s" }}>
            <video
              src="/videos/about-hero-loop.mp4"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-label="Sigiriya Rock Fortress video"
            />
 </div>

 </section>

 {/* ════════════════════════ ② OUR STORY — ZIG-ZAG */}
 <section className="section about-story">
 <div className="about-container">

 {/* Row 1 — Our Story */}
 <div className="about-zz-grid" style={{ marginBottom: "100px" }}>
 <div className="about-zz-text reveal">
 <div className="about-eyebrow">
 <div className="about-eyebrow-dot" />
 Our Story
 </div>
 <h2 className="about-zz-h2">
 Born from a<br />love of the island.
 </h2>
 <p className="about-zz-p">
 Sri Lanka has 8 UNESCO World Heritage Sites, 26 national parks,
 1,600 km of coastline, and some of the most welcoming people on earth.
 Yet every travel platform treated it like an afterthought.
 </p>
 <p className="about-zz-p">
 We built CeylonRoam because Sri Lanka deserves its own dedicated
 platform — one that speaks the language of local expertise,
 powered by the intelligence of modern AI.
 </p>
 <button className="about-zz-pill" onClick={() => navigate("/packages")}>
 Explore Sri Lanka →
 </button>
 </div>

 <div className="about-zz-img reveal" style={{ "--d": "0.15s" }}>
              <img
                src="/images/sigiriya-custom.jpeg"
                alt="Sigiriya Rock Fortress"
                loading="lazy"
              />
 </div>
 </div>

 {/* Row 2 — Our Mission */}
 <div className="about-zz-grid flipped">
 <div className="about-zz-text reveal">
 <div className="about-eyebrow">
 <div className="about-eyebrow-dot" />
 Our Mission
 </div>
 <h2 className="about-zz-h2">
 AI that feels like<br />a local friend.
 </h2>
 <p className="about-zz-p">
 Our Gemini-powered AI doesn't just spit out generic itineraries.
 It understands your pace, your style, your budget. It knows that
 "relaxed" in Ella means different things to different people.
 </p>
 <p className="about-zz-p">
 Every plan it builds blends data-driven insight with the kind of
 on-the-ground knowledge that only comes from loving a place deeply.
 That's the CeylonRoam difference.
 </p>
 <button className="about-zz-pill" onClick={() => handleProtectedNavigation("/tripplan")}>
 Try AI Trip Planner
 </button>
 </div>

 <div className="about-zz-img reveal" style={{ "--d": "0.15s" }}>
 <img
 src="/images/about-mission-custom.png"
 alt="Sri Lankan cultural performance"
 loading="lazy"
 />
 </div>
 </div>

 </div>
 </section>

 {/* ════════════════════════ ③ FEATURE LIST */}
 <section className="section about-features-section">
 <div className="about-container">

 {/* Header */}
 <div className="about-features-header reveal">
 <div className="about-feat-eyebrow">
 <div className="about-feat-eyebrow-dot" />
 Everything in one place
 </div>
 <h2 className="about-features-h2">
 Your whole Sri Lanka<br />trip, organised.
 </h2>
 <p className="about-features-sub">
 From AI itinerary planning to hotel discovery and tour bookings —
 we're building the complete travel OS for Sri Lanka.
 </p>
 </div>

 {/* Feature rows */}
 <div className="about-feat-stack">
 {FEATURE_ROWS.map((f, i) => (
 <div
 key={i}
 className="about-feat-row reveal"
 data-live={f.live ? "true" : "false"}
 style={{
 "--d": `${0.06 * i}s`,
 cursor: f.live ? "pointer" : "default",
 }}
 onClick={() =>
 f.live && f.href &&
 (f.href === "/tripplan"
 ? handleProtectedNavigation(f.href)
 : navigate(f.href))
 }
 >
 {/* Icon */}
 <div className="about-feat-icon">{f.icon}</div>

 {/* Text */}
 <div className="about-feat-text">
 <div className="about-feat-name">{f.name}</div>
 <div className="about-feat-desc">{f.desc}</div>
 </div>

 {/* Status badge */}
 {f.live ? (
 <span className="about-feat-live-badge">
 <span className="about-feat-live-dot" />
 Live
 </span>
 ) : (
                <span className="about-feat-coming-pill">Coming soon</span>
 )}

 {/* Arrow for live items */}
 {f.live && <span className="about-feat-arrow">→</span>}
 </div>
 ))}
 </div>

 </div>
 </section>

 {/* ════════════════════════ ④ MISSION QUOTE */}
 <section className="section about-mission">
 <div className="about-container">
 <div className="about-mission-inner reveal">
 <p className="about-mission-quote">
 We don't just plan your trip. We help you fall in love with a place
 you'll <em>want to return to again and again.</em>
 </p>
 <p className="about-mission-attr">— The CeylonRoam Mission</p>
 </div>
 </div>
 </section>

 {/* ════════════════════════ ⑤ CTA BANNER */}
 <section className="section about-cta">
 <div className="about-cta-inner reveal">
 <h2 className="about-cta-h2">
 Ready to discover<br />
 <em>Sri Lanka</em> your way?
 </h2>
 <p className="about-cta-sub">
 Join 10,000+ travellers who've already experienced the CeylonRoam
 difference. Your perfect island trip is one conversation away.
 </p>
 <div className="about-cta-btns">
 <button
 className="about-btn-white"
 onClick={() => handleProtectedNavigation("/tripplan")}
 >
 Start planning for free
 </button>
 <button
 className="about-btn-ghost"
 onClick={() => navigate("/packages")}
 >
 Browse packages →
 </button>
 </div>
 </div>
 </section>

 </div>
 );
}
