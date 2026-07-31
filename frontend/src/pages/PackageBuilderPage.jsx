import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { removeSegment, clearPackage, buildPackage } from '../store/packageSlice'

const TYPE_ICONS = { FLIGHT: '✈️', BUS: '🚌', HOTEL: '🏨' }
const TYPE_COLORS = { FLIGHT: 'bg-blue-100 text-blue-700', BUS: 'bg-green-100 text-green-700', HOTEL: 'bg-purple-100 text-purple-700' }

export default function PackageBuilderPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { segments, currentPackage, loading, error } = useSelector((state) => state.packages)

  const handleBuild = () => {
    if (segments.length < 2) return
    dispatch(buildPackage(segments))
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📦 Package Builder</h1>
          <p className="text-sm text-gray-500 mt-1">Combine your travel segments and save money</p>
        </div>
        <div className="flex space-x-3">
          <button onClick={() => navigate('/search')}
            className="text-sm border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50">
            + Add More
          </button>
          <button onClick={() => dispatch(clearPackage())}
            className="text-sm text-red-500 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50">
            Clear All
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Segments timeline */}
        <div className="lg:col-span-2">
          {segments.length === 0 ? (
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center">
              <div className="text-5xl mb-4">📦</div>
              <p className="text-lg font-medium text-gray-700 mb-2">No segments added yet</p>
              <p className="text-sm text-gray-500 mb-4">Search for flights, buses, or hotels and click "+ Package"</p>
              <button onClick={() => navigate('/')}
                className="bg-primary-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-700">
                Start Searching
              </button>
            </div>
          ) : (
            <div className="space-y-0">
              {segments.map((seg, idx) => (
                <div key={idx} className="relative">
                  {/* Timeline connector */}
                  {idx < segments.length - 1 && (
                    <div className="absolute left-6 top-16 w-0.5 h-6 bg-gray-200"></div>
                  )}
                  <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between hover:shadow-sm transition-shadow">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${TYPE_COLORS[seg.segment_type] || 'bg-gray-100'}`}>
                        {TYPE_ICONS[seg.segment_type] || '📍'}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-gray-900">{seg.summary}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[seg.segment_type]}`}>
                            {seg.segment_type}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500 mt-0.5">
                          {seg.origin && seg.destination ? `${seg.origin} → ${seg.destination}` : seg.provider}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="font-bold text-primary-600">
                        ₹{Math.round(seg.price_amount || 0).toLocaleString('en-IN')}
                      </span>
                      <button onClick={() => dispatch(removeSegment(idx))}
                        className="w-8 h-8 rounded-full bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition-colors">
                        ×
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {segments.length >= 2 && (
            <button onClick={handleBuild} disabled={loading}
              className="w-full mt-6 bg-gradient-to-r from-primary-600 to-accent-500 text-white py-4 rounded-xl font-semibold hover:from-primary-700 hover:to-accent-600 disabled:opacity-50 shadow-lg transition-all text-lg">
              {loading ? '⏳ Building Package...' : '🎉 Build Package & Save'}
            </button>
          )}

          {error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl">
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* Summary panel */}
        <div className="space-y-4">
          {/* Live price summary */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Price Summary</h3>
            <div className="space-y-2 text-sm">
              {segments.map((seg, idx) => (
                <div key={idx} className="flex justify-between text-gray-600">
                  <span className="truncate mr-2">{TYPE_ICONS[seg.segment_type]} {seg.summary}</span>
                  <span className="font-medium whitespace-nowrap">₹{Math.round(seg.price_amount || 0).toLocaleString('en-IN')}</span>
                </div>
              ))}
              <div className="border-t pt-2 flex justify-between font-semibold text-gray-900">
                <span>Subtotal</span>
                <span>₹{Math.round(segments.reduce((s, seg) => s + (seg.price_amount || 0), 0)).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Package result */}
          {currentPackage && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5">
              <h3 className="font-semibold text-green-900 mb-3 flex items-center space-x-2">
                <span>🎉</span><span>Package Built!</span>
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Individual Total:</span>
                  <span className="line-through text-gray-400">
                    ₹{Math.round(currentPackage.individual_price_sum || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Package Price:</span>
                  <span className="font-bold text-green-700 text-lg">
                    ₹{Math.round(currentPackage.total_price || 0).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between bg-green-100 rounded-lg px-3 py-2">
                  <span className="text-green-800 font-medium">You Save:</span>
                  <span className="font-bold text-green-700">
                    ₹{Math.round(currentPackage.savings_amount || 0).toLocaleString('en-IN')} ({currentPackage.savings_percentage}%)
                  </span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-gray-600">Compatibility:</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{width: `${currentPackage.compatibility_score}%`}}></div>
                    </div>
                    <span className="font-semibold text-sm">{currentPackage.compatibility_score}/100</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Tips</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Add at least 2 segments to build a package</li>
              <li>• Mix flights + hotels for best savings</li>
              <li>• Segments must not have overlapping times</li>
              <li>• Hotel check-in must be after arrival</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
