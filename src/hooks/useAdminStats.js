import { useState, useEffect } from 'react'
import { getAdminStats } from '../services/adminAnalyticsService'

/**
 * Custom hook to fetch admin statistics
 * Fetches once on mount
 * @returns {{
 *   stats: {
 *     total_users: number,
 *     active_users_7d: number,
 *     total_evidence: number,
 *     ai_requests: number,
 *     storage_used_mb: number,
 *     errors_24h: number
 *   } | null,
 *   loading: boolean,
 *   error: Error | null
 * }}
 */
export function useAdminStats() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function fetchStats() {
      try {
        setLoading(true)
        setError(null)
        const data = await getAdminStats()
        
        if (isMounted) {
          setStats(data)
          setLoading(false)
        }
      } catch (err) {
        if (isMounted) {
          setError(err)
          setLoading(false)
        }
      }
    }

    fetchStats()

    // Cleanup function to prevent state updates if component unmounts
    return () => {
      isMounted = false
    }
  }, []) // Fetch once on mount

  return { stats, loading, error }
}















