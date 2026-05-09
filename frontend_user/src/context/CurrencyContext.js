import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";

export const CurrencyContext = createContext();

// ── Supported currencies ──────────────────────────────────
export const SUPPORTED_CURRENCIES = [
  { code: "LKR", symbol: "Rs",  label: "Sri Lankan Rupee"  },
  { code: "USD", symbol: "$",   label: "US Dollar"          },
  { code: "EUR", symbol: "€",   label: "Euro"               },
  { code: "GBP", symbol: "£",   label: "British Pound"      },
  { code: "AUD", symbol: "A$",  label: "Australian Dollar"  },
  { code: "CAD", symbol: "C$",  label: "Canadian Dollar"    },
  { code: "INR", symbol: "₹",   label: "Indian Rupee"       },
];

const CURRENCY_SYMBOLS = Object.fromEntries(
  SUPPORTED_CURRENCIES.map(c => [c.code, c.symbol])
);

// ── Offline-first rate pipeline constants ─────────────────
const CACHE_KEY    = "cr_rates_v2";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 h

// its a new api (its base on lkr)
const RATES_API    = "https://open.er-api.com/v6/latest/LKR";

// Static fallback rates (LKR base, ~2025 approximations)
const STATIC_RATES = {
  LKR: 1,
  USD: 0.00335,
  EUR: 0.00310,
  GBP: 0.00264,
  AUD: 0.00521,
  CAD: 0.00458,
  INR: 0.2800,
};

// ── Cache helpers ─────────────────────────────────────────
function loadCachedRates() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { rates, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp < CACHE_TTL_MS) return rates; // still fresh
    return null; // expired
  } catch {
    return null;
  }
}

function saveCachedRates(rates) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ rates, timestamp: Date.now() }));
  } catch { /* storage quota exceeded — silently skip */ }
}

// get the data from new api function
async function fetchLiveRates() {
  const res  = await fetch(RATES_API, { signal: AbortSignal.timeout(6000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  
  if (data && data.rates) {
    // open.er-api its give directly LKR: 1 include and other rates
    return data.rates;
  }
  throw new Error("Invalid response format from Exchange API");
}

// ── Provider ──────────────────────────────────────────────
export const CurrencyProvider = ({ children }) => {
  const { user } = useContext(AuthContext);

  // Login-detected currency (read-only, kept for backward-compat)
  const userCurrency = user?.currency || "LKR";

  // Manually selected currency — persisted across sessions
  const [selectedCurrency, setSelectedCurrency] = useState(
    () => localStorage.getItem("cr_selected_currency") || userCurrency
  );
  useEffect(() => {
    localStorage.setItem("cr_selected_currency", selectedCurrency);
  }, [selectedCurrency]);

  // Start with static rates so the UI is never blank on first render
  const [rates,        setRates]        = useState(STATIC_RATES);
  const [loadingRates, setLoadingRates] = useState(true);
  const [rateSource,   setRateSource]   = useState("static"); // "live"|"cached"|"static"

  useEffect(() => {
    let cancelled = false;

    const initRates = async () => {
      // 1️⃣  Check localStorage first (zero network, instant)
      const cached = loadCachedRates();
      if (cached && !cancelled) {
        setRates(cached);
        setRateSource("cached");
        setLoadingRates(false);
      }

      // 2️⃣  Always try live fetch to stay current
      try {
        const live = await fetchLiveRates();
        if (!cancelled) {
          setRates(live);
          setRateSource("live"); // its have internet connection and live data
          saveCachedRates(live);
        }
      } catch (err) {
        console.warn("[CurrencyContext] Live rates unavailable:", err.message);
        // 3️⃣  Fall back: cached already applied above; if not available use STATIC_RATES
        if (!cached && !cancelled) {
          setRates(STATIC_RATES);
          setRateSource("static"); // its don't have internet connection and use static data which is hard coded in the app
        }
      } finally {
        if (!cancelled) setLoadingRates(false);
      }
    };

    initRates();
    return () => { cancelled = true; };
  }, []);

  const getRate = (currency) => rates[currency] ?? STATIC_RATES[currency] ?? 1;

  // LKR → selectedCurrency formatted string
  const formatPrice = (amountInLKR) => {
    const rawVal  = typeof amountInLKR === "string" ? amountInLKR.replace(/,/g, "") : amountInLKR;
    const num     = Number(rawVal);
    if (isNaN(num)) return `${CURRENCY_SYMBOLS[selectedCurrency] || selectedCurrency} 0`;
    const converted = num * getRate(selectedCurrency);
    const symbol    = CURRENCY_SYMBOLS[selectedCurrency] || selectedCurrency;
    return `${symbol} ${converted.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  // selectedCurrency → LKR  (booking API always receives raw LKR — untouched)
  const convertToLKR = (amountInLocal) => {
    const rawVal = typeof amountInLocal === "string" ? amountInLocal.replace(/,/g, "") : amountInLocal;
    const num    = Number(rawVal);
    if (isNaN(num)) return 0;
    const rate = getRate(selectedCurrency);
    return rate > 0 ? num / rate : num;
  };

  return (
    <CurrencyContext.Provider value={{
      userCurrency,           // login-detected (read-only)
      selectedCurrency,       // manually chosen by user
      setSelectedCurrency,    // setter — used by sidebar selectors
      formatPrice,            // LKR → selectedCurrency formatted string
      convertToLKR,           // selectedCurrency → LKR
      currencySymbol: CURRENCY_SYMBOLS[selectedCurrency] || selectedCurrency,
      loadingRates,
      rateSource,             // "live" | "cached" | "static"
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};