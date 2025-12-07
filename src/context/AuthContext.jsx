import { createContext, useState, useEffect, useContext } from "react"
import { getMe, login as loginService, register as registerService } from "../services/authService"

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    // Initialize from localStorage using "auth_token" key
    return localStorage.getItem("auth_token")
  })
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchUserInfo = async () => {
    try {
      const userData = await getMe()
      // Ensure user data is valid before setting
      if (userData && typeof userData === 'object') {
        setUser(userData)
      } else {
        setUser(null)
      }
      setLoading(false)
    } catch (error) {
      console.error("Error fetching user info:", error)
      // Token is invalid or expired (401), immediately clear user
      setUser(null)
      localStorage.removeItem("auth_token")
      setToken(null)
      setLoading(false)
      // Don't redirect here to avoid loops - let ProtectedRoute handle it
    }
  }

  // Check if user is authenticated on mount
  useEffect(() => {
    if (token) {
      // Verify token and get user info
      fetchUserInfo()
    } else {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  async function login(loginData) {
    try {
      const response = await loginService(loginData)
      const newToken = response.access_token
      localStorage.setItem("auth_token", newToken)
      setToken(newToken)
      // Fetch user info after login
      await fetchUserInfo()
    } catch (error) {
      throw error
    }
  }

  async function register(registerData) {
    try {
      const response = await registerService(registerData)
      const newToken = response.access_token
      localStorage.setItem("auth_token", newToken)
      setToken(newToken)
      // Fetch user info after registration
      await fetchUserInfo()
    } catch (error) {
      throw error
    }
  }

  function logout() {
    localStorage.removeItem("auth_token")
    setToken(null)
    setUser(null)
  }

  const value = {
    token,
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!token,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

