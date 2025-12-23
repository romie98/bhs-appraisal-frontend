// Admin API service
// Uses the same API base URL resolution as authService
import { apiFetch } from '../config/api'

/**
 * Get admin analytics summary
 * @returns {Promise<{
 *   total_users: number,
 *   total_actions: number,
 *   active_users_7d: number,
 *   active_users_30d: number
 * }>}
 */
export async function getAnalyticsSummary() {
  const response = await apiFetch('/admin/analytics/summary', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to fetch analytics summary' }))
    throw new Error(error.detail || `HTTP error! status: ${response.status}`)
  }

  return response.json()
}

/**
 * Get recent activity log
 * @returns {Promise<Array<{
 *   id: string,
 *   user_email: string,
 *   action: string,
 *   entity: string,
 *   created_at: string
 * }>>}
 */
export async function getRecentActivity() {
  const response = await apiFetch('/admin/analytics/recent-activity', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Failed to fetch recent activity' }))
    throw new Error(error.detail || `HTTP error! status: ${response.status}`)
  }

  return response.json()
}









