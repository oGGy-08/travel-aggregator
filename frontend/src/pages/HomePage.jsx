import SearchForm from '../components/SearchForm'

const POPULAR_ROUTES = [
  { from: 'Delhi', to: 'Mumbai', price: '₹3,499', type: '✈️' },
  { from: 'Bangalore', to: 'Chennai', price: '₹1,899', type: '✈️' },
  { from: 'Mumbai', to: 'Goa', price: '₹799', type: '🚌' },
  { from: 'Delhi', to: 'Jaipur', price: '₹499', type: '🚌' },
  { from: 'Mumbai', to: 'Pune', price: '₹349', type: '🚌' },
  { from: 'Hyderabad', to: 'Bangalore', price: '₹2,199', type: '✈️' },
]

export default function HomePage() {
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

      {/* Popular Routes */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">🔥 Popular Routes</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {POPULAR_ROUTES.map((route, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-primary-200 transition-all cursor-pointer">
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
