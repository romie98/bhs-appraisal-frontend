import { useState, useEffect } from 'react'
import { getPlan } from '../services/accountService'

/**
 * Custom hook to fetch account plan information
 * Fetches once on mount
 * @returns {{
 *   plan: {
 *     plan: string,
 *     status: string,
 *     features: string[]
 *   } | null,
 *   loading: boolean,
 *   error: Error | null
 * }}
 */
export function useAccountPlan() {
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    async function fetchPlan() {
      try {
        setLoading(true)
        setError(null)
        const data = await getPlan()
        
        if (isMounted) {
          setPlan(data)
          setLoading(false)
        }
      } catch (err) {
        if (isMounted) {
          setError(err)
          setLoading(false)
        }
      }
    }

    fetchPlan()

    // Cleanup function to prevent state updates if component unmounts
    return () => {
      isMounted = false
    }
  }, []) // Fetch once on mount

  return { plan, loading, error }
}







