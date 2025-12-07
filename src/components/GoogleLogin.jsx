import { useState, useEffect } from 'react'
import { LogIn, LogOut, User, Loader } from 'lucide-react'
import { initTokenClient, requestAccessToken, isSignedIn, signOut as signOutService } from '../services/googleDriveService'

function GoogleLogin({ onLogin }) {
  const [isSignedInState, setIsSignedInState] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  // Check authentication status on mount
  useEffect(() => {
    const checkAuthStatus = () => {
      const signedIn = isSignedIn()
      setIsSignedInState(signedIn)
      if (onLogin) {
        onLogin(signedIn)
      }
    }

    // Wait for Google Identity Services to load
    const checkGIS = setInterval(() => {
      if (window.google && window.google.accounts) {
        clearInterval(checkGIS)
        checkAuthStatus()
      }
    }, 100)

    return () => clearInterval(checkGIS)
  }, [onLogin])

  const handleSignIn = async () => {
    try {
      setIsLoading(true)
      const tokenClient = initTokenClient()
      await requestAccessToken(tokenClient)
      setIsSignedInState(true)
      setShowDropdown(false)
      if (onLogin) {
        onLogin(true)
      }
    } catch (error) {
      console.error('Error signing in:', error)
      alert('Failed to sign in. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      setIsLoading(true)
      signOutService()
      setIsSignedInState(false)
      setShowDropdown(false)
      if (onLogin) {
        onLogin(false)
      }
    } catch (error) {
      console.error('Error signing out:', error)
      alert('Failed to sign out. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading && !isSignedInState) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 text-gray-600">
        <Loader className="w-4 h-4 animate-spin" />
        <span className="text-sm">Loading...</span>
      </div>
    )
  }

  if (!isSignedInState) {
    return (
      <button
        onClick={handleSignIn}
        disabled={isLoading}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
      >
        <LogIn className="w-4 h-4" />
        <span>Sign in with Google</span>
      </button>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
          <User className="w-4 h-4 text-white" />
        </div>
        <span className="text-sm font-medium text-gray-700 hidden sm:block">
          Signed In
        </span>
      </button>

      {showDropdown && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowDropdown(false)}
          />
          
          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 z-20 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <p className="text-sm font-semibold text-gray-800 text-center">
                Google Account
              </p>
              <p className="text-xs text-gray-500 text-center mt-1">
                Signed in to Google Drive
              </p>
            </div>
            <div className="p-2">
              <button
                onClick={handleSignOut}
                disabled={isLoading}
                className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default GoogleLogin


