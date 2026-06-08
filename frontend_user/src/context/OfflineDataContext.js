/**
 * OfflineDataContext.js — CeylonRoam Offline-First Data Layer
 * ─────────────────────────────────────────────────────────────────────────
 * Mirrors the CurrencyContext 3-tier pattern for all four core data types:
 *
 *   Tier 1: localStorage  — instant, zero-network, survives browser restarts
 *   Tier 2: Network fetch — via Axios (intercepted by Workbox service worker)
 *   Tier 3: Stale data    — served from Tier 1 when network is unavailable
 *
 * Cache keys & TTLs:
 *   cr_packages_v1   — 6 hours   (public, rarely changes)
 *   cr_services_v1   — 6 hours   (public, rarely changes)
 *   cr_bookings_v1   — 30 min    (user-specific, changes after booking)
 *   cr_saved_v1      — 30 min    (user-specific, changes on save/unsave)
 *   cr_trips_v1      — 30 min    (user-specific, changes after AI plan)
 *
 * Exposed context value:
 *   packages      {Array}    — cached package listings
 *   services      {Array}    — cached service listings
 *   bookings      {Array}    — cached user bookings
 *   savedItems    {Array}    — cached user saved packages
 *   trips         {Array}    — cached AI trip plans
 *   isOffline     {Boolean}  — true when serving stale data
 *   dataSource    {Object}   — source per data type: "network"|"cached"|"empty"
 *   refreshData   {Function} — force-refresh a specific data type
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import API from '../api/axios';
import { AuthContext } from './AuthContext';

export const OfflineDataContext = createContext();

// ── Cache configuration ────────────────────────────────────────────────────
const CACHE_CONFIG = {
  packages: {
    key: 'cr_packages_v1',
    ttl: 6 * 60 * 60 * 1000,      // 6 hours
    endpoint: () => '/packages?listingType=Package',
    requiresAuth: false,
  },
  services: {
    key: 'cr_services_v1',
    ttl: 6 * 60 * 60 * 1000,      // 6 hours
    endpoint: () => '/packages?listingType=Service',
    requiresAuth: false,
  },
  bookings: {
    key: 'cr_bookings_v1',
    ttl: 30 * 60 * 1000,           // 30 minutes
    endpoint: (userId) => `/bookings/my-bookings?userId=${userId}`,
    requiresAuth: true,
  },
  saved: {
    key: 'cr_saved_v1',
    ttl: 30 * 60 * 1000,           // 30 minutes
    endpoint: (userId) => `/saved/user/${userId}`,
    requiresAuth: true,
  },
  trips: {
    key: 'cr_trips_v1',
    ttl: 30 * 60 * 1000,           // 30 minutes
    endpoint: (userId) => `/ai/user/${userId}`,
    requiresAuth: true,
  },
};

// ── localStorage helpers ───────────────────────────────────────────────────
function loadFromCache(key, ttl) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { data, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp < ttl) return data; // still fresh
    return data; // expired but return stale rather than null — offline safety
  } catch {
    return null;
  }
}

function isCacheFresh(key, ttl) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return false;
    const { timestamp } = JSON.parse(raw);
    return Date.now() - timestamp < ttl;
  } catch {
    return false;
  }
}

function saveToCache(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
  } catch (err) {
    // Storage quota exceeded — silently skip
    console.warn('[OfflineDataContext] localStorage write failed:', err.message);
  }
}

function clearUserCaches() {
  const userKeys = ['cr_bookings_v1', 'cr_saved_v1', 'cr_trips_v1'];
  userKeys.forEach((key) => localStorage.removeItem(key));
}

// ── Provider ───────────────────────────────────────────────────────────────
export const OfflineDataProvider = ({ children }) => {
  const { user } = useContext(AuthContext);

  const [packages, setPackages]   = useState([]);
  const [services, setServices]   = useState([]);
  const [bookings, setBookings]   = useState([]);
  const [savedItems, setSavedItems] = useState([]);
  const [trips, setTrips]         = useState([]);

  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [dataSource, setDataSource] = useState({
    packages: 'empty',
    services: 'empty',
    bookings: 'empty',
    saved:    'empty',
    trips:    'empty',
  });

  // Track loading state per data type
  const [loading, setLoading] = useState({
    packages: false,
    services: false,
    bookings: false,
    saved:    false,
    trips:    false,
  });

  const cancelledRef = useRef(false);

  // ── Network status listener ──────────────────────────────────────────────
  useEffect(() => {
    const handleOnline  = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online',  handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online',  handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // ── Generic fetch-with-fallback function ─────────────────────────────────
  const fetchWithFallback = useCallback(async (type, userId = null) => {
    const config = CACHE_CONFIG[type];
    if (!config) return;

    // Skip user-specific data if not logged in
    if (config.requiresAuth && !userId) return;

    const endpoint = config.requiresAuth
      ? config.endpoint(userId)
      : config.endpoint();

    const setState = {
      packages: setPackages,
      services: setServices,
      bookings: setBookings,
      saved:    setSavedItems,
      trips:    setTrips,
    }[type];

    // Tier 1: Serve from localStorage immediately (zero-wait)
    const cached = loadFromCache(config.key, config.ttl);
    if (cached && !cancelledRef.current) {
      setState(Array.isArray(cached) ? cached : []);
      setDataSource((prev) => ({ ...prev, [type]: 'cached' }));
    }

    // Skip network if cache is still fresh (avoid redundant requests)
    if (isCacheFresh(config.key, config.ttl) && cached) {
      return;
    }

    // Tier 2: Try network fetch (Axios → Workbox SW → real network)
    setLoading((prev) => ({ ...prev, [type]: true }));
    try {
      const res = await API.get(endpoint, { timeout: 8000 });
      const data = Array.isArray(res.data) ? res.data : [];

      if (!cancelledRef.current) {
        setState(data);
        saveToCache(config.key, data);
        setDataSource((prev) => ({ ...prev, [type]: 'network' }));
        setIsOffline(false);
      }
    } catch (err) {
      console.warn(`[OfflineDataContext] Network unavailable for "${type}":`, err.message);

      if (!cancelledRef.current) {
        // Tier 3: Serve stale localStorage data — already applied in Tier 1
        // If Tier 1 had nothing, we stay with empty array (no crash)
        if (!cached) {
          setState([]);
          setDataSource((prev) => ({ ...prev, [type]: 'empty' }));
        }
        // Mark as offline only if we cannot reach the network at all
        if (!navigator.onLine) {
          setIsOffline(true);
        }
      }
    } finally {
      if (!cancelledRef.current) {
        setLoading((prev) => ({ ...prev, [type]: false }));
      }
    }
  }, []);

  // ── Load public data (packages + services) on mount ──────────────────────
  useEffect(() => {
    cancelledRef.current = false;
    fetchWithFallback('packages');
    fetchWithFallback('services');
    return () => { cancelledRef.current = true; };
  }, [fetchWithFallback]);

  // ── Load user-specific data whenever the logged-in user changes ──────────
  useEffect(() => {
    if (!user) {
      // User logged out — clear state and stale user caches
      setBookings([]);
      setSavedItems([]);
      setTrips([]);
      setDataSource((prev) => ({
        ...prev,
        bookings: 'empty',
        saved:    'empty',
        trips:    'empty',
      }));
      clearUserCaches();
      // Also tell the service worker to purge its user cache
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        const channel = new MessageChannel();
        navigator.serviceWorker.controller.postMessage(
          { type: 'CLEAR_USER_CACHE' },
          [channel.port2]
        );
      }
      return;
    }

    const userId = user._id || user.id;
    cancelledRef.current = false;

    fetchWithFallback('bookings', userId);
    fetchWithFallback('saved',    userId);
    fetchWithFallback('trips',    userId);

    return () => { cancelledRef.current = true; };
  }, [user, fetchWithFallback]);

  // ── Public API: force-refresh a specific data type ───────────────────────
  const refreshData = useCallback(
    async (type) => {
      const userId = user ? (user._id || user.id) : null;
      // Invalidate cache so Tier 2 always hits the network
      const config = CACHE_CONFIG[type];
      if (config) {
        try {
          const raw = localStorage.getItem(config.key);
          if (raw) {
            const parsed = JSON.parse(raw);
            // Set timestamp to 0 to force expiry
            localStorage.setItem(
              config.key,
              JSON.stringify({ data: parsed.data, timestamp: 0 })
            );
          }
        } catch { /* ignore */ }
      }
      await fetchWithFallback(type, userId);
    },
    [user, fetchWithFallback]
  );

  // ── Sync saved/bookings after mutations (call from pages after POST) ──────
  const invalidateAndRefresh = useCallback(
    (type) => {
      const config = CACHE_CONFIG[type];
      if (config) localStorage.removeItem(config.key);
      refreshData(type);
    },
    [refreshData]
  );

  return (
    <OfflineDataContext.Provider
      value={{
        packages,
        services,
        bookings,
        savedItems,
        trips,
        isOffline,
        dataSource,
        loading,
        refreshData,
        invalidateAndRefresh,
      }}
    >
      {children}
    </OfflineDataContext.Provider>
  );
};

// ── Convenience hook ──────────────────────────────────────────────────────
export const useOfflineData = () => {
  const ctx = useContext(OfflineDataContext);
  if (!ctx) throw new Error('useOfflineData must be used inside OfflineDataProvider');
  return ctx;
};
