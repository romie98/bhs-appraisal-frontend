import { Link, useLocation } from 'react-router-dom'
import { 
  Home, 
  BookOpen, 
  GraduationCap, 
  Users, 
  UserCircle, 
  Mail, 
  X,
  ChevronLeft,
  Upload as UploadIcon,
  ClipboardCheck,
  BarChart3,
  BookMarked,
  FileText
} from 'lucide-react'

function Sidebar({ isOpen, onClose, isCollapsed, onToggleCollapse }) {
  const location = useLocation()

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/upload', label: 'Upload', icon: UploadIcon },
    { path: '/gp1', label: 'GP1', icon: BookOpen },
    { path: '/gp2', label: 'GP2', icon: GraduationCap },
    { path: '/gp3', label: 'GP3', icon: Users },
    { path: '/gp4', label: 'GP4', icon: UserCircle },
    { path: '/gp5', label: 'GP5', icon: Users },
    { path: '/gp6', label: 'GP6', icon: GraduationCap },
    { path: '/classes', label: 'Classes', icon: GraduationCap },
    { path: '/markbook', label: 'Mark Book', icon: BookOpen },
    { path: '/attendance-register', label: 'Register', icon: ClipboardCheck },
    { path: '/logbook', label: 'Log Book', icon: BookMarked },
    { path: '/lesson-plans', label: 'Lesson Plans', icon: FileText },
    { path: '/portfolio', label: 'Portfolio', icon: BookOpen },
    { path: '/markbook-analytics', label: 'Mark Book Analytics', icon: BarChart3 },
    { path: '/register-analytics', label: 'Register Analytics', icon: BarChart3 },
    { path: '/about', label: 'About', icon: UserCircle },
    { path: '/contact', label: 'Contact', icon: Mail },
  ]

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full bg-white shadow-lg transform transition-all duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            {!isCollapsed && (
              <h2 className="text-xl font-bold text-gray-800">Teacher Portfolio</h2>
            )}
            {/* Toggle Collapse Button - Desktop only */}
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-all ml-auto"
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <ChevronLeft className={`w-5 h-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} />
            </button>
            {/* Close Button - Mobile only */}
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-all"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.path)
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={() => {
                        // Close sidebar on mobile when link is clicked
                        if (window.innerWidth < 1024) {
                          onClose()
                        }
                      }}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                        active
                          ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                      title={isCollapsed ? item.label : ''}
                    >
                      <Icon className={`w-5 h-5 flex-shrink-0 ${active ? 'text-blue-600' : 'text-gray-500'}`} />
                      {!isCollapsed && <span>{item.label}</span>}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>
        </div>
      </aside>
    </>
  )
}

export default Sidebar

