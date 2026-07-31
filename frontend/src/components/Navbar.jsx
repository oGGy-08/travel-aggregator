import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../store/authSlice'
import useDarkMode from '../hooks/useDarkMode'

export default function Navbar() {
  const { user } = useSelector((state) => state.auth)
  const { segments } = useSelector((state) => state.packages)
  const dispatch = useDispatch()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [darkMode, setDarkMode] = useDarkMode()

  const isActive = (path) => location.pathname === path

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent">
              ✈️ TravelBundler
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className={`font-medium transition-colors ${isActive('/') ? 'text-primary-600' : 'text-gray-600 hover:text-primary-600'}`}>
              Search
            </Link>
            <Link to="/packages" className={`font-medium transition-colors relative ${isActive('/packages') ? 'text-primary-600' : 'text-gray-600 hover:text-primary-600'}`}>
              Packages
              {segments.length > 0 && (
                <span className="absolute -top-1 -right-3 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                  {segments.length}
                </span>
              )}
            </Link>
            <button onClick={() => setDarkMode(!darkMode)}
              className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gray-200 transition-colors"
              title={darkMode ? 'Light mode' : 'Dark mode'}>
              {darkMode ? '☀️' : '🌙'}
            </button>
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-sm font-bold text-primary-600">
                  {user.full_name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm text-gray-700 font-medium">{user.full_name}</span>
                <button onClick={() => dispatch(logout())}
                  className="text-sm text-gray-400 hover:text-red-500 transition-colors">Logout</button>
              </div>
            ) : (
              <Link to="/booking"
                className="bg-gradient-to-r from-primary-600 to-accent-500 text-white px-4 py-2 rounded-lg hover:shadow-md transition-all font-medium text-sm">
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link to="/" className="block py-2 text-gray-700" onClick={() => setMobileOpen(false)}>Search</Link>
            <Link to="/packages" className="block py-2 text-gray-700" onClick={() => setMobileOpen(false)}>Packages ({segments.length})</Link>
            <Link to="/booking" className="block py-2 text-gray-700" onClick={() => setMobileOpen(false)}>
              {user ? user.full_name : 'Sign In'}
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}
