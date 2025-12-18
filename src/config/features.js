// Feature flags configuration
// Mirrors backend feature keys and provides descriptions

/**
 * Feature keys that match backend feature system
 * These should align with backend feature definitions
 */
export const FEATURE_KEYS = {
  // AI Features
  AI_OCR: 'ai_ocr',
  AI_ANALYSIS: 'ai_analysis',
  AI_EVIDENCE_EXTRACTION: 'ai_evidence_extraction',
  AI_PORTFOLIO_BUILDER: 'ai_portfolio_builder',
  
  // Advanced Features
  ADVANCED_ANALYTICS: 'advanced_analytics',
  EXPORT_PDF: 'export_pdf',
  BULK_UPLOAD: 'bulk_upload',
  CUSTOM_REPORTS: 'custom_reports',
  
  // Collaboration Features
  SHARE_PORTFOLIO: 'share_portfolio',
  TEAM_COLLABORATION: 'team_collaboration',
  
  // Storage Features
  UNLIMITED_STORAGE: 'unlimited_storage',
  CLOUD_BACKUP: 'cloud_backup',
  
  // Support Features
  PRIORITY_SUPPORT: 'priority_support',
  DEDICATED_ACCOUNT_MANAGER: 'dedicated_account_manager',
}

/**
 * Feature descriptions for UI display
 */
export const FEATURE_DESCRIPTIONS = {
  [FEATURE_KEYS.AI_OCR]: 'AI-powered OCR to extract text from images',
  [FEATURE_KEYS.AI_ANALYSIS]: 'AI analysis of lesson plans and evidence',
  [FEATURE_KEYS.AI_EVIDENCE_EXTRACTION]: 'Automatic evidence extraction from documents',
  [FEATURE_KEYS.AI_PORTFOLIO_BUILDER]: 'AI-powered portfolio builder and suggestions',
  [FEATURE_KEYS.ADVANCED_ANALYTICS]: 'Advanced analytics and insights',
  [FEATURE_KEYS.EXPORT_PDF]: 'Export reports and portfolios as PDF',
  [FEATURE_KEYS.BULK_UPLOAD]: 'Upload multiple files at once',
  [FEATURE_KEYS.CUSTOM_REPORTS]: 'Create custom appraisal reports',
  [FEATURE_KEYS.SHARE_PORTFOLIO]: 'Share portfolio with administrators',
  [FEATURE_KEYS.TEAM_COLLABORATION]: 'Collaborate with team members',
  [FEATURE_KEYS.UNLIMITED_STORAGE]: 'Unlimited file storage',
  [FEATURE_KEYS.CLOUD_BACKUP]: 'Automatic cloud backup',
  [FEATURE_KEYS.PRIORITY_SUPPORT]: 'Priority customer support',
  [FEATURE_KEYS.DEDICATED_ACCOUNT_MANAGER]: 'Dedicated account manager',
}

/**
 * Subscription plans and their associated features
 * This should mirror the backend plan-to-features mapping
 */
export const PLAN_FEATURES = {
  // Free tier - basic features only
  free: [
    // No premium features
  ],
  
  // Basic tier
  basic: [
    FEATURE_KEYS.AI_OCR,
    FEATURE_KEYS.EXPORT_PDF,
  ],
  
  // Pro tier - most features
  pro: [
    FEATURE_KEYS.AI_OCR,
    FEATURE_KEYS.AI_ANALYSIS,
    FEATURE_KEYS.AI_EVIDENCE_EXTRACTION,
    FEATURE_KEYS.ADVANCED_ANALYTICS,
    FEATURE_KEYS.EXPORT_PDF,
    FEATURE_KEYS.BULK_UPLOAD,
    FEATURE_KEYS.CUSTOM_REPORTS,
    FEATURE_KEYS.SHARE_PORTFOLIO,
    FEATURE_KEYS.CLOUD_BACKUP,
  ],
  
  // Premium tier - all features
  premium: [
    FEATURE_KEYS.AI_OCR,
    FEATURE_KEYS.AI_ANALYSIS,
    FEATURE_KEYS.AI_EVIDENCE_EXTRACTION,
    FEATURE_KEYS.AI_PORTFOLIO_BUILDER,
    FEATURE_KEYS.ADVANCED_ANALYTICS,
    FEATURE_KEYS.EXPORT_PDF,
    FEATURE_KEYS.BULK_UPLOAD,
    FEATURE_KEYS.CUSTOM_REPORTS,
    FEATURE_KEYS.SHARE_PORTFOLIO,
    FEATURE_KEYS.TEAM_COLLABORATION,
    FEATURE_KEYS.UNLIMITED_STORAGE,
    FEATURE_KEYS.CLOUD_BACKUP,
    FEATURE_KEYS.PRIORITY_SUPPORT,
    FEATURE_KEYS.DEDICATED_ACCOUNT_MANAGER,
  ],
}

/**
 * Get all features for a subscription plan
 * @param {string} plan - Subscription plan name (e.g., 'free', 'basic', 'pro', 'premium')
 * @returns {string[]} Array of feature keys
 */
export function getPlanFeatures(plan) {
  if (!plan) return PLAN_FEATURES.free
  const normalizedPlan = plan.toLowerCase()
  return PLAN_FEATURES[normalizedPlan] || PLAN_FEATURES.free
}

/**
 * Check if a user has access to a specific feature
 * @param {Object|null|undefined} user - User object from AuthContext
 * @param {string} featureKey - Feature key to check (from FEATURE_KEYS)
 * @returns {boolean} True if user has access to the feature
 */
export function hasFeature(user, featureKey) {
  // If no user, no features
  if (!user) return false
  
  // Get subscription plan from user object
  // Supports both subscription_plan and subscriptionPlan (camelCase)
  const plan = user.subscription_plan || user.subscriptionPlan || 'free'
  
  // Get features for the user's plan
  const planFeatures = getPlanFeatures(plan)
  
  // Check if feature is included
  return planFeatures.includes(featureKey)
}

/**
 * Get user's subscription plan
 * @param {Object|null|undefined} user - User object from AuthContext
 * @returns {string} Subscription plan name (defaults to 'free')
 */
export function getUserPlan(user) {
  if (!user) return 'free'
  return user.subscription_plan || user.subscriptionPlan || 'free'
}

/**
 * Check if user is on a premium plan (pro or premium)
 * @param {Object|null|undefined} user - User object from AuthContext
 * @returns {boolean} True if user is on pro or premium plan
 */
export function isPremiumUser(user) {
  const plan = getUserPlan(user)
  return plan === 'pro' || plan === 'premium'
}

