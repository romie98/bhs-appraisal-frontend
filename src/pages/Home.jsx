import { useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LogIn, UserPlus } from 'lucide-react'

function Home() {
  const navigate = useNavigate()
  const { isAuthenticated, loading } = useAuth()

  // Redirect to classes if already logged in
  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/classes')
    }
  }, [isAuthenticated, loading, navigate])

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-blue-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render if authenticated (will redirect)
  if (isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-blue-100 px-4">
      <div className="max-w-2xl w-full text-center">
        {/* Title */}
        <h1 className="text-5xl sm:text-6xl font-bold text-gray-800 mb-4">
          MyTPortfolio
        </h1>
        
        {/* Subtitle */}
        <p className="text-xl sm:text-2xl text-gray-600 mb-12">
          Your Professional Teacher Portfolio
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-sky-600 text-white rounded-xl hover:bg-sky-700 hover:shadow-lg transition-all font-semibold text-lg"
          >
            <LogIn className="w-5 h-5" />
            Login
          </Link>
          
          <Link
            to="/register"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-sky-600 rounded-xl hover:bg-gray-50 hover:shadow-lg transition-all font-semibold text-lg border-2 border-sky-600"
          >
            <UserPlus className="w-5 h-5" />
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Home
