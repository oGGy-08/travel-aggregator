import { useState } from 'react'

export default function ResultCard({ result, type, onAddToPackage }) {
  const [expanded, setExpanded] = useState(false)

  const formatTime = (iso) => {
    if (!iso) return '--'
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const formatDuration = (mins) => {
    if (!mins) return '--'
    const h = Math.floor(mins / 60)
    const m = mins % 60
    return `${h}h ${m}m`
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-primary-200 transition-all cursor-pointer"
      onClick={() => setExpanded(!expanded)}>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            {type === 'FLIGHT' && (
              <>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="w-8 h-8 bg-primary-50 rounded-full flex items-center justify-center text-sm">✈️</span>
                  <span className="font-semibold text-gray-900">{result.airline}</span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded font-mono">
                    {result.flight_number}
                  </span>
                  {result.refundable && (
                    <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded">Refundable</span>
                  )}
                </div>
                <div className="flex items-center space-x-3 text-sm mt-2">
                  <div className="text-center">
                    <div className="font-bold text-lg text-gray-900">{formatTime(result.departure_time)}</div>
                    <div className="text-xs text-gray-500">{result.origin_airport}</div>
                  </div>
                  <div className="flex-1 flex flex-col items-center px-2">
                    <span className="text-xs text-gray-500">{formatDuration(result.duration_minutes)}</span>
                    <div className="w-full h-px bg-gray-300 my-1 relative">
                      {result.stops > 0 && (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-orange-400 rounded-full"></div>
                      )}
                    </div>
                    <span className={`text-xs ${result.stops === 0 ? 'text-green-600 font-medium' : 'text-orange-500'}`}>
                      {result.stops === 0 ? 'Non-stop' : `${result.stops} stop${result.stops > 1 ? 's' : ''}`}
                    </span>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-lg text-gray-900">{formatTime(result.arrival_time)}</div>
                    <div className="text-xs text-gray-500">{result.destination_airport}</div>
                  </div>
                </div>
              </>
            )}

            {type === 'BUS' && (
              <>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="w-8 h-8 bg-green-50 rounded-full flex items-center justify-center text-sm">🚌</span>
                  <span className="font-semibold text-gray-900">{result.operator_name}</span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{result.bus_type}</span>
                </div>
                <div className="flex items-center space-x-3 text-sm mt-2">
                  <div className="text-center">
                    <div className="font-bold text-lg text-gray-900">{formatTime(result.departure_time)}</div>
                    <div className="text-xs text-gray-500 max-w-[80px] truncate">{result.origin_station}</div>
                  </div>
                  <div className="flex-1 flex flex-col items-center px-2">
                    <span className="text-xs text-gray-500">{formatDuration(result.duration_minutes)}</span>
                    <div className="w-full h-px bg-gray-300 my-1"></div>
                    <span className="text-xs text-gray-500">
                      {result.stops === 0 ? 'Non-stop' : `${result.stops} stop${result.stops > 1 ? 's' : ''}`}
                    </span>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-lg text-gray-900">{formatTime(result.arrival_time)}</div>
                    <div className="text-xs text-gray-500 max-w-[80px] truncate">{result.destination_station}</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {(result.amenities || []).slice(0, 4).map((a) => (
                    <span key={a} className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full">{a}</span>
                  ))}
                  {result.seats_available && (
                    <span className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full">
                      {result.seats_available} seats left
                    </span>
                  )}
                </div>
              </>
            )}

            {type === 'HOTEL' && (
              <>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="w-8 h-8 bg-purple-50 rounded-full flex items-center justify-center text-sm">🏨</span>
                  <span className="font-semibold text-gray-900">{result.hotel_name}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                  <span>{'⭐'.repeat(result.star_rating || 0)}</span>
                  <span className="bg-primary-100 text-primary-700 px-1.5 py-0.5 rounded text-xs font-bold">
                    {result.user_rating}/10
                  </span>
                  <span className="text-xs text-gray-400">({result.review_count} reviews)</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">📍 {result.address}</div>
                <div className="text-xs text-gray-600 mt-1">{result.room_type} · {result.cancellation_policy}</div>
              </>
            )}
          </div>

          {/* Price section */}
          <div className="text-right ml-4 flex-shrink-0">
            <div className="text-2xl font-bold text-primary-600">
              ₹{Math.round(result.price_amount || result.total_price || 0).toLocaleString('en-IN')}
            </div>
            {type === 'HOTEL' && result.price_per_night && (
              <div className="text-xs text-gray-500">₹{Math.round(result.price_per_night).toLocaleString('en-IN')}/night</div>
            )}
            <div className="text-xs text-gray-400 mt-0.5">{result.provider}</div>
            {onAddToPackage && (
              <button onClick={(e) => { e.stopPropagation(); onAddToPackage(result) }}
                className="mt-2 text-xs bg-gradient-to-r from-accent-500 to-primary-500 text-white px-3 py-1.5 rounded-lg hover:shadow-md transition-all font-medium">
                + Package
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-gray-100 px-4 py-3 bg-gray-50 rounded-b-xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            {result.cabin_class && (
              <div><span className="text-gray-500">Class:</span> <span className="font-medium">{result.cabin_class}</span></div>
            )}
            {result.baggage_included && (
              <div><span className="text-gray-500">Baggage:</span> <span className="font-medium">{result.baggage_included.checked} checked</span></div>
            )}
            {result.rating && (
              <div><span className="text-gray-500">Rating:</span> <span className="font-medium">⭐ {result.rating}</span></div>
            )}
            {result.price_currency && (
              <div><span className="text-gray-500">Currency:</span> <span className="font-medium">{result.price_currency}</span></div>
            )}
          </div>
          <div className="flex items-center space-x-3 mt-3">
            {result.booking_url && (
              <a href={result.booking_url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
                <span>🔗</span><span>Book on {result.provider}</span>
              </a>
            )}
            <button onClick={(e) => { e.stopPropagation(); onAddToPackage && onAddToPackage(result) }}
              className="inline-flex items-center space-x-1 bg-primary-100 text-primary-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-200 transition-colors">
              <span>📦</span><span>Add to Package</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
