import { useState } from 'react'
import { useAccountPlan } from '../hooks/useAccountPlan'
import { upgradePlan, cancelPlan } from '../services/accountService'
import { 
  CreditCard, 
  User, 
  Shield, 
  Sparkles,
  Loader2
} from 'lucide-react'
import { Toast } from '../components/Toast'

function Account() {
  const { plan: planData, loading, error } = useAccountPlan()
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' })
  const [processing, setProcessing] = useState(false)

  // Get plan name from API response or default to 'free'
  const planName = planData?.plan?.toLowerCase() || 'free'
  const isPremium = planName === 'premium'

  // Format plan name for display
  const formatPlanName = (name) => {
    if (!name) return 'Free'
    return name.charAt(0).toUpperCase() + name.slice(1)
  }

  // Get plan badge color (FREE → gray, PREMIUM → gold)
  const getPlanBadgeColor = (name) => {
    const normalized = name?.toLowerCase()
    if (normalized === 'premium') {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
    return 'bg-gray-100 text-gray-800 border-gray-200'
  }

  // Get plan description
  const getPlanDescription = (name) => {
    const normalized = name?.toLowerCase()
    if (normalized === 'premium') {
      return 'Unlimited uploads + all features'
    }
    return '3 uploads per GP subsection'
  }

  // Handle upgrade button click
  const handleUpgrade = async () => {
    setProcessing(true)
    try {
      await upgradePlan()
      setToast({
        show: true,
        message: 'Billing not enabled yet',
        type: 'info'
      })
    } catch (error) {
      setToast({
        show: true,
        message: error.message || 'Failed to upgrade plan',
        type: 'error'
      })
    } finally {
      setProcessing(false)
    }
  }

  // Handle cancel button click
  const handleCancel = async () => {
    setProcessing(true)
    try {
      await cancelPlan()
      setToast({
        show: true,
        message: 'Billing not enabled yet',
        type: 'info'
      })
    } catch (error) {
      setToast({
        show: true,
        message: error.message || 'Failed to cancel plan',
        type: 'error'
      })
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Toast Notification */}
      <Toast
        show={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Account</h1>
        <p className="text-gray-600">Manage your plan and account settings</p>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Plan & Billing Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-100 rounded-lg">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Plan & Billing</h2>
              <p className="text-sm text-gray-600">Manage your subscription</p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error.message || 'Failed to load plan information'}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Current Plan */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Current Plan
                </label>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getPlanBadgeColor(planName)}`}>
                      {formatPlanName(planName)}
                    </span>
                    {isPremium && (
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Premium Features
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Plan Description */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Plan Description
                </label>
                <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  {getPlanDescription(planName)}
                </p>
              </div>

              {/* Buttons */}
              <div className="pt-4 border-t border-gray-200">
                {planName === 'free' ? (
                  <button
                    onClick={handleUpgrade}
                    disabled={processing}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Upgrade to Premium
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleCancel}
                    disabled={processing}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Cancel Plan'
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-green-100 rounded-lg">
              <User className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Profile</h2>
              <p className="text-sm text-gray-600">Manage your profile information</p>
            </div>
          </div>

          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <User className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">Coming soon</p>
              <p className="text-sm text-gray-400 mt-1">Profile management will be available soon</p>
            </div>
          </div>
        </div>

        {/* Security Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-red-100 rounded-lg">
              <Shield className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Security</h2>
              <p className="text-sm text-gray-600">Manage your account security settings</p>
            </div>
          </div>

          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <Shield className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">Coming soon</p>
              <p className="text-sm text-gray-400 mt-1">Security settings will be available soon</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Account







