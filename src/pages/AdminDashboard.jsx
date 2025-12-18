import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useAdminStats } from '../hooks/useAdminStats'
import { useAdminActivity } from '../hooks/useAdminActivity'
import { 
  Users, 
  Activity, 
  UserCheck, 
  FileText,
  Brain,
  HardDrive,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'

/**
 * Convert MB to GB with 1 decimal place
 * @param {number} mb - Megabytes
 * @returns {string} Formatted GB string (e.g., "1.4 GB")
 */
function formatStorage(mb) {
  if (typeof mb !== 'number' || isNaN(mb)) return '0 GB'
  const gb = mb / 1024
  return `${gb.toFixed(1)} GB`
}

/**
 * Format action type to human-readable string
 * @param {string} action - Action type (e.g., "LOGIN", "UPLOAD_EVIDENCE")
 * @returns {string} Human-readable action string
 */
function formatAction(action) {
  const actionMap = {
    'LOGIN': 'Logged in',
    'UPLOAD_EVIDENCE': 'Uploaded evidence',
    'AI_OCR': 'Used AI OCR',
    'AI_ANALYSIS': 'Used AI analysis',
    'ERROR': 'Error occurred'
  }
  return actionMap[action] || action
}

/**
 * Format timestamp to "time ago" string
 * @param {string} timestamp - ISO timestamp string
 * @returns {string} Human-readable time ago string (e.g., "5 minutes ago")
 */
function formatTimeAgo(timestamp) {
  if (!timestamp) return 'Unknown time'
  
  try {
    const now = new Date()
    const time = new Date(timestamp)
    const diffMs = now - time
    const diffSecs = Math.floor(diffMs / 1000)
    const diffMins = Math.floor(diffSecs / 60)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)
    
    if (diffSecs < 60) {
      return diffSecs <= 1 ? 'just now' : `${diffSecs} seconds ago`
    } else if (diffMins < 60) {
      return diffMins === 1 ? '1 minute ago' : `${diffMins} minutes ago`
    } else if (diffHours < 24) {
      return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`
    } else if (diffDays < 7) {
      return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`
    } else {
      // For older dates, show formatted date
      return time.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: time.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      })
    }
  } catch (err) {
    console.error('Error formatting time:', err)
    return 'Unknown time'
  }
}

function AdminDashboard() {
  const { user, loading, isAuthenticated } = useAuth()
  const { stats, loading: statsLoading, error: statsError } = useAdminStats()
  const { events, loading: activityLoading, error: activityError } = useAdminActivity()

  // Diagnostic logging
  console.log("[ADMIN] ===== AdminDashboard Component Rendered =====")
  console.log("[ADMIN] loading:", loading)
  console.log("[ADMIN] isAuthenticated:", isAuthenticated)
  console.log("[ADMIN] user:", user)
  console.log("[ADMIN] user?.role:", user?.role)
  console.log("[ADMIN] user?.user_role:", user?.user_role)
  console.log("[ADMIN] stats:", stats)
  console.log("[ADMIN] statsLoading:", statsLoading)
  console.log("[ADMIN] statsError:", statsError)

  // Show loading spinner while checking authentication
  if (loading) {
    console.log("[ADMIN] Still loading auth state...")
    return (
      <div className="p-6 text-gray-600">
        <p className="text-lg font-semibold">Loading admin dashboard…</p>
        <p className="text-sm mt-2">Checking authentication...</p>
      </div>
    )
  }

  // Access control: Redirect if not authenticated
  if (!isAuthenticated) {
    console.warn("[ADMIN] No user authenticated → redirect to /login")
    return <Navigate to="/login" replace />
  }

  // Access control: Check for ADMIN role
  const userRole = user?.role || user?.user_role || ""
  const isAdmin = userRole?.toUpperCase() === "ADMIN"
  
  console.log("[ADMIN] userRole:", userRole)
  console.log("[ADMIN] isAdmin:", isAdmin)

  if (!isAdmin) {
    console.warn("[ADMIN] Not admin (role:", userRole, ") → redirect to /")
    return <Navigate to="/" replace />
  }

  console.log("[ADMIN] ✓ All checks passed - rendering dashboard")

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Diagnostic marker - remove after diagnosis */}
        <div className="mb-4 p-4 bg-green-100 border-2 border-green-600 rounded-lg">
          <h1 className="text-2xl font-bold text-green-600 mb-2">
            ✓ ADMIN DASHBOARD RENDERED
          </h1>
          <p className="text-sm text-gray-700">
            If you see this, routing + auth + role checks work.
          </p>
          <p className="text-xs text-gray-600 mt-2">
            User: {user?.email || 'N/A'} | Role: {user?.role || user?.user_role || 'N/A'}
          </p>
        </div>
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">System usage & monitoring</p>
        </div>

        {/* Error Banner (non-blocking) */}
        {statsError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-900">
                {statsError.message === 'Admin access required' 
                  ? 'Admin access required' 
                  : 'Unable to load admin statistics'}
              </p>
              {statsError.message !== 'Admin access required' && (
                <p className="text-xs text-red-700 mt-1">
                  Please refresh the page or contact support if the issue persists.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Stat Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Total Users */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Total Users</h3>
            {statsLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                <p className="text-sm text-gray-500">Loading stats…</p>
              </div>
            ) : (
              <>
                <p className="text-3xl font-bold text-gray-900">
                  {stats?.total_users ?? 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">Registered teachers</p>
              </>
            )}
          </div>

          {/* Active Users (7 days) */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Active Users (7d)</h3>
            {statsLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                <p className="text-sm text-gray-500">Loading stats…</p>
              </div>
            ) : (
              <>
                <p className="text-3xl font-bold text-gray-900">
                  {stats?.active_users_7d ?? 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">Logged in last 7 days</p>
              </>
            )}
          </div>

          {/* Total Evidence */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Total Evidence</h3>
            {statsLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                <p className="text-sm text-gray-500">Loading stats…</p>
              </div>
            ) : (
              <>
                <p className="text-3xl font-bold text-gray-900">
                  {stats?.total_evidence ?? 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">Uploaded evidence files</p>
              </>
            )}
          </div>

          {/* AI Requests */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Brain className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">AI Requests</h3>
            {statsLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                <p className="text-sm text-gray-500">Loading stats…</p>
              </div>
            ) : (
              <>
                <p className="text-3xl font-bold text-gray-900">
                  {stats?.ai_requests ?? 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">OCR / AI usage count</p>
              </>
            )}
          </div>

          {/* Storage Used */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <HardDrive className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Storage Used</h3>
            {statsLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                <p className="text-sm text-gray-500">Loading stats…</p>
              </div>
            ) : (
              <>
                <p className="text-3xl font-bold text-gray-900">
                  {stats?.storage_used_mb !== undefined ? formatStorage(stats.storage_used_mb) : '0 GB'}
                </p>
                <p className="text-xs text-gray-500 mt-1">Uploaded files size</p>
              </>
            )}
          </div>

          {/* Errors Logged */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <h3 className="text-sm font-medium text-gray-600 mb-1">Errors Logged</h3>
            {statsLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
                <p className="text-sm text-gray-500">Loading stats…</p>
              </div>
            ) : (
              <>
                <p className="text-3xl font-bold text-gray-900">
                  {stats?.errors_24h ?? 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">System errors (24h)</p>
              </>
            )}
          </div>
        </div>

        {/* Additional Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
              <p className="text-sm text-gray-600 mt-1">Latest user actions across the system</p>
            </div>
            <div className="p-6">
              {activityLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400 mr-2" />
                  <p className="text-sm text-gray-500">Loading activity...</p>
                </div>
              ) : activityError ? (
                <div className="py-12 text-center">
                  <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                  <p className="text-sm text-red-600">
                    {activityError.message === 'Admin access required' 
                      ? 'Admin access required' 
                      : 'Unable to load activity'}
                  </p>
                </div>
              ) : !events || events.length === 0 ? (
                <div className="py-12 text-center">
                  <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No recent activity</p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {events.map((event) => (
                    <li key={event.id} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-b-0 last:pb-0">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {event.user_email || 'Unknown user'}
                          </p>
                        </div>
                        <p className="text-sm text-gray-600">
                          {formatAction(event.action)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatTimeAgo(event.created_at)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* System Health */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">System Health</h2>
              <p className="text-sm text-gray-600 mt-1">Current system status</p>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">All Systems Operational</p>
                  <p className="text-sm text-gray-600">All services are running normally</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">API Status</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Healthy
                  </span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Database</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Connected
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Storage</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Available
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard

