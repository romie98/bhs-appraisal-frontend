// Admin Activity Service
// Uses existing API base URL resolution and automatic token injection via apiFetch

import { apiFetch } from '../config/api'

/**
 * Get admin activity log from backend
 * Requires ADMIN role and valid JWT token
 * @returns {Promise<Array<{
 *   id: string,
 *   user_email: string,
 *   action: string,
 *   created_at: string,
 *   metadata?: object
 * }>>}
 * @throws {Error} If token is missing or API request fails
 */
export async function getAdminActivity() {
  // Check for token before making request
  const token = localStorage.getItem('auth_token')
  if (!token) {
    throw new Error('Authentication token is missing. Please login again.')
  }

  const response = await apiFetch('/admin/activity', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    // Handle specific error cases
    if (response.status === 403) {
      throw new Error('Admin access required')
    }
    if (response.status === 401) {
      // Token is invalid, clear it
      localStorage.removeItem('auth_token')
      throw new Error('Authentication failed. Please login again.')
    }
    
    // Try to get error message from response
    const error = await response.json().catch(() => ({ 
      detail: `HTTP error! status: ${response.status}` 
    }))
    throw new Error(error.detail || `Failed to fetch admin activity: ${response.status}`)
  }

  return response.json()
}









