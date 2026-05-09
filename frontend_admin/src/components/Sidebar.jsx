import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "./style/Sidebar.css";

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");
    navigate("/");
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>🛡️ ADMIN</h2>
      </div>
      <nav className="sidebar-nav">
        <ul>
          <li>
            <NavLink to="/dashboard" className={({ isActive }) => isActive ? "active-link" : ""}>
              <span>📊</span> Overview
            </NavLink>
          </li>
          <li>
            <NavLink to="/packagesfeatures" className={({ isActive }) => isActive ? "active-link" : ""}>
              <span>📦</span> Handle Packages Features
            </NavLink>
          </li>
          <li>
            <NavLink to="/businessesusermanagement" className={({ isActive }) => isActive ? "active-link" : ""}>
              <span>🏢</span> Businesses User Management
            </NavLink>
          </li>
          <li>
            <NavLink to="/usersmanagement" className={({ isActive }) => isActive ? "active-link" : ""}>
              <span>👥</span> Account Management 
            </NavLink>
          </li>
          <li>
            <NavLink to="/handlelistings" className={({ isActive }) => isActive ? "active-link" : ""}>
              <span>📋</span> Manage Listings
            </NavLink>
          </li>
        </ul>
      </nav>
      <button onClick={handleLogout} className="logout-btn">
        Logout 🚪
      </button>
    </aside>
  );
}