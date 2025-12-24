import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { X, Sparkles, Loader2 } from 'lucide-react'
import { usePremiumUpgrade } from '../context/PremiumUpgradeContext'
import { createCheckoutSession } from '../services/subscriptionService'

/**
 * UpgradePrompt - Modal component shown when user hits a premium feature
 * Displays upgrade options and handles Stripe checkout redirect
 */
export function UpgradePrompt() {
  const { showUpgradeModal, closeUpgradeModal } = usePremiumUpgrade()
  const [loading, setLoading] = useState(false)
  const location = useLocation()

  // Close modal on navigation (but not during upgrade process)
  useEffect(() => {
    if (showUpgradeModal && !loading) {
      closeUpgradeModal()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

  if (!showUpgradeModal) return null

  const handleUpgrade = async () => {
    setLoading(true)
    try {
      const { checkout_url } = await createCheckoutSession()
      // Redirect to Stripe Checkout
      window.location.href = checkout_url
    } catch (error) {
      console.error('Failed to create checkout session:', error)
      alert(error.message || 'Failed to start upgrade process. Please try again.')
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      closeUpgradeModal()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Sparkles className="w-6 h-6 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              Upgrade to Premium
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-700 mb-6">
            This feature is available on Premium plans.
          </p>

          {/* Benefits list */}
          <div className="mb-6 space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full" />
              <span>Unlimited uploads</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full" />
              <span>All premium features</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full" />
              <span>Priority support</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleUpgrade}
              disabled={loading}
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>Upgrade Now</span>
              )}
            </button>
            <button
              onClick={handleClose}
              disabled={loading}
              className="px-6 py-3 text-gray-700 hover:bg-gray-100 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Not now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UpgradePrompt


