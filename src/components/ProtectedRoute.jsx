import { useContext, useEffect } from "react"
import { Navigate, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { Loader2 } from "lucide-react"

/**
 * ProtectedRoute component that requires authentication
 * Redirects to login if user is not authenticated
 * Prevents redirect loops by checking token validity
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, token } = useAuth()
  const navigate = useNavigate()

  // Check if token exists but is invalid (401 error)
  useEffect(() => {
    if (!loading && token && !isAuthenticated) {
      // Token exists but user is not authenticated - token is invalid
      // Clear token to prevent redirect loop
      localStorage.removeItem("auth_token")
    }
  }, [loading, token, isAuthenticated])

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-sky-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Render protected content
  return children
}


