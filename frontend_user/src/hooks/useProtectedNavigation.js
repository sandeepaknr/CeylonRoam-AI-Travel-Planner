import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { AuthContext } from "../context/AuthContext";

export default function useProtectedNavigation() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  /**
   * Helper to protect routes/actions behind an auth wall.
   * If not logged in, alerts and redirects to /login.
   * @param {string | function} action - The route path to navigate to, or a callback function to execute.
   * @param {Event} [e] - Optional react event (to call preventDefault if needed)
   */
  const handleProtectedNavigation = (action, e) => {
    if (e && typeof e.preventDefault === "function") {
      e.preventDefault();
    }

    if (!user) {
      toast.error("🔑 Please log in to continue.");
      navigate("/login");
      return false;
    }

    if (typeof action === "string") {
      navigate(action);
    } else if (typeof action === "function") {
      action();
    }
    return true;
  };

  return handleProtectedNavigation;
}
