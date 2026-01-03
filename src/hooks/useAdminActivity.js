import { useState, useEffect } from 'react'
import { getAdminActivity } from '../services/adminActivityService'

/**
 * Custom hook to fetch admin activity log
 * Fetches once on mount
 * Limits to 25 events
 * @returns {{
 *   events: Array<{
 *     id: string,
 *     user_email: string,
 *     action: string,
 *     created_at: string,
 *     metadata?: object
 *   }> | null,
 *   loading: boolean,
 *   error: Error | null
 * }}
 */
export function useAdminActivity() {
  const [events, setEvents] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function fetchActivity() {
      try {
        setLoading(true)
        setError(null)
        const data = await getAdminActivity()
        
        if (isMounted) {
          // Limit to 25 events as specified
          const limitedData = Array.isArray(data) ? data.slice(0, 25) : []
          setEvents(limitedData)
          setLoading(false)
        }
      } catch (err) {
        if (isMounted) {
          setError(err)
          setLoading(false)
        }
      }
    }

    fetchActivity()

    // Cleanup function to prevent state updates if component unmounts
    return () => {
      isMounted = false
    }
  }, []) // Fetch once on mount

  return { events, loading, error }
}













