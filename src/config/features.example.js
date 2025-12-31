/**
 * USAGE EXAMPLES
 * 
 * This file demonstrates how to use the feature system in your components.
 * Delete this file after reviewing the examples.
 */

// ============================================
// Example 1: Using the hook in a component
// ============================================
/*
import { useFeature } from '../hooks/useFeature'
import { FEATURE_KEYS } from '../config/features'
import { UpgradeBanner } from '../components/UpgradeBanner'

function MyComponent() {
  const { hasAccess } = useFeature(FEATURE_KEYS.AI_OCR)
  
  return (
    <div>
      {hasAccess ? (
        <button>Use AI OCR</button>
      ) : (
        <UpgradeBanner featureKey={FEATURE_KEYS.AI_OCR} />
      )}
    </div>
  )
}
*/

// ============================================
// Example 2: Disabling buttons (not removing routes)
// ============================================
/*
import { useFeature } from '../hooks/useFeature'
import { FEATURE_KEYS } from '../config/features'
import { UpgradeBanner } from '../components/UpgradeBanner'

function UploadComponent() {
  const { hasAccess } = useFeature(FEATURE_KEYS.AI_ANALYSIS)
  
  return (
    <div>
      <button 
        disabled={!hasAccess}
        className={!hasAccess ? 'opacity-50 cursor-not-allowed' : ''}
      >
        Analyze with AI
      </button>
      {!hasAccess && (
        <UpgradeBanner 
          featureKey={FEATURE_KEYS.AI_ANALYSIS}
          message="Upgrade to Pro to use AI analysis"
        />
      )}
    </div>
  )
}
*/

// ============================================
// Example 3: Hiding premium UI elements
// ============================================
/*
import { useFeature } from '../hooks/useFeature'
import { FEATURE_KEYS } from '../config/features'

function Dashboard() {
  const { hasAccess: hasAdvancedAnalytics } = useFeature(FEATURE_KEYS.ADVANCED_ANALYTICS)
  const { hasAccess: hasExportPDF } = useFeature(FEATURE_KEYS.EXPORT_PDF)
  
  return (
    <div>
      <h1>Dashboard</h1>
      
      {/* Basic analytics - always visible */}
      <BasicAnalytics />
      
      {/* Advanced analytics - only for premium users */}
      {hasAdvancedAnalytics && <AdvancedAnalytics />}
      
      {/* Export button - disabled for free users */}
      <button disabled={!hasExportPDF}>
        Export PDF
      </button>
    </div>
  )
}
*/

// ============================================
// Example 4: Using subscription info
// ============================================
/*
import { useSubscription } from '../hooks/useFeature'

function ProfilePage() {
  const { plan, isPremium } = useSubscription()
  
  return (
    <div>
      <p>Current Plan: {plan}</p>
      {isPremium && <p>🎉 You're on a premium plan!</p>}
    </div>
  )
}
*/

// ============================================
// Example 5: Direct helper usage (without hook)
// ============================================
/*
import { useAuth } from '../context/AuthContext'
import { hasFeature, FEATURE_KEYS } from '../config/features'

function MyComponent() {
  const { user } = useAuth()
  const canUseAI = hasFeature(user, FEATURE_KEYS.AI_OCR)
  
  return (
    <div>
      {canUseAI ? 'AI Available' : 'Upgrade Required'}
    </div>
  )
}
*/











