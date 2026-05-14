import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import useProtectedNavigation from "../hooks/useProtectedNavigation";
import { 
  LuBot, 
  LuGlobe, 
  LuMessageSquare, 
  LuMap, 
  LuStar, 
  LuShuffle, 
  LuHotel, 
  LuCompass, 
  LuWallet, 
  LuSave, 
  LuShare, 
  LuRefreshCw
} from "react-icons/lu"; 
import "./styles/Home.css";

/* ── Static data ──────────────────────────────────────────── */
const HERO_IMAGES = [
  { src: "/images/ella.webp", label: "Ella" },
  { src: "/images/sigiriya.jpg", label: "Sigiriya" },
  { src: "/images/mirissa.jpg", label: "Mirissa" },
  { src: "/images/yala.jpg", label: "Yala" },
  { src: "/images/galle.jpg", label: "Galle Fort" },
];

const TICKER_ITEMS = [
  { emoji: "🌊", text: "Whale watching in Mirissa" },
  { emoji: "🏔️", text: "Hiking in Ella" },
  { emoji: "🐘", text: "Safari in Yala" },
  { emoji: "🌺", text: "Tea estates in Nuwara Eliya" },
  { emoji: "🏰", text: "Sigiriya Lion Rock" },
  { emoji: "🎣", text: "Fishing in Trincomalee" },
  { emoji: "🌴", text: "Beaches of Arugam Bay" },
  { emoji: "🛕", text: "Temple of the Tooth, Kandy" },
];

const ZIGZAG_DATA = [
  {
    step: "01",
    title: "Start chatting with us",
    desc: "Tell Roamy where you want to go, what you love, and your budget. Our Gemini-powered AI understands even the most laid-back, Singlish-flavoured prompts.",
    features: [
      { icon: <LuBot />, text: "Powered by Gemini AI" },
      { icon: <LuGlobe />, text: "Understands English & Sinhala" },
      { icon: <LuMessageSquare />, text: "Conversational — no forms" },
    ],
    img: "/images/strat1.jpg",
    cta: "Try the AI Planner",
    href: "/tripplan",
  },
  {
    step: "02",
    title: "Browse popular itineraries",
    desc: "Not sure where to start? Explore curated trips loved by thousands of travellers — from 3-day beach escapes to 14-day grand island circuits.",
    features: [
      { icon: <LuMap />, text: "100+ curated Sri Lanka routes" },
      { icon: <LuStar />, text: "Community-rated itineraries" },
      { icon: <LuShuffle />, text: "Fully customisable to your taste" },
    ],
    img: "/images/popular2.jpg",
    cta: "Explore Packages",
    href: "/packages",
    flipped: true,
  },
  {
    step: "03",
    title: "Get personalised recommendations",
    desc: "Based on your preferences, budget, and travel style, we surface the exact hotels, experiences, and hidden gems that match you — nobody else.",
    features: [
      { icon: <LuHotel />, text: "Handpicked hotels & stays" },
      { icon: <LuCompass />, text: "Off-the-beaten-path spots" },
      { icon: <LuWallet />, text: "Budget-aware suggestions" },
    ],
    img: "/images/popular3.jpg",
    cta: "See Destinations",
    href: "/packages",
  },
  {
    step: "04",
    title: "Plan with your crew",
    desc: "Sri Lanka is better shared. Save your itinerary, download it, and share it with your travel group. Everyone stays on the same page — literally.",
    features: [
      { icon: <LuSave />, text: "Save & export plans as PDF" },
      { icon: <LuShare />, text: "Share instantly with anyone" },
      { icon: <LuRefreshCw />, text: "Unlimited edits & revisions" },
    ],
    img: "https://images.unsplash.com/photo-1539635278303-d4002c07eae3?w=800&auto=format&fit=crop&q=80",
    cta: "My Saved Trips",
    href: "/mytripplans",
    flipped: true,
  },
];

const DESTINATIONS = [
  { name: "Mirissa",        pkgs: "38 packages",  big: true,
    img: "/images/mirissa8.jpg" },
  { name: "Ella",     pkgs: "24 packages",  big: false,
    img: "/images/ella8.jpg" },
  { name: "Sigiriya",    pkgs: "19 packages",  big: false,
    img: "/images/sigiriya9.jpg" },
  { name: "Galle Fort",  pkgs: "22 packages",  big: false,
    img: "/images/gallefort.jpg" },
  { name: "Yala",        pkgs: "31 packages",  big: false,
    img: "/images/yala8.jpg" },
];

/* ──────────────────────────────────────────────────────────
   COMPONENT
────────────────────────────────────────────────────────── */
export default function Home() {
  const navigate = useNavigate();
  const handleProtectedNavigation = useProtectedNavigation();

  useEffect(() => {
    const els = document.querySelectorAll(".section");
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("active"); }),
      { threshold: 0.10 }
    );
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  const tickerItems = [...TICKER_ITEMS, ...TICKER_ITEMS];
  
  // Seamless Animation in copy the array 4 times (20 pic)
  const marqueeImages = [...HERO_IMAGES, ...HERO_IMAGES, ...HERO_IMAGES, ...HERO_IMAGES];

  return (
    <div className="home-wrapper">

      <section className="section hero-mt active">
        <div className="hero-mt-inner">

          <div className="hero-video-wrapper">
            <video className="hero-bg-video" autoPlay loop muted playsInline>
              <source src="/videos/interface.mp4" type="video/mp4" />
            </video>
            <div className="hero-video-overlay"></div>
            <div className="hero-headline-row">
              <h1 className="hero-h1">
                Plan your<br />
                perfect{" "}
                <em className="hero-h1-italic">Sri Lanka</em><br />
                trip — with AI.
              </h1>
            </div>
          </div>

          {/* ── Seamless Marquee ── */}
          <div className="hero-marquee-container">
            <div className="hero-marquee-track">
              {marqueeImages.map((img, i) => (
                <div key={i} className="hero-pill-img">
                  <img src={img.src} alt={img.label} loading={i < 5 ? "eager" : "lazy"} />
                  <div className="hero-img-label">{img.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-sub-row">
            <p className="hero-tagline">
              <strong>CeylonRoam</strong> is your AI-powered travel companion for everything
              Sri Lanka — itineraries, packages, stays, and more.
            </p>
            <div className="hero-cta-cluster">
              <button
                className="pill-btn pill-btn-dark"
                onClick={() => handleProtectedNavigation("/tripplan")}
              >
                <span>✨</span> Start planning
              </button>
              <button
                className="pill-btn pill-btn-bordered"
                onClick={() => navigate("/packages")}
              >
                Browse packages
              </button>
            </div>
          </div>

          <div className="hero-ticker-wrap">
            <div className="hero-ticker">
              {tickerItems.map((item, i) => (
                <span key={i} className="hero-ticker-item">
                  <span className="hero-ticker-emoji">{item.emoji}</span>
                  {item.text}
                  {i < tickerItems.length - 1 && (
                    <span style={{ opacity: 0.25, marginLeft: 24 }}>·</span>
                  )}
                </span>
              ))}
            </div>
          </div>

        </div>
      </section>

      <section className="section destinations-mt">
        <div className="cr-container">
          <div className="dest-header reveal">
            <h2 className="dest-h2">
              Discover<br />
              <span>Sri Lanka's finest.</span>
            </h2>
            <p className="dest-sub">
              Hand-picked destinations that range from ancient ruins to world-class beaches and misty highland tea country.
            </p>
            <button
              className="pill-btn pill-btn-dark pill-btn-sm"
              onClick={() => navigate("/packages")}
              style={{ marginTop: "24px" }}
            >
              View all destinations →
            </button>
          </div>

          <div className="dest-grid">
            {DESTINATIONS.map((d, i) => (
              <div
                key={i}
                className={`dest-tile ${d.big ? "d-big" : ""} reveal`}
                style={{ "--d": `${0.07 * i}s` }}
                onClick={() => navigate("/packages")}
              >
                <img src={d.img} alt={d.name} className="dest-tile-img" loading="lazy" />
                <div className="dest-tile-overlay" />
                <div className="dest-tile-label">
                  <div className="dest-tile-name">{d.name}</div>
                  <div className="dest-tile-pkgs">{d.pkgs}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {ZIGZAG_DATA.map((zz, idx) => (
        <section
          key={idx}
          className={`section zigzag-section ${zz.flipped ? "flipped" : ""}`}
        >
          <div className="cr-container">
            <div className="zigzag-grid">
              <div className="zigzag-text reveal">
                <div className="zigzag-step-num">{zz.step}</div>
                <h2 className="zigzag-h2">{zz.title}</h2>
                <p className="zigzag-desc">{zz.desc}</p>
                <div className="zigzag-feature-list">
                  {zz.features.map((f, fi) => (
                    <div key={fi} className="zigzag-feature-item">
                      <div className="zigzag-feat-icon" style={{color: "var(--ink)", fontSize: "20px"}}>{f.icon}</div>
                      {f.text}
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: "8px" }}>
                  <button
                    className="pill-btn pill-btn-dark pill-btn-sm"
                    onClick={() => handleProtectedNavigation(zz.href)}
                    style={{ marginTop: "8px" }}
                  >
                    {zz.cta} →
                  </button>
                </div>
              </div>
              <div className="zigzag-image reveal" style={{ "--d": "0.15s" }}>
                <img
                  src={zz.img}
                  alt={zz.title}
                  className="zigzag-img-main"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </section>
      ))}

      <section className="section bento-section">
        <div className="cr-container">
          <div className="bento-header reveal">
            <div>
              <div className="eyebrow">
                <div className="eyebrow-dot" /> What's new at CeylonRoam
              </div>
              <h2 className="bento-title">
                Everything you need.<br />
                Nothing you don't.
              </h2>
            </div>
            <p className="bento-sub">
              A complete toolkit for planning your perfect Sri Lanka adventure, all in one place.
            </p>
          </div>

          <div className="bento-grid">
            <div className={`bento-card bento-a bento-span-2 reveal`} style={{ "--d": "0.05s" }}>
              <div className="bento-top-content">
                <h3 className="bento-card-h3">Your personal<br />Sri Lanka expert</h3>
                <p className="bento-card-p">Ask anything. Get instant, smart, hyper-local answers.</p>
                <button className="pill-btn pill-btn-dark pill-btn-sm" onClick={() => handleProtectedNavigation("/tripplan")} style={{ width: "fit-content" }}>✨ Try it now</button>
              </div>
              <div className="bento-img-wrap"><img src="/images/personal5.jpg" alt="AI Trip Planner" loading="lazy" /></div>
            </div>

            <div className="bento-card bento-b reveal" style={{ "--d": "0.12s" }}>
              <div className="bento-top-content">
                <h3 className="bento-card-h3">200+<br />incredible spots</h3>
                <p className="bento-card-p">From surf breaks to sacred peaks.</p>
                <button className="pill-btn pill-btn-dark pill-btn-sm" onClick={() => navigate("/packages")} style={{ width: "fit-content" }}>Explore →</button>
              </div>
              <div className="bento-img-wrap"><img src="/images/spots6.jpg" alt="Destinations" loading="lazy" /></div>
            </div>

            <div className="bento-card bento-c reveal" style={{ "--d": "0.18s" }}>
              <h3 className="bento-card-h3">Full itinerary<br />in seconds</h3>
              <p className="bento-card-p">Day-by-day breakdown generated instantly.</p>
              <div className="bento-bg-emoji">⚡</div>
              <button className="pill-btn pill-btn-dark pill-btn-sm" onClick={() => handleProtectedNavigation("/tripplan")} style={{ width: "fit-content", marginTop: "auto" }}>Generate now →</button>
            </div>

            <div className="bento-card bento-d reveal" style={{ "--d": "0.22s" }}>
              <h3 className="bento-card-h3">Plans for<br />every wallet</h3>
              <p className="bento-card-p">Backpacker to luxury — we find the best value for every trip.</p>
              <div className="bento-bg-emoji">💰</div>
              <button className="pill-btn pill-btn-dark pill-btn-sm" onClick={() => handleProtectedNavigation("/tripplan")} style={{ width: "fit-content", marginTop: "auto" }}>Set budget →</button>
            </div>

            <div className="bento-card bento-e reveal" style={{ "--d": "0.28s" }}>
              <h3 className="bento-card-h3">Hotels &<br />villas included</h3>
              <p className="bento-card-p">Curated accommodation matched to your style and budget.</p>
              <div className="bento-bg-emoji">🏡</div>
              <button className="pill-btn pill-btn-dark pill-btn-sm" onClick={() => navigate("/packages")} style={{ width: "fit-content", marginTop: "auto" }}>Browse stays →</button>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer-mt">
        <div className="cr-container">
          <div className="footer-mt-grid">
            <div>
              <div className="footer-mt-logo">Ceylon<span>Roam.</span></div>
              <p className="footer-mt-desc">AI-powered travel planning for Sri Lanka. Discover, plan, and explore — all in one place.</p>
              <div className="footer-socials-mt">
                <a href="#!" className="fsc" onClick={e => e.preventDefault()}>f</a>
                <a href="#!" className="fsc" onClick={e => e.preventDefault()}>in</a>
                <a href="#!" className="fsc" onClick={e => e.preventDefault()}>tw</a>
              </div>
            </div>
            <div className="footer-col">
              <h4>Discover</h4>
              <ul>
                <li><Link to="/packages">All Packages</Link></li>
                <li><Link to="/tripplan">AI Trip Planner</Link></li>
                <li><Link to="/about">Our Story</Link></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Support</h4>
              <ul>
                <li><Link to="/help">Help Centre</Link></li>
                <li><Link to="/contact">Contact Us</Link></li>
                <li><Link to="/privacy">Privacy Policy</Link></li>
                <li><Link to="/terms">Terms of Use</Link></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>Account</h4>
              <ul>
                <li><Link to="/login">Sign In</Link></li>
                <li><Link to="/register">Create Account</Link></li>
                <li><a href="/mytripplans" onClick={(e) => handleProtectedNavigation("/mytripplans", e)}>My Saved Trips</a></li>
                <li><a href="/mybooking" onClick={(e) => handleProtectedNavigation("/mybooking", e)}>My Bookings</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-mt-bottom">
            <p className="footer-mt-cr">© 2026 CeylonRoam Inc. All rights reserved.</p>
            <p className="footer-mt-cr">Built with ❤️ for Sri Lanka</p>
          </div>
        </div>
      </footer>

    </div>
  );
}