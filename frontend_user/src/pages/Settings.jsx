import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import {
 LuBriefcaseBusiness,
 LuChartNoAxesCombined,
 LuBookmark,
 LuHeadset,
 LuShieldCheck,
 LuFileText,
 LuLockKeyhole,
} from "react-icons/lu";
import "./styles/settings.css";

export default function Settings() {
 const { user } = useContext(AuthContext);

 return (
 <div className="settings-page">
 <div className="settings-container">
 
 {/* ── Header ── */}
 <header className="settings-header">
 <div className="settings-eyebrow animate-in">
 <div className="settings-eyebrow-dot" />
 Your Account
 </div>
 <h1 className="animate-in" style={{ animationDelay: "0.05s" }}>Account Settings</h1>
 <p className="animate-in" style={{ animationDelay: "0.1s" }}>
 Manage your profile, business preferences, and security settings
 </p>
 </header>

 {/* ── Bento Box Grid ── */}
 <div className="settings-grid">
 
 {user?.accountType === "user" && (
 <div className="settings-card animate-in">
 <div className="settings-card-icon"><LuBriefcaseBusiness size={24} /></div>
 <h3>Grow with CeylonRoam</h3>
 <p>
 Partner your travel business with our system to reach global travelers. 
 Submit a business request to unlock premium features.
 </p>
 <Link to="/request-business" className="settings-btn">
 Create Business Request
 </Link>
 </div>
 )}

 {user?.accountType === "business" && (
 <div className="settings-card animate-in">
 <div className="settings-card-icon"><LuChartNoAxesCombined size={24} /></div>
 <h3>Business Insights</h3>
 <p>
 Monitor your business performance, manage bookings, and view 
 customer analytics for your registered services.
 </p>
 <Link to="/businesstools" className="settings-btn">
 Manage My Business
 </Link>
 </div>
 )}

 <div className="settings-card animate-in">
 <div className="settings-card-icon"><LuBookmark size={24} /></div>
 <h3>Saved Packages</h3>
 <p>
 Access all the travel experiences you've bookmarked for later. 
 Review your favorite destinations and plan your next trip.
 </p>
 <Link to="/savedpackages" className="settings-btn secondary">
 View Saved Items
 </Link>
 </div>

 <div className="settings-card animate-in">
 <div className="settings-card-icon"><LuHeadset size={24} /></div>
 <h3>Customer Center</h3>
 <p>
 Need help with your bookings or have a question? 
 Our support team is here to guide you 24/7.
 </p>
 <Link to="/help" className="settings-btn secondary">
 Get Help
 </Link>
 </div>

 <div className="settings-card animate-in">
 <div className="settings-card-icon"><LuShieldCheck size={24} /></div>
 <h3>Privacy & Safety</h3>
 <p>
 Learn how we protect your personal data and 
 ensure your travel information remains secure.
 </p>
 <Link to="/privacy" className="settings-btn secondary">
 Read Policy
 </Link>
 </div>

 <div className="settings-card animate-in">
 <div className="settings-card-icon"><LuFileText size={24} /></div>
 <h3>Terms of Service</h3>
 <p>
 Review the rules and guidelines for using our 
 platform and booking your next adventure.
 </p>
 <Link to="/terms" className="settings-btn secondary">
 View Terms
 </Link>
 </div>

 <div className="settings-card animate-in">
 <div className="settings-card-icon"><LuLockKeyhole size={24} /></div>
 <h3>Security & Privacy</h3>
 <p>
 Keep your account secure by updating your password regularly and 
 managing your privacy preferences.
 </p>
 <Link to="/editpassword" id="update-pass-link" className="settings-btn link-only">
 Change Password &rarr;
 </Link>
 </div>

 </div>
 </div>
 </div>
 );
}
