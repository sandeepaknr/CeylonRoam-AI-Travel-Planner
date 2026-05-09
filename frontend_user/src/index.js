import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { CurrencyProvider } from "./context/CurrencyContext";
import { Workbox } from "workbox-window";
import toast from "react-hot-toast";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <AuthProvider>
    <CurrencyProvider>
      <App />
    </CurrencyProvider>
  </AuthProvider>
);

// Register the service worker for PWA and offline support
if ("serviceWorker" in navigator) {
  const wb = new Workbox("/service-worker.js");

  wb.addEventListener("installed", (event) => {
    if (!event.isUpdate) {
      // First-time install
      toast.success("App is ready for offline use!");
    } else {
      // Update available
      toast.success("New content is available; please refresh.");
    }
  });

  wb.register().catch((error) => {
    console.error("Service worker registration failed:", error);
  });
}
