import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import SearchForm from '../components/SearchForm'
import { searchFlights, searchBuses, setSearchType } from '../store/searchSlice'
import api from '../services/api'

const POPULAR_ROUTES = [
  { from: 'Delhi', to: 'Mumbai', price: '₹3,499', type: '✈️', searchType: 'FLIGHT' },
  { from: 'Bangalore', to: 'Chennai', price: '₹1,899', type: '✈️', searchType: 'FLIGHT' },
  { from: 'Mumbai', to: 'Goa', price: '₹799', type: '🚌', searchType: 'BUS' },
  { from: 'Delhi', to: 'Jaipur', price: '₹499', type: '🚌', searchType: 'BUS' },
  { from: 'Mumbai', to: 'Pune', price: '₹349', type: '🚌', searchType: 'BUS' },
  { from: 'Hyderabad', to: 'Bangalore', price: '₹2,199', type: '✈️', searchType: 'FLIGHT' },
]

export default function HomePage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [deals, setDeals] = useState([])
  const [dealsLoading, setDealsLoading] = useState(true)

  useEffect(() => {
    api.get('/explore/everywhere?origin=DEL')
      .then(res => setDeals(res.data.deals || []))
      .catch(() => setDeals([]))
      .finally(() => setDealsLoading(false))
  }, [])

  const handleDealClick = (destination) => {
    const today = new Date()
    const depDate = new Date(today.setDate(today.getDate() + 7)).toISOString().split('T')[0]
    dispatch(setSearchType('FLIGHT'))
    dispatch(searchFlights({ origin: 'Delhi', destination, departure_date: depDate }))
    navigate('/search')
  }

  const handleRouteClick = (route) => {
    const today = new Date()
    const depDate = new Date(today.setDate(today.getDate() + 3)).toISOString().split('T')[0]
    dispatch(setSearchType(route.searchType))
    if (route.searchType === 'FLIGHT') {
      dispatch(searchFlights({ origin: route.from, destination: route.to, departure_date: depDate }))
    } else {
      dispatch(searchBuses({ origin: route.from, destination: route.to, departure_date: depDate }))
    }
    navigate('/search')
  }
  return (
    <div className="relative">
      {/* Hero */}
      <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-accent-600 py-16 md:py-20 px-4">
        <div className="max-w-7xl mx-auto text-center mb-10">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Find & Bundle Your Perfect Trip
          </h1>
          <p className="text-lg md:text-xl text-primary-100 max-w-2xl mx-auto">
            Compare flights, buses, and hotels across India from top providers.
            Bundle them into packages and save up to 50%. All prices in ₹ INR.
          </p>
        </div>
        <SearchForm />
      </div>

      {/* Real-time Deals from API */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">🌍 Explore from Delhi</h2>
            <p className="text-sm text-gray-500 mt-1">Real-time cheapest flights to anywhere</p>
          </div>
          {!dealsLoading && deals.length > 0 && (
            <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
              🔴 Live prices
            </span>
          )}
        </div>
        {dealsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border p-4 animate-shimmer h-24"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {deals.slice(0, 10).map((deal, i) => (
              <div key={i} onClick={() => handleDealClick(deal.destination)}
                className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-primary-200 transition-all cursor-pointer card-hover">
                <div className="text-sm font-medium text-gray-900 mb-1">{deal.destination}</div>
                <div className="text-xs text-gray-500 mb-2">{deal.country}</div>
                <div className="flex justify-between items-center">
                  <span className="text-primary-600 font-bold">
                    ₹{Math.round(deal.price || 0).toLocaleString('en-IN')}
                  </span>
                  {deal.direct_flight && (
                    <span className="text-xs bg-green-50 text-green-700 px-1.5 py-0.5 rounded">Direct</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Popular Routes */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">🔥 Popular Routes</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {POPULAR_ROUTES.map((route, i) => (
            <div key={i} onClick={() => handleRouteClick(route)}
              className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-primary-200 transition-all cursor-pointer card-hover">
              <div className="text-lg mb-1">{route.type}</div>
              <div className="text-sm font-medium text-gray-900">{route.from} → {route.to}</div>
              <div className="text-primary-600 font-bold mt-1">{route.price}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="bg-gray-50 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Why TravelBundler?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-6 text-center shadow-sm">
              <div className="text-4xl mb-4">🔍</div>
              <h3 className="font-semibold text-lg mb-2">Compare Everything</h3>
              <p className="text-gray-600 text-sm">Search flights, buses, and hotels from 9+ providers in one place.</p>
            </div>
            <div className="bg-white rounded-xl p-6 text-center shadow-sm">
              <div className="text-4xl mb-4">📦</div>
              <h3 className="font-semibold text-lg mb-2">Smart Packages</h3>
              <p className="text-gray-600 text-sm">Bundle travel segments with automatic compatibility checks and savings.</p>
            </div>
            <div className="bg-white rounded-xl p-6 text-center shadow-sm">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="font-semibold text-lg mb-2">Save More</h3>
              <p className="text-gray-600 text-sm">Get package discounts up to 8% and set price alerts to book at the best time.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-3xl font-bold text-primary-600">9+</div>
            <div className="text-sm text-gray-600">Providers</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary-600">30+</div>
            <div className="text-sm text-gray-600">Indian Cities</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary-600">₹0</div>
            <div className="text-sm text-gray-600">Platform Fee</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary-600">8%</div>
            <div className="text-sm text-gray-600">Package Savings</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="text-white font-bold text-lg mb-4 md:mb-0">✈️ TravelBundler</div>
          <div className="text-sm">© 2026 TravelBundler. Compare. Bundle. Save.</div>
        </div>
      </footer>
    </div>
  )
}
