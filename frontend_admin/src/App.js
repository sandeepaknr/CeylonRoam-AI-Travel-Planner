import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import Sidebar from "./components/Sidebar"; 
import "./App.css";
import ManageMasterData from "./pages/FeaturesManagement";
import UserManagement from "./pages/UserManagement";
import BusinessManagement from "./pages/BusinessManagement";
import AdminBusinessRequests from "./pages/AdminBusinessRequests";
import HandleListings from "./pages/HandleListings";

const AdminLayout = () => {
  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="main-content">
        <Outlet /> 
      </div>
    </div>
  );
};

function App() {
  const [isAdmin, setIsAdmin] = useState(!!localStorage.getItem("adminToken"));

  useEffect(() => {
    const handleStorageChange = () => {
      setIsAdmin(!!localStorage.getItem("adminToken"));
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <Router>
      {/* ── react-hot-toast: Admin notification hub ── */}
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={10}
        toastOptions={{
          duration: 4000,
          style: {
            background: "rgba(15, 23, 42, 0.96)",
            backdropFilter: "blur(16px)",
            color: "#f1f5f9",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "12px",
            padding: "13px 17px",
            fontSize: "14px",
            fontFamily: "'Inter', sans-serif",
            boxShadow: "0 8px 32px rgba(0,0,0,0.45)",
            maxWidth: "360px",
          },
          success: {
            duration: 3500,
            iconTheme: { primary: "#10b981", secondary: "#fff" },
            style: {
              background: "rgba(15, 23, 42, 0.96)",
              color: "#f1f5f9",
              border: "1px solid rgba(16, 185, 129, 0.4)",
              borderRadius: "12px",
              padding: "13px 17px",
              fontFamily: "'Inter', sans-serif",
              boxShadow: "0 8px 32px rgba(16, 185, 129, 0.2)",
            },
          },
          error: {
            duration: 5000,
            iconTheme: { primary: "#ef4444", secondary: "#fff" },
            style: {
              background: "rgba(15, 23, 42, 0.96)",
              color: "#f1f5f9",
              border: "1px solid rgba(239, 68, 68, 0.4)",
              borderRadius: "12px",
              padding: "13px 17px",
              fontFamily: "'Inter', sans-serif",
              boxShadow: "0 8px 32px rgba(239, 68, 68, 0.2)",
            },
          },
        }}
      />
      <Routes>
        <Route path="/" element={<AdminLogin />} />

        <Route element={isAdmin ? <AdminLayout /> : <Navigate to="/" />}>
          <Route path="/dashboard" element={<AdminDashboard />} />
          <Route path="/packagesfeatures" element={<ManageMasterData />} />
          <Route path="/businessesusermanagement" element={<BusinessManagement />} />
          <Route path="/usersmanagement" element={<UserManagement />} />
          <Route path="/businessrequests" element={<AdminBusinessRequests />} />
          <Route path="/handlelistings"   element={<HandleListings />} />
        </Route>

      </Routes>
    </Router>
  );
}

export default App;