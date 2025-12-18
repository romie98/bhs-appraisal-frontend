// Authentication service
// Supports both production (window.__APP_API_URL__) and local development (VITE_API_BASE_URL)

// Shared API base URL configuration
const API_BASE_URL =
  window.__APP_API_URL__ ||
  import.meta.env.VITE_API_BASE_URL;

// Validate API base URL is configured
if (!API_BASE_URL) {
  throw new Error("API_BASE_URL is not configured. Set window.__APP_API_URL__ or VITE_API_BASE_URL");
}

// Normalized base URL (remove trailing slash if present)
const cleanBase = API_BASE_URL.endsWith("/") ? API_BASE_URL.slice(0, -1) : API_BASE_URL;

/**
 * Login with email and password
 * @param {Object} data - Login data with email and password
 * @param {string} data.email - User email
 * @param {string} data.password - User password
 * @returns {Promise<{access_token: string, token_type: string}>}
 */
export async function login(data) {
  const { email, password } = data
  // Use OAuth2PasswordRequestForm format (form data)
  const formData = new URLSearchParams()
  formData.append("username", email) // OAuth2 uses "username" field for email
  formData.append("password", password)

  const response = await fetch(`${cleanBase}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Login failed" }))
    throw new Error(error.detail || `HTTP error! status: ${response.status}`)
  }

  return response.json()
}

/**
 * Login with email and password using JSON (alternative endpoint)
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<{access_token: string, token_type: string}>}
 */
export async function loginJson(email, password) {
  const response = await fetch(`${cleanBase}/auth/login-json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Login failed" }))
    throw new Error(error.detail || `HTTP error! status: ${response.status}`)
  }

  return response.json()
}

/**
 * Register a new user with email and password
 * @param {Object} data - Registration data
 * @param {string} data.email - User email
 * @param {string} data.password - User password
 * @returns {Promise<{access_token: string, token_type: string}>}
 */
export async function register(data) {
  const response = await fetch(`${cleanBase}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Registration failed" }))
    throw new Error(error.detail || `HTTP error! status: ${response.status}`)
  }

  return response.json()
}

/**
 * Sign up with email and password (alias for register)
 * @deprecated Use register() instead
 */
export async function signup(email, password) {
  return register({ email, password })
}

/**
 * Login with Google OAuth token
 * @param {string} googleToken - Google ID token from OAuth
 * @returns {Promise<{access_token: string, token_type: string}>}
 */
export async function loginWithGoogle(googleToken) {
  const response = await fetch(`${cleanBase}/auth/google`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ google_token: googleToken }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Google login failed" }))
    throw new Error(error.detail || `HTTP error! status: ${response.status}`)
  }

  return response.json()
}

/**
 * Get current user information (requires authentication)
 * Token is automatically included via apiFetch helper
 * @returns {Promise<{id: string, email: string, created_at: string}>}
 */
export async function getMe() {
  const token = localStorage.getItem("auth_token");
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(`${cleanBase}/auth/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    if (response.status === 401) {
      // Token is invalid, clear it
      localStorage.removeItem("auth_token");
      throw new Error("Authentication failed. Please login again.");
    }
    const error = await response.json().catch(() => ({ detail: "Failed to get user info" }))
    throw new Error(error.detail || `HTTP error! status: ${response.status}`)
  }

  return response.json()
}

/**
 * Get current user information (legacy function with explicit token)
 * @deprecated Use getMe() instead - token is handled automatically
 */
export async function getCurrentUser(token) {
  const response = await fetch(`${cleanBase}/auth/me`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Failed to get user info" }))
    throw new Error(error.detail || `HTTP error! status: ${response.status}`)
  }

  return response.json()
}


