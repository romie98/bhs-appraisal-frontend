// Global API configuration
// Automatically convert HTTP to HTTPS to prevent mixed content errors
const normalizeUrl = (url) => {
  if (!url || typeof url !== 'string') return url || '';
  // Replace http:// with https:// to ensure secure connections
  // This prevents mixed content errors when frontend is served over HTTPS
  return url.replace(/^http:\/\//, 'https://');
};

// Get API URL from multiple sources (runtime priority)
function getApiBaseUrl() {
  // Priority 1: window.__APP_API_URL__ (set by index.html, runtime - used by Vercel)
  if (typeof window !== 'undefined' && window.__APP_API_URL__) {
    const url = String(window.__APP_API_URL__).trim();
    if (url && url !== '%VITE_API_BASE_URL%') {
      return normalizeUrl(url);
    }
  }
  // Priority 2: __APP_API_URL__ (from vite.config.js, build-time replacement)
  // Vite replaces this with the actual string value at build time
  try {
    const buildTimeUrl = typeof __APP_API_URL__ !== 'undefined' ? String(__APP_API_URL__).trim() : '';
    if (buildTimeUrl) {
      return normalizeUrl(buildTimeUrl);
    }
  } catch (e) {
    // __APP_API_URL__ might not be defined in some contexts
  }
  // Fallback: environment variable (for development)
  try {
    if (import.meta?.env?.VITE_API_BASE_URL) {
      return normalizeUrl(import.meta.env.VITE_API_BASE_URL);
    }
  } catch (e) {
    // import.meta might not be available in some contexts
  }
  return '';
}

// Get API base URL (normalized to HTTPS)
// Note: This is computed once at module load, but apiUrl() recomputes at runtime
export const API_BASE_URL = getApiBaseUrl();

/**
 * Get authentication token from localStorage
 * @returns {string|null} The auth token or null
 */
function getAuthToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

/**
 * Construct a full API URL from a path
 * @param {string} path - API endpoint path (e.g., "/auth/login")
 * @returns {string} Full URL (always HTTPS)
 */
export function apiUrl(path) {
  // Get fresh API base URL at runtime to handle dynamic changes
  // This ensures window.__APP_API_URL__ is checked on every call
  const baseUrl = getApiBaseUrl();
  if (!baseUrl) {
    console.warn('API_BASE_URL is not configured');
    return '';
  }
  const fixed = path.startsWith("/") ? path : `/${path}`;
  const fullUrl = `${baseUrl}${fixed}`;
  // Ensure the final URL is always HTTPS (double-check normalization)
  return normalizeUrl(fullUrl);
}

/**
 * Make an authenticated API request with automatic token injection
 * Automatically adds Authorization header if token exists
 * @param {string} path - API endpoint path
 * @param {RequestInit} options - Fetch options
 * @returns {Promise<Response>}
 */
export async function apiFetch(path, options = {}) {
  const url = apiUrl(path);
  const token = getAuthToken();
  
  // Prepare headers
  const headers = new Headers(options.headers || {});
  
  // Add Authorization header if token exists and not already set
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  // Merge with existing options
  const fetchOptions = {
    ...options,
    headers,
  };
  
  return fetch(url, fetchOptions);
}


