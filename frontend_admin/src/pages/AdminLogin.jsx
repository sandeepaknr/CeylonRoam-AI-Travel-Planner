import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import "./style/AdminLogin.css";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("🛡️ Verifying admin credentials…");
    try {
      const res = await axios.post("http://localhost:5000/api/auth/admin/login", { email, password });

      // Token එක Save කිරීම
      localStorage.setItem("adminToken", res.data.token);
      localStorage.setItem("adminData", JSON.stringify(res.data.user));

      toast.success("✅ Access granted! Redirecting to dashboard…", { id: toastId });
      setTimeout(() => { window.location.href = "/dashboard"; }, 1000); // Brief delay so success toast is visible
    } catch (err) {
      toast.error(err.response?.data?.message || "❌ Login failed! Check your credentials.", { id: toastId });
    }
  };

  return (
    <div className="login-container">
      <form className="login-box" onSubmit={handleLogin}>
        <h2>🛡️ Admin Portal</h2>
        <p>Please enter your administrator credentials</p>
        
        <div className="input-field">
          <label>Email Address</label>
          <input type="email" onChange={(e) => setEmail(e.target.value)} required />
        </div>

        <div className="input-field">
          <label>Password</label>
          <input type="password" onChange={(e) => setPassword(e.target.value)} required />
        </div>

        <button type="submit" className="login-btn">Secure Login</button>
      </form>
    </div>
  );
}