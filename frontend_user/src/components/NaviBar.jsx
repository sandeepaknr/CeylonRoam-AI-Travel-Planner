import { Link, useNavigate, useLocation } from "react-router-dom";
import { useContext, useEffect, useRef, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { CurrencyContext, SUPPORTED_CURRENCIES } from "../context/CurrencyContext";
import "./styles/navbar.css";

/* ── Nav link definitions ─────────────────────────────────── */
const NAV_LINKS = [
 { to: "/", label: "Home" },
 { to: "/packages", label: "Packages" },
 { to: "/book-services",label: "Book Services" },
 { to: "/tripplan", label: " AI Trip Planner", isSpecial: true },
 { to: "/about", label: "About" },
 { to: "/contact", label: "Contact" },
];

/* ── Sidebar link definitions ─────────────────────────────── */
const SIDEBAR_LINKS = [
 { to: "/userprofile", label: "My Profile", emoji: "" },
 { to: "/tripplan", label: "AI Trip Planner",emoji: "" },
 { to: "/mytripplans", label: "My Trip Plans", emoji: "" },
 { to: "/mybooking", label: "My Bookings", emoji: "" },
 { to: "/settings", label: "Settings", emoji: "" },
];

export default function Navbar() {
 const { user, logout } = useContext(AuthContext);
 const { selectedCurrency, setSelectedCurrency, rateSource } = useContext(CurrencyContext);
 const navigate = useNavigate();
 const location = useLocation();
 const [showNav, setShowNav] = useState(true);
 const [sidebarOpen, setSidebarOpen] = useState(false);
 const [sidebarClosing, setSidebarClosing] = useState(false);
 const [mobileNavOpen, setMobileNavOpen] = useState(false);
 const closeTimerRef = useRef(null);

 /* ── Hide navbar on scroll down ────────────────────────── */
 const handleLogout = () => {
 logout();
 setSidebarOpen(false);
 setSidebarClosing(false);
 navigate("/");
 };

 const openSidebar = () => {
 if (closeTimerRef.current) {
 clearTimeout(closeTimerRef.current);
 closeTimerRef.current = null;
 }
 setSidebarClosing(false);
 setSidebarOpen(true);
 };

 const closeSidebar = () => {
 if (!sidebarOpen || sidebarClosing) return;
 setSidebarClosing(true);
 closeTimerRef.current = setTimeout(() => {
 setSidebarOpen(false);
 setSidebarClosing(false);
 closeTimerRef.current = null;
 }, 300);
 };

 useEffect(() => {
 let lastScroll = window.scrollY;
 const handleScroll = () => {
 const currentScroll = window.scrollY;
 const shouldShowNav = currentScroll <= lastScroll || currentScroll <= 80;
 setShowNav(shouldShowNav);
 if (!shouldShowNav) setMobileNavOpen(false);
 lastScroll = currentScroll;
 };
 window.addEventListener("scroll", handleScroll);
 return () => window.removeEventListener("scroll", handleScroll);
 }, []);

 /* Close sidebar on route change */
 useEffect(() => {
 setSidebarOpen(false);
 setSidebarClosing(false);
 setMobileNavOpen(false);
 }, [location.pathname]);

 useEffect(() => {
 return () => {
 if (closeTimerRef.current) {
 clearTimeout(closeTimerRef.current);
 closeTimerRef.current = null;
 }
 };
 }, []);

 return (
 <>
 {/* ════════════════════════════════════ TOP NAVBAR */}
 <nav className={`navbar ${showNav ? "nav-show" : "nav-hide"}`}>

 {/* Logo */}
 <div className="nav-left">
 <Link to="/">
 <h2 className="logo">Ceylon<span>Roam</span></h2>
 </Link>
 </div>

 {/* Center Links — visible to all users */}
 <div className="nav-center">
 <div className="nav-links">
 {NAV_LINKS.map(({ to, label, isSpecial }) => (
 <Link
 key={to}
 to={to}
 className={`${location.pathname === to ? "active-link" : ""} ${isSpecial ? "ai-trip-link" : ""}`.trim()}
 >
 {label}
 </Link>
 ))}
 </div>
 </div>

 {/* Right: Currency + Avatar */}
 <div className="nav-right">

  {/* -- Currency Selector -- */}
  <div className="nav-currency-wrap">
     <span className={`nav-rate-dot nav-rate-${rateSource}`} title={rateSource + " rates"} />

    <select
      className="nav-currency-select"
      value={selectedCurrency}
      onChange={e => setSelectedCurrency(e.target.value)}
      aria-label="Select display currency"
    >
      {SUPPORTED_CURRENCIES.map(c => (
        <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>
      ))}
    </select>
  </div>

 <button
 type="button"
 className={`mobile-menu-toggle ${mobileNavOpen ? "open" : ""}`}
 onClick={() => setMobileNavOpen(open => !open)}
 aria-label={mobileNavOpen ? "Close navigation menu" : "Open navigation menu"}
 aria-expanded={mobileNavOpen}
 >
 <span></span>
 <span></span>
 <span></span>
 </button>

 {user ? (
 <div
 className="profile-trigger"
 onClick={openSidebar}
 title="Open profile menu"
 >
 <div className="avatar-circle-navibar">
 {user?.profilePicture ? (
 <img 
 src={`http://localhost:5000${user.profilePicture}`} 
 alt="P" 
 style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} 
 />
 ) : (
 user?.username ? user.username.charAt(0).toUpperCase() : "U"
 )}
 </div>
 </div>
 ) : (
 <Link to="/login" className="login-btn">Sign In</Link>
 )}
 </div>

 <div className={`mobile-nav-panel ${mobileNavOpen ? "open" : ""}`}>
 {NAV_LINKS.map(({ to, label, isSpecial }) => (
 <Link
 key={to}
 to={to}
 className={`${location.pathname === to ? "active-link" : ""} ${isSpecial ? "ai-trip-link" : ""}`.trim()}
 >
 {label}
 </Link>
 ))}
 {user ? (
 <button
 type="button"
 className="mobile-profile-link"
 onClick={() => {
 setMobileNavOpen(false);
 openSidebar();
 }}
 >
 Profile Menu
 </button>
 ) : (
 <Link to="/login" className="mobile-signin-link">Sign In</Link>
 )}
 </div>
 </nav>

 {/* ════════════════════════════════════ SIDEBAR OVERLAY */}
 <div
 className={`sidebar-overlay ${sidebarOpen ? "open" : ""} ${sidebarClosing ? "closing" : ""}`.trim()}
 onClick={closeSidebar}
 >
 <div
 className={`side-menu ${sidebarOpen ? "slide" : ""} ${sidebarClosing ? "closing" : ""}`.trim()}
 onClick={e => e.stopPropagation()}
 >
 {/* Close button */}
 <button className="close-btn" onClick={closeSidebar}>
 &times;
 </button>

 {/* User Profile Header */}
 <div className="user-profile-info">
 <div className="large-avatar">
 {user?.profilePicture ? (
 <img 
 src={`http://localhost:5000${user.profilePicture}`} 
 alt="Profile" 
 style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} 
 />
 ) : (
 user?.username ? user.username.charAt(0).toUpperCase() : "U"
 )}
 </div>
 <h3>{user?.name || user?.username || "Traveller"}</h3>
 <p>{user?.email || ""}</p>
 <span className="badge">{user?.accountType || "Member"}</span>
 </div>

 <hr className="divider" />

 {/* Navigation Links */}
 <div className="side-links">
 {SIDEBAR_LINKS.map(({ to, label, emoji }) => (
 <Link
 key={to}
 to={to}
 className={location.pathname === to ? "sidebar-active" : ""}
 >
 <span>{emoji}</span> {label}
 </Link>
 ))}

 {/* Conditional business link */}
 {user?.accountType === "business" ? (
 <Link to="/businesstools">
 <span></span> Business Tools
 </Link>
 ) : (
 <Link to="/request-business">
 <span></span> Register Business
 </Link>
 )}
 </div>

 <hr className="divider" />

 {/* Logout */}
 <button
 onClick={handleLogout}
 className="sidebar-logout"
 aria-label="Sign out"
 title="Sign out"
 >
 <svg viewBox="0 0 24 24" aria-hidden="true">
 <path d="M15 3h-6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6" />
 <path d="M10 12h11" />
 <path d="m18 7 5 5-5 5" />
 </svg>
 </button>
 </div>
 </div>
 </>
 );
}
