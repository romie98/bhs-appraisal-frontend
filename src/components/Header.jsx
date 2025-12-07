import { Menu } from 'lucide-react'
import GoogleLogin from './GoogleLogin'

function Header({ onMenuClick, pageTitle }) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Header Title */}
        <div className="flex-1 lg:ml-0">
          <h1 className="text-xl font-semibold text-gray-800">
            {pageTitle || 'Teacher Portfolio'}
          </h1>
        </div>

        {/* Google Login */}
        <div className="flex items-center gap-4">
          <GoogleLogin />
        </div>
      </div>
    </header>
  )
}

export default Header

