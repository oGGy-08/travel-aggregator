import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { login, register } from '../store/authSlice'
import { searchFlights, searchBuses, setSearchType } from '../store/searchSlice'
import api from '../services/api'

export default function BookingPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, loading, error } = useSelector((state) => state.auth)
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [searchHistory, setSearchHistory] = useState([])

  useEffect(() => {
    if (user) {
      api.get(`/admin/search-history?user_id=${user.id}&limit=10`)
        .then(res => setSearchHistory(res.data.history || []))
        .catch(() => {})
    }
  }, [user])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (isLogin) {
      dispatch(login({ email, password }))
    } else {
      dispatch(register({ email, password, full_name: fullName }))
    }
  }

  if (user) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-sm border p-8">
          <div className="flex items-center space-x-4 mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-accent-400 rounded-full flex items-center justify-center text-2xl font-bold text-white">
              {user.full_name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Welcome, {user.full_name}!</h2>
              <p className="text-gray-500">{user.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-primary-600">0</div>
              <div className="text-sm text-primary-700 mt-1">Bookings</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-green-600">0</div>
              <div className="text-sm text-green-700 mt-1">Saved Packages</div>
            </div>
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-orange-600">0</div>
              <div className="text-sm text-orange-700 mt-1">Price Alerts</div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="font-semibold text-gray-900 mb-4">Recent Searches</h3>
            {searchHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <div className="text-3xl mb-2">📋</div>
                <p>No recent searches. Start by searching for trips!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {searchHistory.map((s, i) => (
                  <div key={i} className="flex justify-between items-center bg-gray-50 rounded-lg p-3 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      dispatch(setSearchType(s.search_type))
                      if (s.search_type === 'FLIGHT') dispatch(searchFlights({ origin: s.origin, destination: s.destination, departure_date: s.departure_date }))
                      else dispatch(searchBuses({ origin: s.origin, destination: s.destination, departure_date: s.departure_date }))
                      navigate('/search')
                    }}>
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{s.search_type === 'FLIGHT' ? '✈️' : s.search_type === 'BUS' ? '🚌' : '🏨'}</span>
                      <div>
                        <div className="text-sm font-medium">{s.origin} → {s.destination}</div>
                        <div className="text-xs text-gray-500">{s.departure_date} · {s.results_count} results</div>
                      </div>
                    </div>
                    <span className="text-xs text-primary-600 font-medium">Search Again →</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-2xl shadow-xl border w-full max-w-md p-8">
        <div className="text-center mb-6">
          <div className="text-3xl mb-2">✈️</div>
          <h2 className="text-2xl font-bold text-gray-900">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {isLogin ? 'Sign in to access your trips' : 'Join TravelBundler to save trips'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg mb-4 text-sm flex items-center space-x-2">
            <span>⚠️</span><span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Full Name</label>
              <input type="text" placeholder="John Doe" value={fullName}
                onChange={(e) => setFullName(e.target.value)} required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
            </div>
          )}
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Email</label>
            <input type="email" placeholder="you@example.com" value={email}
              onChange={(e) => setEmail(e.target.value)} required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
          </div>
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Password</label>
            <input type="password" placeholder="••••••••" value={password}
              onChange={(e) => setPassword(e.target.value)} required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-gradient-to-r from-primary-600 to-accent-500 text-white py-3.5 rounded-lg font-semibold hover:from-primary-700 hover:to-accent-600 transition-all shadow-lg disabled:opacity-50">
            {loading ? '⏳ Loading...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
          <div className="relative flex justify-center"><span className="bg-white px-3 text-sm text-gray-400">or</span></div>
        </div>

        <p className="text-center text-sm text-gray-500">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button onClick={() => setIsLogin(!isLogin)} className="text-primary-600 font-semibold hover:underline">
            {isLogin ? 'Sign Up Free' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  )
}
