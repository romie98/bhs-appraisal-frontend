import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

function GlobalLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const location = useLocation()

  // Get page title based on route
  const getPageTitle = () => {
    const titles = {
      '/': 'Home',
      '/upload': 'Upload Portfolio Item',
      '/upload-evidence': 'Upload Evidence',
      '/gp1': 'GP1 — Subject Content Knowledge',
      '/gp2': 'GP2 — Pedagogy & Teaching Strategies',
      '/gp3': 'GP3 — Student Assessment & Feedback',
      '/gp4': 'GP4 — Professional Development',
      '/gp5': 'GP5 — Community Engagement',
      '/gp6': 'GP6 — Technology Integration',
      '/about': 'About',
      '/contact': 'Contact',
      '/markbook': 'Mark Book',
      '/register': 'Attendance Register',
      '/logbook': 'Log Book',
      '/portfolio': 'Teacher Portfolio',
      '/markbook-analytics': 'Mark Book Analytics',
      '/register-analytics': 'Register Analytics',
      '/classes': 'Class Management',
      '/account': 'Account',
    }
    // Handle logbook detail pages
    if (location.pathname.startsWith('/logbook/')) {
      return 'Log Book Entry'
    }
    return titles[location.pathname] || 'Teacher Portfolio'
  }

  // Handle sidebar collapse on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      
      {/* Main Content Area */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
        {/* Header */}
        <Header 
          onMenuClick={() => setSidebarOpen(true)} 
          pageTitle={getPageTitle()}
        />
        
        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

export default GlobalLayout

