// Global API configuration
// Automatically convert HTTP to HTTPS to prevent mixed content errors
const normalizeUrl = (url) => {
  if (!url || typeof url !== 'string') return url || '';
  // Replace http:// with https:// to ensure secure connections
  // This prevents mixed content errors when frontend is served over HTTPS
  return url.replace(/^http:\/\//, 'https://');
};

// Get API base URL from environment variable
function getApiBaseUrl() {
  // Priority 1: window.__APP_API_URL__ (set by index.html, runtime - used by Vercel)
  if (typeof window !== 'undefined' && window.__APP_API_URL__) {
    const url = String(window.__APP_API_URL__).trim();
    if (url && url !== '%VITE_API_BASE_URL%') {
      return normalizeUrl(url);
    }
  }
  // Priority 2: Environment variable (primary source)
  try {
    const envUrl = import.meta?.env?.VITE_API_BASE_URL;
    if (envUrl) {
      return normalizeUrl(String(envUrl).trim());
    }
  } catch (e) {
    // import.meta might not be available in some contexts
  }
  // Priority 3: __APP_API_URL__ (from vite.config.js, build-time replacement)
  try {
    const buildTimeUrl = typeof __APP_API_URL__ !== 'undefined' ? String(__APP_API_URL__).trim() : '';
    if (buildTimeUrl) {
      return normalizeUrl(buildTimeUrl);
    }
  } catch (e) {
    // __APP_API_URL__ might not be defined in some contexts
  }
  return '';
}

// Get API base URL (normalized to HTTPS)
// This is the base URL constant
export const apiUrl = getApiBaseUrl();

// Legacy export for compatibility
export const API_BASE_URL = apiUrl;

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
export function buildApiUrl(path) {
  const baseUrl = apiUrl;
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
  const baseUrl = apiUrl;
  if (!baseUrl) {
    throw new Error('API_BASE_URL is not configured');
  }
  const fixed = path.startsWith("/") ? path : `/${path}`;
  const url = normalizeUrl(`${baseUrl}${fixed}`);
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


