// Authentication service
import { apiUrl } from "../config/api"

/**
 * Login with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<{access_token: string, token_type: string}>}
 */
export async function login(email, password) {
  // Use OAuth2PasswordRequestForm format (form data)
  const data = new URLSearchParams()
  data.append("username", email) // OAuth2 uses "username" field for email
  data.append("password", password)

  const response = await fetch(apiUrl("/auth/login"), {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: data,
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
  const response = await fetch(apiUrl("/auth/login-json"), {
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
 * Sign up with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<{access_token: string, token_type: string}>}
 */
export async function signup(email, password) {
  const response = await fetch(apiUrl("/auth/signup"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Signup failed" }))
    throw new Error(error.detail || `HTTP error! status: ${response.status}`)
  }

  return response.json()
}

/**
 * Login with Google OAuth token
 * @param {string} googleToken - Google ID token from OAuth
 * @returns {Promise<{access_token: string, token_type: string}>}
 */
export async function loginWithGoogle(googleToken) {
  const response = await fetch(apiUrl("/auth/google"), {
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
 * @param {string} token - JWT access token
 * @returns {Promise<{id: string, email: string, created_at: string}>}
 */
export async function getCurrentUser(token) {
  const response = await fetch(apiUrl("/auth/me"), {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Failed to get user info" }))
    throw new Error(error.detail || `HTTP error! status: ${response.status}`)
  }

  return response.json()
}


