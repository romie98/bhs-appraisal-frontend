import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './context/AuthContext'
import { PremiumUpgradeProvider } from './context/PremiumUpgradeContext'
import App from './App.jsx'
import './index.css'

// Log API URL configuration for debugging
console.log("=== API CONFIGURATION ===");
console.log("window.__APP_API_URL__ =", window.__APP_API_URL__);
try {
  console.log("import.meta.env.VITE_API_BASE_URL =", import.meta.env.VITE_API_BASE_URL);
} catch (e) {
  console.log("import.meta.env.VITE_API_BASE_URL = (not available)");
}
console.log("=========================");

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <PremiumUpgradeProvider>
            <App />
          </PremiumUpgradeProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
)


