import { useState, useRef, useEffect } from 'react'

const INDIAN_CITIES = [
  { code: 'DEL', name: 'New Delhi', airport: 'Indira Gandhi International', type: 'city' },
  { code: 'BOM', name: 'Mumbai', airport: 'Chhatrapati Shivaji Maharaj', type: 'city' },
  { code: 'BLR', name: 'Bangalore', airport: 'Kempegowda International', type: 'city' },
  { code: 'MAA', name: 'Chennai', airport: 'Chennai International', type: 'city' },
  { code: 'CCU', name: 'Kolkata', airport: 'Netaji Subhas Chandra Bose', type: 'city' },
  { code: 'HYD', name: 'Hyderabad', airport: 'Rajiv Gandhi International', type: 'city' },
  { code: 'AMD', name: 'Ahmedabad', airport: 'Sardar Vallabhbhai Patel', type: 'city' },
  { code: 'PNQ', name: 'Pune', airport: 'Pune Airport', type: 'city' },
  { code: 'GOI', name: 'Goa', airport: 'Manohar International', type: 'city' },
  { code: 'JAI', name: 'Jaipur', airport: 'Jaipur International', type: 'city' },
  { code: 'LKO', name: 'Lucknow', airport: 'Chaudhary Charan Singh', type: 'city' },
  { code: 'COK', name: 'Kochi', airport: 'Cochin International', type: 'city' },
  { code: 'GAU', name: 'Guwahati', airport: 'Lokpriya Gopinath Bordoloi', type: 'city' },
  { code: 'VNS', name: 'Varanasi', airport: 'Lal Bahadur Shastri', type: 'city' },
  { code: 'IXC', name: 'Chandigarh', airport: 'Chandigarh Airport', type: 'city' },
  { code: 'PAT', name: 'Patna', airport: 'Jay Prakash Narayan', type: 'city' },
  { code: 'BBI', name: 'Bhubaneswar', airport: 'Biju Patnaik', type: 'city' },
  { code: 'IXB', name: 'Bagdogra', airport: 'Bagdogra Airport', type: 'city' },
  { code: 'SXR', name: 'Srinagar', airport: 'Sheikh ul-Alam', type: 'city' },
  { code: 'UDR', name: 'Udaipur', airport: 'Maharana Pratap', type: 'city' },
  { code: 'IXR', name: 'Ranchi', airport: 'Birsa Munda Airport', type: 'city' },
  { code: 'AGR', name: 'Agra', airport: 'Agra Airport', type: 'city' },
  { code: 'TRV', name: 'Thiruvananthapuram', airport: 'Trivandrum International', type: 'city' },
  { code: 'IDR', name: 'Indore', airport: 'Devi Ahilyabai Holkar', type: 'city' },
  { code: 'NAG', name: 'Nagpur', airport: 'Dr. Babasaheb Ambedkar', type: 'city' },
  { code: 'RPR', name: 'Raipur', airport: 'Swami Vivekananda', type: 'city' },
  { code: 'DED', name: 'Dehradun', airport: 'Jolly Grant Airport', type: 'city' },
  { code: 'VTZ', name: 'Visakhapatnam', airport: 'Visakhapatnam Airport', type: 'city' },
  { code: 'IXM', name: 'Madurai', airport: 'Madurai Airport', type: 'city' },
  { code: 'STV', name: 'Surat', airport: 'Surat Airport', type: 'city' },
]

export default function CityAutocomplete({ value, onChange, placeholder }) {
  const [query, setQuery] = useState(value || '')
  const [suggestions, setSuggestions] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const wrapperRef = useRef(null)

  useEffect(() => { setQuery(value || '') }, [value])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setIsOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInput = (e) => {
    const val = e.target.value
    setQuery(val)
    if (val.length >= 1) {
      const filtered = INDIAN_CITIES.filter(c =>
        c.name.toLowerCase().includes(val.toLowerCase()) ||
        c.code.toLowerCase().includes(val.toLowerCase()) ||
        c.airport.toLowerCase().includes(val.toLowerCase())
      ).slice(0, 6)
      setSuggestions(filtered)
      setIsOpen(true)
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
      <input type="text" value={query} onChange={handleInput}
        onFocus={() => query.length >= 1 && setSuggestions(
          INDIAN_CITIES.filter(c => c.name.toLowerCase().includes(query.toLowerCase())).slice(0, 6)
        ) && setIsOpen(true)}
        placeholder={placeholder}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((city) => (
            <button key={city.code} onClick={() => handleSelect(city)}
              className="w-full text-left px-4 py-3 hover:bg-primary-50 border-b border-gray-50 last:border-0">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-medium text-gray-900">{city.name}</span>
                  <span className="text-xs text-gray-500 ml-2">{city.code}</span>
                </div>
                <span className="text-xs text-gray-400">✈️</span>
              </div>
              <div className="text-xs text-gray-500">{city.airport}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
