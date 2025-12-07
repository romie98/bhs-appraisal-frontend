// Global API configuration
export const API_BASE_URL = __APP_API_URL__;


/**
 * Construct a full API URL from a path
 * @param {string} path - API endpoint path (e.g., "/auth/login")
 * @returns {string} Full URL
 */
export function apiUrl(path) {
  const fixed = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${fixed}`;
}


