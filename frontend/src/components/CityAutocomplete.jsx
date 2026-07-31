import { useState, useRef, useEffect } from 'react'
import { useSelector } from 'react-redux'

const INDIAN_CITIES = [
  { code: 'DEL', name: 'New Delhi', airport: 'Indira Gandhi International',
    busStops: ['Kashmere Gate ISBT', 'Anand Vihar ISBT', 'Sarai Kale Khan ISBT', 'Majnu Ka Tilla'] },
  { code: 'BOM', name: 'Mumbai', airport: 'Chhatrapati Shivaji Maharaj',
    busStops: ['Mumbai Central Bus Depot', 'Borivali Bus Stand', 'Dadar TT', 'Thane Bus Station'] },
  { code: 'BLR', name: 'Bangalore', airport: 'Kempegowda International',
    busStops: ['Majestic Bus Station', 'Shantinagar BMTC', 'Mysore Road Satellite', 'Electronic City'] },
  { code: 'MAA', name: 'Chennai', airport: 'Chennai International',
    busStops: ['CMBT Koyambedu', 'Tambaram Bus Stand', 'Broadway', 'Guindy'] },
  { code: 'CCU', name: 'Kolkata', airport: 'Netaji Subhas Chandra Bose',
    busStops: ['Esplanade Bus Terminus', 'Karunamoyee Bus Stand', 'Babughat', 'Dharmatala'] },
  { code: 'HYD', name: 'Hyderabad', airport: 'Rajiv Gandhi International',
    busStops: ['MGBS Imlibun', 'JBS Jubilee', 'Aramghar', 'Uppal Bus Depot'] },
  { code: 'AMD', name: 'Ahmedabad', airport: 'Sardar Vallabhbhai Patel',
    busStops: ['Geeta Mandir Bus Stand', 'Paldi Bus Stop', 'Naroda Bus Stand', 'SG Highway BRTS'] },
  { code: 'PNQ', name: 'Pune', airport: 'Pune Airport',
    busStops: ['Shivajinagar Bus Stand', 'Swargate Bus Stand', 'Pune Station Stand', 'Wakad Bus Stop'] },
  { code: 'GOI', name: 'Goa', airport: 'Manohar International',
    busStops: ['Kadamba Bus Stand Panaji', 'Margao KTC Bus Stand', 'Mapusa Bus Stand', 'Vasco Bus Stand'] },
  { code: 'JAI', name: 'Jaipur', airport: 'Jaipur International',
    busStops: ['Sindhi Camp Bus Stand', 'Narayan Singh Circle', 'Durgapura Bus Stop', 'Jagatpura'] },
  { code: 'LKO', name: 'Lucknow', airport: 'Chaudhary Charan Singh',
    busStops: ['Alambagh Bus Station', 'Charbagh Bus Stand', 'Kaiserbagh', 'Gomti Nagar'] },
  { code: 'COK', name: 'Kochi', airport: 'Cochin International',
    busStops: ['Ernakulam KSRTC', 'Aluva Bus Stand', 'Kaloor Bus Stop', 'Vytilla Mobility Hub'] },
  { code: 'GAU', name: 'Guwahati', airport: 'Lokpriya Gopinath Bordoloi',
    busStops: ['ISBT Guwahati', 'Paltan Bazar', 'Adabari Bus Stand', 'Khanapara'] },
  { code: 'VNS', name: 'Varanasi', airport: 'Lal Bahadur Shastri',
    busStops: ['Varanasi Cantt Bus Stand', 'Lanka Bus Stop', 'Banaras Bus Stand', 'Paharia'] },
  { code: 'IXC', name: 'Chandigarh', airport: 'Chandigarh Airport',
    busStops: ['ISBT Sector 43', 'ISBT Sector 17', 'Panchkula Bus Stand', 'Manimajra'] },
  { code: 'PAT', name: 'Patna', airport: 'Jay Prakash Narayan',
    busStops: ['Mithapur Bus Stand', 'Rajendra Nagar Bus Terminal', 'Gandhi Maidan', 'Patna Junction'] },
  { code: 'AGR', name: 'Agra', airport: 'Agra Airport',
    busStops: ['ISBT Agra', 'Idgah Bus Stand', 'Agra Fort Bus Stop', 'Bijli Ghar'] },
  { code: 'UDR', name: 'Udaipur', airport: 'Maharana Pratap',
    busStops: ['Udaipur UIT Bus Stand', 'Udaipur City Bus Depot', 'Fatehpura', 'Sukhadia Circle'] },
  { code: 'NAG', name: 'Nagpur', airport: 'Dr. Babasaheb Ambedkar',
    busStops: ['Ganeshpeth Bus Stand', 'Nagpur MSRTC Stand', 'Sitabuldi', 'Automotive Square'] },
  { code: 'IDR', name: 'Indore', airport: 'Devi Ahilyabai Holkar',
    busStops: ['Sarwate Bus Stand', 'Gangwal Bus Stand', 'Rajiv Gandhi Square', 'Vijay Nagar'] },
]

export default function CityAutocomplete({ value, onChange, placeholder }) {
  const { searchType } = useSelector((state) => state.search)
  const [query, setQuery] = useState(value || '')
  const [suggestions, setSuggestions] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef(null)

  const isBus = searchType === 'BUS'
  const isHotel = searchType === 'HOTEL'

  useEffect(() => { setQuery(value || '') }, [value])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setIsOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getSubtitle = (city) => {
    if (isBus) return city.busStops ? city.busStops[0] : ''
    if (isHotel) return `Hotels in ${city.name}`
    return city.airport
  }

  const getIcon = () => {
    if (isBus) return '🚌'
    if (isHotel) return '🏨'
    return '✈️'
  }

  const getInputIcon = () => {
    if (isBus) return '🚏'
    if (isHotel) return '📍'
    return '📍'
  }

  const filterCities = (val) => {
    const lowerVal = val.toLowerCase()
    if (isBus) {
      // For buses: expand each city into its individual bus stops
      const results = []
      INDIAN_CITIES.forEach(city => {
        if (city.name.toLowerCase().includes(lowerVal) ||
            (city.busStops && city.busStops.some(s => s.toLowerCase().includes(lowerVal)))) {
          (city.busStops || []).forEach(stop => {
            if (city.name.toLowerCase().includes(lowerVal) || stop.toLowerCase().includes(lowerVal)) {
              results.push({ code: city.code, name: city.name, busStop: stop, airport: city.airport, busStops: city.busStops })
            }
          })
        }
      })
      return results.slice(0, 8)
    }
    return INDIAN_CITIES.filter(c =>
      c.name.toLowerCase().includes(lowerVal) ||
      c.code.toLowerCase().includes(lowerVal)
    ).slice(0, 6)
  }

  const handleInput = (e) => {
    const val = e.target.value
    setQuery(val)
    if (val.length >= 1) {
      // For flights, try live API; for buses/hotels, use local data
      if (!isBus && !isHotel && val.length >= 2) {
        fetch(`/api/explore/airport-search?q=${encodeURIComponent(val)}`)
          .then(res => res.json())
          .then(data => {
            if (data.results && data.results.length > 0) {
              const apiResults = data.results.map(r => ({
                code: r.skyId,
                name: r.name,
                airport: r.subtitle,
                busStop: r.subtitle,
                entityId: r.entityId,
              }))
              setSuggestions(apiResults)
            } else {
              setSuggestions(filterCities(val))
            }
            setIsOpen(true)
          })
          .catch(() => { setSuggestions(filterCities(val)); setIsOpen(true) })
      } else {
        setSuggestions(filterCities(val))
        setIsOpen(true)
      }
    } else {
      setSuggestions([])
      setIsOpen(false)
    }
  }

  const handleSelect = (city) => {
    setQuery(city.name)
    onChange(city.name)
    setIsOpen(false)
  }

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{getInputIcon()}</span>
        <input type="text" value={query} onChange={handleInput}
          onFocus={() => { if (query.length >= 1) { setSuggestions(filterCities(query)); setIsOpen(true) }}}
          placeholder={placeholder}
          className="w-full pl-9 pr-4 py-3 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all" />
      </div>
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl max-h-72 overflow-y-auto animate-slide-up">
          <div className="p-2">
            {suggestions.map((city, idx) => (
              <button key={city.code || idx} onClick={() => handleSelect(city)}
                className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-gradient-to-r hover:from-primary-50 hover:to-accent-50 transition-all group">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 bg-primary-100 group-hover:bg-primary-200 rounded-lg flex items-center justify-center text-sm transition-colors">
                    {getIcon()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-gray-900 truncate">{city.name}</span>
                      {!isBus && <span className="text-xs font-mono text-primary-600 bg-primary-50 px-1.5 py-0.5 rounded">{city.code}</span>}
                    </div>
                    <div className="text-xs text-gray-500 truncate mt-0.5">
                      {isBus ? city.busStop : getSubtitle(city)}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
