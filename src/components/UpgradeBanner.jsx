import { Link } from 'react-router-dom'
import { Sparkles, X } from 'lucide-react'
import { useState } from 'react'

/**
 * Upgrade banner component for premium features
 * Shows when user doesn't have access to a feature
 * @param {Object} props
 * @param {string} props.featureKey - Feature key that requires upgrade
 * @param {string} props.message - Custom message (optional)
 * @param {boolean} props.dismissible - Whether banner can be dismissed (default: false)
 * @param {string} props.variant - Banner variant: 'info' | 'warning' | 'success' (default: 'info')
 */
export function UpgradeBanner({ 
  featureKey, 
  message, 
  dismissible = false,
  variant = 'info'
}) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  const variantStyles = {
    info: 'bg-blue-50 border-blue-200 text-blue-900',
    warning: 'bg-amber-50 border-amber-200 text-amber-900',
    success: 'bg-green-50 border-green-200 text-green-900',
  }

  const defaultMessage = 'Upgrade to Pro to unlock this feature'

  return (
    <div className={`border rounded-lg p-4 ${variantStyles[variant]}`}>
      <div className="flex items-start gap-3">
        <Sparkles className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium">
            {message || defaultMessage}
          </p>
          <Link
            to="/pricing"
            className="text-sm underline mt-1 inline-block hover:opacity-80"
          >
            Learn more about Pro features →
          </Link>
        </div>
        {dismissible && (
          <button
            onClick={() => setDismissed(true)}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}

export default UpgradeBanner







