import { useState, useEffect, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setFilters, applyLocalFilters, setSortBy, setSortOrder } from '../store/searchSlice'

export default function FilterPanel() {
  const dispatch = useDispatch()
  const { results, searchType } = useSelector((state) => state.search)
  const [maxPrice, setMaxPrice] = useState(100000)
  const [maxDuration, setMaxDuration] = useState(1440)
  const [maxStops, setMaxStops] = useState(3)
  const [nonStopOnly, setNonStopOnly] = useState(false)
  const [selectedAirlines, setSelectedAirlines] = useState([])
  const [selectedOperators, setSelectedOperators] = useState([])
  const [sortBy, setLocalSortBy] = useState('price_amount')
  const [sortOrder, setLocalSortOrder] = useState('asc')

  // Extract unique airlines/operators from results
  const airlines = useMemo(() => {
    const names = new Set()
    results.forEach(r => {
      if (r.airline) names.add(r.airline)
    })
    return [...names].sort()
  }, [results])

  const operators = useMemo(() => {
    const names = new Set()
    results.forEach(r => {
      if (r.operator_name) names.add(r.operator_name)
    })
    return [...names].sort()
  }, [results])

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(setFilters({
        maxPrice, maxDuration,
        maxStops: nonStopOnly ? 0 : maxStops,
        selectedAirlines,
        selectedOperators,
      }))
      dispatch(setSortBy(sortBy))
      dispatch(setSortOrder(sortOrder))
      dispatch(applyLocalFilters())
    }, 300)
    return () => clearTimeout(timer)
  }, [maxPrice, maxDuration, maxStops, nonStopOnly, selectedAirlines, selectedOperators, sortBy, sortOrder, dispatch])

  const toggleAirline = (name) => {
    setSelectedAirlines(prev =>
      prev.includes(name) ? prev.filter(a => a !== name) : [...prev, name]
    )
  }

  const toggleOperator = (name) => {
    setSelectedOperators(prev =>
      prev.includes(name) ? prev.filter(o => o !== name) : [...prev, name]
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-5">
      <h3 className="font-semibold text-gray-900">Filters</h3>

      {/* Price */}
      <div>
        <label className="text-sm text-gray-600">Max Price: ₹{maxPrice.toLocaleString('en-IN')}</label>
        <input type="range" min="0" max="100000" value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer" />
      </div>

      {/* Duration */}
      <div>
        <label className="text-sm text-gray-600">Max Duration: {Math.floor(maxDuration/60)}h</label>
        <input type="range" min="30" max="1440" step="30" value={maxDuration}
          onChange={(e) => setMaxDuration(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer" />
      </div>

      {/* Non-stop toggle */}
      {(searchType === 'FLIGHT' || searchType === 'BUS') && (
        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-600">Non-stop only</label>
          <button onClick={() => setNonStopOnly(!nonStopOnly)}
            className={`relative w-10 h-5 rounded-full transition-colors ${nonStopOnly ? 'bg-primary-600' : 'bg-gray-300'}`}>
            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${nonStopOnly ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>
      )}

      {/* Stops slider (hidden when non-stop is on) */}
      {!nonStopOnly && (searchType === 'FLIGHT' || searchType === 'BUS') && (
        <div>
          <label className="text-sm text-gray-600">Max Stops: {maxStops}</label>
          <input type="range" min="0" max="5" value={maxStops}
            onChange={(e) => setMaxStops(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer" />
        </div>
      )}

      {/* Airline filter (flights) */}
      {searchType === 'FLIGHT' && airlines.length > 0 && (
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Airlines</label>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {airlines.map(name => (
              <label key={name} className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" checked={selectedAirlines.length === 0 || selectedAirlines.includes(name)}
                  onChange={() => toggleAirline(name)}
                  className="w-4 h-4 text-primary-600 rounded border-gray-300" />
                <span className="text-sm text-gray-700">{name}</span>
              </label>
            ))}
          </div>
          {selectedAirlines.length > 0 && (
            <button onClick={() => setSelectedAirlines([])}
              className="text-xs text-primary-600 mt-1">Clear all</button>
          )}
        </div>
      )}

      {/* Operator filter (buses) */}
      {searchType === 'BUS' && operators.length > 0 && (
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Bus Operators</label>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {operators.map(name => (
              <label key={name} className="flex items-center space-x-2 cursor-pointer">
                <input type="checkbox" checked={selectedOperators.length === 0 || selectedOperators.includes(name)}
                  onChange={() => toggleOperator(name)}
                  className="w-4 h-4 text-primary-600 rounded border-gray-300" />
                <span className="text-sm text-gray-700">{name}</span>
              </label>
            ))}
          </div>
          {selectedOperators.length > 0 && (
            <button onClick={() => setSelectedOperators([])}
              className="text-xs text-primary-600 mt-1">Clear all</button>
          )}
        </div>
      )}

      {/* Sort */}
      <div>
        <label className="text-sm text-gray-600">Sort By</label>
        <select value={sortBy} onChange={(e) => setLocalSortBy(e.target.value)}
          className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm">
          <option value="price_amount">Price</option>
          <option value="duration_minutes">Duration</option>
          <option value="rating">Rating</option>
        </select>
      </div>
      <div className="flex space-x-2">
        <button onClick={() => setLocalSortOrder('asc')}
          className={`flex-1 py-1 text-sm rounded ${sortOrder === 'asc' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100'}`}>
          Low → High
        </button>
        <button onClick={() => setLocalSortOrder('desc')}
          className={`flex-1 py-1 text-sm rounded ${sortOrder === 'desc' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100'}`}>
          High → Low
        </button>
      </div>
    </div>
  )
}
