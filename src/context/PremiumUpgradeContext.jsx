import { createContext, useState, useContext, useEffect } from 'react'
import { setPremiumUpgradeCallback } from '../config/api'

const PremiumUpgradeContext = createContext()

export function PremiumUpgradeProvider({ children }) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  const openUpgradeModal = () => {
    setShowUpgradeModal(true)
  }

  const closeUpgradeModal = () => {
    setShowUpgradeModal(false)
  }

  // Register callback with apiFetch on mount
  useEffect(() => {
    setPremiumUpgradeCallback(openUpgradeModal)
    
    // Cleanup on unmount
    return () => {
      setPremiumUpgradeCallback(null)
    }
  }, [])

  const value = {
    showUpgradeModal,
    openUpgradeModal,
    closeUpgradeModal,
  }

  return (
    <PremiumUpgradeContext.Provider value={value}>
      {children}
    </PremiumUpgradeContext.Provider>
  )
}

export function usePremiumUpgrade() {
  const context = useContext(PremiumUpgradeContext)
  if (!context) {
    throw new Error('usePremiumUpgrade must be used within a PremiumUpgradeProvider')
  }
  return context
}






