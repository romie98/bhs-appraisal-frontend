// Global API configuration
// Automatically convert HTTP to HTTPS to prevent mixed content errors
const normalizeUrl = (url) => {
  if (!url) return url;
  // Replace http:// with https:// to ensure secure connections
  return url.replace(/^http:\/\//, 'https://');
};

export const API_BASE_URL = normalizeUrl(__APP_API_URL__);


/**
 * Construct a full API URL from a path
 * @param {string} path - API endpoint path (e.g., "/auth/login")
 * @returns {string} Full URL (always HTTPS)
 */
export function apiUrl(path) {
  const fixed = path.startsWith("/") ? path : `/${path}`;
  const fullUrl = `${API_BASE_URL}${fixed}`;
  // Ensure the final URL is always HTTPS
  return normalizeUrl(fullUrl);
}


