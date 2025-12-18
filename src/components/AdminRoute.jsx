import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { Loader2 } from "lucide-react"

/**
 * AdminRoute component that requires ADMIN role
 * Redirects non-admin users to /dashboard
 * Requires authentication (wraps ProtectedRoute logic)
 */
export default function AdminRoute({ children }) {
  const { user, loading, isAuthenticated } = useAuth()

  // Diagnostic logging
  console.log("[AdminRoute] ===== AdminRoute Component Rendered =====")
  console.log("[AdminRoute] loading:", loading)
  console.log("[AdminRoute] isAuthenticated:", isAuthenticated)
  console.log("[AdminRoute] user:", user)
  console.log("[AdminRoute] user?.role:", user?.role)
  console.log("[AdminRoute] user?.user_role:", user?.user_role)

  // Show loading spinner while checking authentication
  if (loading) {
    console.log("[AdminRoute] Still loading auth state...")
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-sky-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // First check authentication (ProtectedRoute logic)
  if (!isAuthenticated) {
    console.warn("[AdminRoute] Not authenticated → redirect to /login")
    return <Navigate to="/login" replace />
  }

  // Then check admin role
  // Check for role in user object (case-insensitive)
  const userRole = user?.role || user?.user_role || ""
  const isAdmin = userRole?.toUpperCase() === "ADMIN"
  
  console.log("[AdminRoute] userRole:", userRole)
  console.log("[AdminRoute] isAdmin:", isAdmin)

  if (!isAdmin) {
    console.warn("[AdminRoute] Not admin (role:", userRole, ") → redirect to /")
    // Redirect non-admin users to home
    return <Navigate to="/" replace />
  }

  console.log("[AdminRoute] ✓ All checks passed - rendering children")
  // Render admin content
  return children
}

