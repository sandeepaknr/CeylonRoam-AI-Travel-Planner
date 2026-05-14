import { Link, useNavigate, useLocation } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import "./styles/navbar.css";

/* ── Nav link definitions ─────────────────────────────────── */
const NAV_LINKS = [
  { to: "/",             label: "Home"          },
  { to: "/packages",     label: "Packages"      },
  { to: "/book-services",label: "Book Services" },
  { to: "/tripplan",     label: "🤖 AI Trip Planner", isSpecial: true },
  { to: "/about",        label: "About"         },
  { to: "/contact",      label: "Contact"       },
];

/* ── Sidebar link definitions ─────────────────────────────── */
const SIDEBAR_LINKS = [
  { to: "/userprofile",  label: "My Profile",    emoji: "👤" },
  { to: "/tripplan",     label: "AI Trip Planner",emoji: "🤖" },
  { to: "/mytripplans",  label: "My Trip Plans",  emoji: "🗺️" },
  { to: "/mybooking",    label: "My Bookings",    emoji: "📋" },
  { to: "/settings",     label: "Settings",       emoji: "⚙️" },
];

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate  = useNavigate();
  const location  = useLocation();
  const [showNav,     setShowNav]     = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* ── Hide navbar on scroll down ────────────────────────── */
  const handleLogout = () => {
    logout();
    setSidebarOpen(false);
    navigate("/");
  };

  useEffect(() => {
    let lastScroll = window.scrollY;
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      setShowNav(currentScroll <= lastScroll || currentScroll <= 80);
      lastScroll = currentScroll;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* Close sidebar on route change */
  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

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

        {/* Right: Avatar or Login */}
        <div className="nav-right">
          {user ? (
            <div
              className="profile-trigger"
              onClick={() => setSidebarOpen(true)}
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
      </nav>

      {/* ════════════════════════════════════ SIDEBAR OVERLAY */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? "open" : ""}`}
        onClick={() => setSidebarOpen(false)}
      >
        <div
          className={`side-menu ${sidebarOpen ? "slide" : ""}`}
          onClick={e => e.stopPropagation()}
        >
          {/* Close button */}
          <button className="close-btn" onClick={() => setSidebarOpen(false)}>
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
                <span>🏢</span> Business Tools
              </Link>
            ) : (
              <Link to="/request-business">
                <span>📊</span> Register Business
              </Link>
            )}
          </div>

          <hr className="divider" />

          {/* Logout */}
          <button onClick={handleLogout} className="sidebar-logout">
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
}