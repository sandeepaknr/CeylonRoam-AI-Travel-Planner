/* eslint-disable no-restricted-globals */
/**
 * CeylonRoam Service Worker
 * ──────────────────────────────────────────────────────────────────────────
 * Caching strategy overview:
 *
 *  ┌─────────────────────────────┬────────────────────────┬─────────────┐
 *  │ Resource                    │ Strategy               │ TTL / Max   │
 *  ├─────────────────────────────┼────────────────────────┼─────────────┤
 *  │ App shell (JS/CSS/HTML)     │ Precache (Workbox)     │ indefinite  │
 *  │ Backend images (/uploads/)  │ CacheFirst             │ 30 days     │
 *  │ Public API (packages, cats) │ StaleWhileRevalidate   │ 6 hours     │
 *  │ User API (bookings, saved,  │                        │             │
 *  │   trips)                    │ NetworkFirst           │ 7 days      │
 *  └─────────────────────────────┴────────────────────────┴─────────────┘
 *
 * Cache names:
 *   ceylonroam-images-v1        — backend uploaded images
 *   ceylonroam-public-api-v1    — packages, categories, locations, services
 *   ceylonroam-user-api-v1      — bookings, saved packages, AI trip plans
 */

import { clientsClaim } from 'workbox-core';
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';
import {
  StaleWhileRevalidate,
  NetworkFirst,
  CacheFirst,
} from 'workbox-strategies';

clientsClaim();

// ── Precache app shell ────────────────────────────────────────────────────
precacheAndRoute(self.__WB_MANIFEST || []);

// ── App Shell (SPA navigation) ────────────────────────────────────────────
const fileExtensionRegexp = new RegExp('/[^/?]+\\.[^/]+$');
registerRoute(
  ({ request, url }) => {
    if (request.mode !== 'navigate') return false;
    if (url.pathname.startsWith('/_')) return false;
    if (url.pathname.match(fileExtensionRegexp)) return false;
    return true;
  },
  createHandlerBoundToURL(process.env.PUBLIC_URL + '/index.html')
);

// ── Backend uploaded images  ──────────────────────────────────────────────
// Matches: http://localhost:5000/uploads/... (dev) and /uploads/... (prod)
// Strategy: CacheFirst — images rarely change; serve from cache instantly.
registerRoute(
  ({ url }) =>
    url.pathname.startsWith('/uploads/') ||
    (url.port === '5000' && url.pathname.startsWith('/uploads/')),
  new CacheFirst({
    cacheName: 'ceylonroam-images-v1',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 200,          // max 200 images in cache
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        purgeOnQuotaError: true,
      }),
    ],
  })
);

// ── Public API — Packages, Services, Categories, Locations ───────────────
// These are read-only for regular users and change infrequently.
// Strategy: StaleWhileRevalidate — serve cached copy instantly while
// refreshing in the background. Users always see data even offline.
const PUBLIC_API_PATTERNS = [
  '/api/packages',
  '/api/locations',
  '/api/features',
  '/api/reviews',
];

registerRoute(
  ({ request, url }) => {
    if (request.method !== 'GET') return false;

    const isBackendHost =
      url.port === '5000' ||
      url.hostname === 'localhost' ||
      url.pathname.startsWith('/api/');

    if (!isBackendHost) return false;

    return PUBLIC_API_PATTERNS.some((pattern) =>
      url.pathname.includes(pattern)
    );
  },
  new StaleWhileRevalidate({
    cacheName: 'ceylonroam-public-api-v1',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 6 * 60 * 60, // 6 hours
        purgeOnQuotaError: true,
      }),
    ],
  })
);

// ── User-specific API — Bookings, Saved, AI Trips ────────────────────────
// Personalised data — must be fresh, but serve stale copy when offline.
// Strategy: NetworkFirst with 5-second timeout before falling back to cache.
const USER_API_PATTERNS = [
  '/api/bookings',
  '/api/saved',
  '/api/ai',
  '/api/seller-bookings',
  '/api/user',
  '/api/payments',
];

registerRoute(
  ({ request, url }) => {
    if (request.method !== 'GET') return false;

    const isBackendHost =
      url.port === '5000' ||
      url.hostname === 'localhost' ||
      url.pathname.startsWith('/api/');

    if (!isBackendHost) return false;

    return USER_API_PATTERNS.some((pattern) =>
      url.pathname.includes(pattern)
    );
  },
  new NetworkFirst({
    cacheName: 'ceylonroam-user-api-v1',
    networkTimeoutSeconds: 5,    // fall back to cache after 5 s
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 150,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
        purgeOnQuotaError: true,
      }),
    ],
  })
);

// ── Non-GET requests — always network only ────────────────────────────────
// POST/PUT/DELETE must never be served from cache (mutations).
// We do not register a route — Workbox falls through to the network by default.

// ── SW lifecycle messages ─────────────────────────────────────────────────
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  // Allow pages to request a named-cache purge (e.g. after logout)
  if (event.data && event.data.type === 'CLEAR_USER_CACHE') {
    caches.delete('ceylonroam-user-api-v1').then(() => {
      event.ports?.[0]?.postMessage({ success: true });
    });
  }
});
