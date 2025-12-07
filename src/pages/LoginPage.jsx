import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Home, User, Newspaper, Mail } from 'lucide-react'

function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [keepSignedIn, setKeepSignedIn] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle login logic here
    console.log('Login attempt:', { email, password, keepSignedIn })
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Half - Login Form */}
      <div className="w-full lg:w-1/2 relative bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-6 sm:p-8 lg:p-12 overflow-hidden">
        {/* Background Video */}
        <video
          autoPlay
          loop
          muted
          className="absolute inset-0 w-full h-full object-cover opacity-10"
        >
          <source src="/videos/background-video.mp4" type="video/mp4" />
        </video>

        {/* Login Form Container */}
        <div className="relative z-10 w-full max-w-md">
          {/* Login Heading */}
          <div className="mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-2">
              Login
            </h1>
            <p className="text-lg text-gray-600">
              Welcome back! Please sign in to your account.
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm transition-all"
                placeholder="Enter your email"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm transition-all"
                placeholder="Enter your password"
              />
            </div>

            {/* Keep Signed In & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={keepSignedIn}
                  onChange={(e) => setKeepSignedIn(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Keep me signed in</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Sign In
            </button>
          </form>

          {/* Footer Navigation */}
          <nav className="mt-12 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-sm">
            <Link
              to="/"
              className="text-gray-600 hover:text-gray-800 transition-colors flex items-center gap-1"
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Link>
            <Link
              to="/about"
              className="text-gray-600 hover:text-gray-800 transition-colors flex items-center gap-1"
            >
              <User className="w-4 h-4" />
              <span>About</span>
            </Link>
            <Link
              to="/news"
              className="text-gray-600 hover:text-gray-800 transition-colors flex items-center gap-1"
            >
              <Newspaper className="w-4 h-4" />
              <span>News</span>
            </Link>
            <Link
              to="/contact"
              className="text-gray-600 hover:text-gray-800 transition-colors flex items-center gap-1"
            >
              <Mail className="w-4 h-4" />
              <span>Contact</span>
            </Link>
          </nav>
        </div>
      </div>

      {/* Right Half - Illustration */}
      <div className="w-full lg:w-1/2 bg-white flex flex-col items-center justify-center p-6 sm:p-8 lg:p-12 relative">
        {/* Top Right Navigation Bar */}
        <div className="absolute top-6 right-6 lg:top-8 lg:right-8">
          <div className="bg-blue-600 rounded-full px-4 py-2 shadow-lg">
            <nav className="flex items-center gap-4 text-white text-sm">
              <Link
                to="/"
                className="hover:text-blue-100 transition-colors"
              >
                Home
              </Link>
              <Link
                to="/about"
                className="hover:text-blue-100 transition-colors"
              >
                About
              </Link>
              <Link
                to="/news"
                className="hover:text-blue-100 transition-colors"
              >
                News
              </Link>
              <Link
                to="/contact"
                className="hover:text-blue-100 transition-colors"
              >
                Contact
              </Link>
            </nav>
          </div>
        </div>

        {/* Center Illustration */}
        <div className="flex-1 flex items-center justify-center w-full max-w-2xl my-8">
          <img
            src="/images/login-illustration.png"
            alt="Login illustration"
            className="w-full h-auto max-w-full object-contain"
            onError={(e) => {
              // Fallback if image doesn't load
              e.target.style.display = 'none'
              const fallback = e.target.nextElementSibling
              if (fallback) fallback.classList.remove('hidden')
            }}
          />
          {/* Fallback placeholder if image doesn't load */}
          <div className="hidden w-full h-96 bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl flex items-center justify-center">
            <p className="text-gray-500 text-lg">Illustration</p>
            <p className="text-xs text-gray-400 mt-2">Please add login-illustration.png to public/images/</p>
          </div>
        </div>

        {/* Footer Text */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            © 2025 Teacher Portfolio. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage

