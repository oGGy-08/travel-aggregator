import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { addSegment } from '../store/packageSlice'
import ResultCard from '../components/ResultCard'
import FilterPanel from '../components/FilterPanel'
import SkeletonCard from '../components/SkeletonCard'

export default function SearchResultsPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { filteredResults, loading, error, searchType } = useSelector((state) => state.search)
  const { segments } = useSelector((state) => state.packages)
  const [toast, setToast] = useState(null)

  const handleAddToPackage = (result) => {
    dispatch(addSegment({
      segment_type: searchType,
      id: result.id,
      start_datetime: result.departure_time || result.check_in_date,
      end_datetime: result.arrival_time || result.check_out_date,
      price_amount: result.price_amount || result.total_price,
      provider: result.provider,
      summary: result.airline || result.operator_name || result.hotel_name,
      origin: result.origin_airport || result.origin_station || result.city || '',
      destination: result.destination_airport || result.destination_station || result.city || '',
    }))
    setToast(`Added to package! (${segments.length + 1} items)`)
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
      {/* Mobile filter button */}
      <div className="lg:hidden mb-4">
        <button onClick={() => document.getElementById('mobile-filters').classList.toggle('hidden')}
          className="w-full flex items-center justify-center space-x-2 bg-white border border-gray-200 rounded-xl py-3 text-sm font-medium text-gray-700 hover:bg-gray-50">
          <span>⚙️</span><span>Filters & Sort</span>
        </button>
        <div id="mobile-filters" className="hidden mt-3 animate-slide-up">
          <FilterPanel />
        </div>
      </div>

      <div className="flex gap-6">
        <aside className="w-72 flex-shrink-0 hidden lg:block sticky top-20 self-start max-h-[calc(100vh-6rem)] overflow-y-auto">
          <FilterPanel />
        </aside>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">
              {loading ? 'Searching best prices...' : `${filteredResults.length} results found`}
            </h2>
            <span className="text-xs md:text-sm text-white bg-primary-500 px-3 py-1 rounded-full font-medium">
              {searchType}
            </span>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 md:p-4 rounded-lg mb-4 flex items-center space-x-2 text-sm">
              <span>⚠️</span><span>{error}</span>
            </div>
          )}

          {/* Loading skeletons */}
          {loading && (
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          )}

          {/* Results */}
          {!loading && (
            <div className="space-y-3">
              {filteredResults.map((result) => (
                <ResultCard key={result.id} result={result} type={searchType}
                  onAddToPackage={handleAddToPackage} />
              ))}
            </div>
          )}

          {!loading && filteredResults.length === 0 && (
            <div className="text-center py-20 text-gray-500">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-lg font-medium">No results found</p>
              <p className="text-sm mt-2">Try adjusting your filters or search for a different route.</p>
            </div>
          )}
        </div>
      </div>

      {/* Toast notification */}
      {toast && (
        <div className="fixed bottom-24 right-6 bg-green-600 text-white px-5 py-3 rounded-lg shadow-xl z-50 flex items-center space-x-2 animate-bounce">
          <span>✓</span><span>{toast}</span>
        </div>
      )}

      {/* Floating package bar */}
      {segments.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 shadow-2xl p-4 z-40">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <span className="bg-primary-100 text-primary-700 px-4 py-1.5 rounded-full font-semibold text-sm">
                📦 {segments.length} item{segments.length > 1 ? 's' : ''} in package
              </span>
              <span className="text-sm text-gray-600 font-medium">
                ₹{Math.round(segments.reduce((sum, s) => sum + (s.price_amount || 0), 0)).toLocaleString('en-IN')} total
              </span>
            </div>
            <button onClick={() => navigate('/packages')}
              className="bg-gradient-to-r from-primary-600 to-accent-500 text-white px-6 py-2.5 rounded-lg font-semibold hover:from-primary-700 hover:to-accent-600 transition-all shadow-lg">
              View Package →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
