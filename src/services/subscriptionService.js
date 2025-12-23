// Subscription Service
// Handles Stripe checkout session creation

import { apiFetch } from '../config/api'

/**
 * Create a Stripe checkout session for premium upgrade
 * @returns {Promise<{ checkout_url: string }>}
 * @throws {Error} If API request fails
 */
export async function createCheckoutSession() {
  const token = localStorage.getItem('auth_token')
  if (!token) {
    throw new Error('Authentication token is missing. Please login again.')
  }

  const response = await apiFetch('/subscriptions/create-checkout-session', {
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
    throw new Error(error.detail || `Failed to create checkout session: ${response.status}`)
  }

  return response.json()
}
