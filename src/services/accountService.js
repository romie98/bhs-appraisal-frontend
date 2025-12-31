// Account Service
// Handles plan management and account operations

import { apiFetch } from '../config/api'

/**
 * Get current user's plan information
 * @returns {Promise<{
 *   plan: string,
 *   status: string,
 *   features: string[]
 * }>}
 * @throws {Error} If API request fails
 */
export async function getPlan() {
  const token = localStorage.getItem('auth_token')
  if (!token) {
    throw new Error('Authentication token is missing. Please login again.')
  }

  const response = await apiFetch('/account/plan', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('auth_token')
      throw new Error('Authentication failed. Please login again.')
    }
    
    const error = await response.json().catch(() => ({ 
      detail: `HTTP error! status: ${response.status}` 
    }))
    throw new Error(error.detail || `Failed to fetch plan: ${response.status}`)
  }

  return response.json()
}

/**
 * Upgrade user's plan to Premium
 * @returns {Promise<{
 *   success: boolean,
 *   message?: string
 * }>}
 * @throws {Error} If API request fails
 */
export async function upgradePlan() {
  const token = localStorage.getItem('auth_token')
  if (!token) {
    throw new Error('Authentication token is missing. Please login again.')
  }

  const response = await apiFetch('/account/plan/upgrade', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('auth_token')
      throw new Error('Authentication failed. Please login again.')
    }
    
    const error = await response.json().catch(() => ({ 
      detail: `HTTP error! status: ${response.status}` 
    }))
    throw new Error(error.detail || `Failed to upgrade plan: ${response.status}`)
  }

  return response.json()
}

/**
 * Cancel user's Premium subscription
 * @returns {Promise<{
 *   success: boolean,
 *   message?: string
 * }>}
 * @throws {Error} If API request fails
 */
export async function cancelSubscription() {
  const token = localStorage.getItem('auth_token')
  if (!token) {
    throw new Error('Authentication token is missing. Please login again.')
  }

  const response = await apiFetch('/subscriptions/cancel', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('auth_token')
      throw new Error('Authentication failed. Please login again.')
    }
    
    const error = await response.json().catch(() => ({ 
      detail: `HTTP error! status: ${response.status}` 
    }))
    throw new Error(error.detail || `Failed to cancel subscription: ${response.status}`)
  }

  return response.json()
}

/**
 * Get Stripe billing portal URL for current user
 * @returns {Promise<{ portal_url: string }>}
 * @throws {Error} If API request fails
 */
export async function getBillingPortalUrl() {
  const token = localStorage.getItem('auth_token')
  if (!token) {
    throw new Error('Authentication token is missing. Please login again.')
  }

  const response = await apiFetch('/subscriptions/billing-portal', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
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











