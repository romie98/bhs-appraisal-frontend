// Global API configuration
// Get API base URL from window.__APP_API_URL__ (set by index.html)
// Fallback to environment variable if window variable is not set or is a placeholder
function getApiUrl() {
  let url = window.__APP_API_URL__ || '';
  
  // Check if it's still a placeholder or invalid
  if (!url || url === '%VITE_API_BASE_URL%' || url.includes('%')) {
    // Fallback to environment variable
    try {
      url = import.meta.env.VITE_API_BASE_URL || '';
    } catch (e) {
      url = '';
    }
  }
  
  return url;
}

const apiUrl = getApiUrl();

// Global callback for premium upgrade modal
// Set by PremiumUpgradeProvider
let premiumUpgradeCallback = null;

/**
 * Set the callback function to trigger premium upgrade modal
 * Called by PremiumUpgradeProvider on mount
 * @param {Function} callback - Function to call when premium upgrade is needed
 */
export function setPremiumUpgradeCallback(callback) {
  premiumUpgradeCallback = callback;
}

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
 * @returns {string} Full URL
 */
export function buildApiUrl(path) {
  if (!apiUrl) {
    console.warn('API_BASE_URL is not configured');
    return '';
  }
  // Remove leading slash from path if present, then add it back
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  // Remove trailing slash from base URL if present
  const cleanBase = apiUrl.endsWith("/") ? apiUrl.slice(0, -1) : apiUrl;
  const fullUrl = `${cleanBase}${cleanPath}`;
  return fullUrl;
}

/**
 * Make an authenticated API request with automatic token injection
 * Automatically adds Authorization header if token exists
 * Detects premium subscription required errors and triggers upgrade modal
 * @param {string} path - API endpoint path
 * @param {RequestInit} options - Fetch options
 * @returns {Promise<Response>}
 */
export async function apiFetch(path, options = {}) {
  const baseUrl = apiUrl;
  if (!baseUrl) {
    throw new Error('API_BASE_URL is not configured');
  }
  
  // Remove leading slash from path if present, then add it back
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  // Remove trailing slash from base URL if present
  const cleanBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const url = `${cleanBase}${cleanPath}`;
  
  const token = getAuthToken();
  
  // Log the full URL for debugging (only in development)
  if (import.meta.env.DEV) {
    console.log("FETCH:", url, options.method || 'GET');
  }
  
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
  
  const response = await fetch(url, fetchOptions);
  
  // Check for premium subscription required error
  if (response.status === 403) {
    try {
      // Clone response to read body without consuming it
      const clonedResponse = response.clone();
      const contentType = clonedResponse.headers.get('content-type') || '';
      
      if (contentType.includes('application/json')) {
        const errorData = await clonedResponse.json();
        if (errorData.detail === 'Premium subscription required') {
          // Trigger premium upgrade modal
          if (premiumUpgradeCallback) {
            premiumUpgradeCallback();
          }
        }
      }
    } catch (error) {
      // If we can't parse the error, continue with normal error handling
      console.warn('Failed to check premium error:', error);
    }
  }
  
  return response;
}

// Export apiUrl for direct use
export { apiUrl };
