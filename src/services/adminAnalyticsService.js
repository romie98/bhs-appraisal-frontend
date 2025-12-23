//f Admin Analytics Service
// Uses existing API base URL resolution and automatic token injection via apiFetch

import { apiFetch } from '../config/api'

/**
 * Get admin statistics from backend
 * Requires ADMIN role and valid JWT token
 * @returns {Promise<{
 *   total_users: number,
 *   active_users_7d: number,
 *   total_evidence: number,
 *   ai_requests: number,
 *   storage_used_mb: number,
 *   errors_24h: number
 * }>}
 * @throws {Error} If token is missing or API request fails
 */
export async function getAdminStats() {
  // Check for token before making request
  const token = localStorage.getItem('auth_token')
  if (!token) {
    throw new Error('Authentication token is missing. Please login again.')
  }

  const response = await apiFetch('/admin/stats', {
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
    throw new Error(error.detail || `Failed to fetch admin stats: ${response.status}`)
  }

  return response.json()
}


