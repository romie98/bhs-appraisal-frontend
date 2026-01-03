// Admin User Management Service
// Handles user management operations for admins

import { apiFetch } from '../config/api'

/**
 * Get all users (admin only)
 * @returns {Promise<Array<{
 *   id: string,
 *   email: string,
 *   subscription_plan: string,
 *   subscription_status: string,
 *   subscription_source: string,
 *   premium_expires_at?: string,
 *   created_at: string
 * }>>}
 * @throws {Error} If API request fails
 */
export async function getUsers() {
  const token = localStorage.getItem('auth_token')
  if (!token) {
    throw new Error('Authentication token is missing. Please login again.')
  }

  const response = await apiFetch('/admin/users', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('Admin access required')
    }
    if (response.status === 401) {
      localStorage.removeItem('auth_token')
      throw new Error('Authentication failed. Please login again.')
    }
    
    const error = await response.json().catch(() => ({ 
      detail: `HTTP error! status: ${response.status}` 
    }))
    throw new Error(error.detail || `Failed to fetch users: ${response.status}`)
  }

  return response.json()
}

/**
 * Get user details by ID (admin only)
 * @param {string} userId - User ID
 * @returns {Promise<{
 *   id: string,
 *   email: string,
 *   subscription_plan: string,
 *   subscription_status: string,
 *   subscription_source: string,
 *   premium_expires_at?: string,
 *   stripe_customer_id?: string,
 *   created_at: string
 * }>}
 * @throws {Error} If API request fails
 */
export async function getUserDetails(userId) {
  const token = localStorage.getItem('auth_token')
  if (!token) {
    throw new Error('Authentication token is missing. Please login again.')
  }

  const response = await apiFetch(`/admin/users/${userId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('Admin access required')
    }
    if (response.status === 401) {
      localStorage.removeItem('auth_token')
      throw new Error('Authentication failed. Please login again.')
    }
    
    const error = await response.json().catch(() => ({ 
      detail: `HTTP error! status: ${response.status}` 
    }))
    throw new Error(error.detail || `Failed to fetch user details: ${response.status}`)
  }

  return response.json()
}

/**
 * Grant premium access to a user (admin only)
 * @param {string} userId - User ID
 * @param {Object} options - Grant options
 * @param {string} options.duration - Duration: '7', '14', '30', 'custom', 'unlimited'
 * @param {string} [options.expires_at] - Custom expiration date (ISO string) - required if duration is 'custom'
 * @param {string} [options.notes] - Admin notes (optional)
 * @returns {Promise<{ success: boolean, message?: string }>}
 * @throws {Error} If API request fails
 */
export async function grantPremium(userId, options) {
  const token = localStorage.getItem('auth_token')
  if (!token) {
    throw new Error('Authentication token is missing. Please login again.')
  }

  const response = await apiFetch(`/admin/users/${userId}/grant-premium`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(options),
  })

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('Admin access required')
    }
    if (response.status === 401) {
      localStorage.removeItem('auth_token')
      throw new Error('Authentication failed. Please login again.')
    }
    
    const error = await response.json().catch(() => ({ 
      detail: `HTTP error! status: ${response.status}` 
    }))
    throw new Error(error.detail || `Failed to grant premium: ${response.status}`)
  }

  return response.json()
}

/**
 * Revoke premium access from a user (admin only)
 * @param {string} userId - User ID
 * @returns {Promise<{ success: boolean, message?: string }>}
 * @throws {Error} If API request fails
 */
export async function revokePremium(userId) {
  const token = localStorage.getItem('auth_token')
  if (!token) {
    throw new Error('Authentication token is missing. Please login again.')
  }

  const response = await apiFetch(`/admin/users/${userId}/revoke-premium`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('Admin access required')
    }
    if (response.status === 401) {
      localStorage.removeItem('auth_token')
      throw new Error('Authentication failed. Please login again.')
    }
    
    const error = await response.json().catch(() => ({ 
      detail: `HTTP error! status: ${response.status}` 
    }))
    throw new Error(error.detail || `Failed to revoke premium: ${response.status}`)
  }

  return response.json()
}

/**
 * Get Stripe billing portal URL for a user (admin only, read-only)
 * @param {string} userId - User ID
 * @returns {Promise<{ portal_url: string }>}
 * @throws {Error} If API request fails
 */
export async function getBillingPortalUrl(userId) {
  const token = localStorage.getItem('auth_token')
  if (!token) {
    throw new Error('Authentication token is missing. Please login again.')
  }

  const response = await apiFetch(`/admin/users/${userId}/billing-portal`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('Admin access required')
    }
    if (response.status === 401) {
      localStorage.removeItem('auth_token')
      throw new Error('Authentication failed. Please login again.')
    }
    
    const error = await response.json().catch(() => ({ 
      detail: `HTTP error! status: ${response.status}` 
    }))
    throw new Error(error.detail || `Failed to get billing portal URL: ${response.status}`)
  }

  return response.json()
}


