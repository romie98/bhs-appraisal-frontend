import { useAuth } from '../context/AuthContext'
import { hasFeature, getUserPlan, isPremiumUser } from '../config/features'

/**
 * Custom hook to check feature access for current user
 * @param {string} featureKey - Feature key to check (from FEATURE_KEYS)
 * @returns {{ hasAccess: boolean, plan: string, isPremium: boolean }}
 */
export function useFeature(featureKey) {
  const { user } = useAuth()
  
  return {
    hasAccess: hasFeature(user, featureKey),
    plan: getUserPlan(user),
    isPremium: isPremiumUser(user),
  }
}

/**
 * Custom hook to get current user's subscription info
 * @returns {{ plan: string, isPremium: boolean, user: Object|null }}
 */
export function useSubscription() {
  const { user } = useAuth()
  
  return {
    plan: getUserPlan(user),
    isPremium: isPremiumUser(user),
    user,
  }
}











