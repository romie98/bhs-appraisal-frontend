import { createContext, useState, useEffect, useContext } from "react"
import { apiUrl } from "../config/api"

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    // Initialize from localStorage
    return localStorage.getItem("token")
  })
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check if user is authenticated on mount
  useEffect(() => {
    if (token) {
      // Verify token and get user info
      fetchUserInfo()
    } else {
      setLoading(false)
    }
  }, [token])

  const fetchUserInfo = async () => {
    try {
      const response = await fetch(apiUrl("/auth/me"), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData)
      } else {
        // Token is invalid, clear it
        logout()
      }
    } catch (error) {
      console.error("Error fetching user info:", error)
      logout()
    } finally {
      setLoading(false)
    }
  }

  function login(newToken) {
    localStorage.setItem("token", newToken)
    setToken(newToken)
  }

  function logout() {
    localStorage.removeItem("token")
    setToken(null)
    setUser(null)
  }

  const value = {
    token,
    user,
    loading,
    login,
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

