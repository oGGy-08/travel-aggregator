import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { searchFlights, searchBuses, searchHotels, setSearchType } from '../store/searchSlice'
import CityAutocomplete from './CityAutocomplete'

const TABS = [
  { id: 'FLIGHT', label: '✈️ Flights' },
  { id: 'BUS', label: '🚌 Buses' },
  { id: 'HOTEL', label: '🏨 Hotels' },
  { id: 'PACKAGE', label: '📦 Packages' },
]

export default function SearchForm() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { searchType } = useSelector((state) => state.search)
  const [origin, setOrigin] = useState('Delhi')
  const [destination, setDestination] = useState('Mumbai')
  const [departureDate, setDepartureDate] = useState('')
  const [returnDate, setReturnDate] = useState('')
  const [passengers, setPassengers] = useState(1)
  const [tripType, setTripType] = useState('oneway') // oneway, return
  const [cabinClass, setCabinClass] = useState('economy')

  const handleSearch = (e) => {
    e.preventDefault()
    const params = {
      origin, destination, departure_date: departureDate,
      return_date: returnDate, passengers, cabin_class: cabinClass,
    }
    if (searchType === 'FLIGHT') dispatch(searchFlights(params))
    else if (searchType === 'BUS') dispatch(searchBuses(params))
    else if (searchType === 'HOTEL') dispatch(searchHotels({
      ...params, check_in_date: departureDate, check_out_date: returnDate }))
    else dispatch(searchFlights(params))
    navigate('/search')
  }

  const swapCities = () => {
    const temp = origin
    setOrigin(destination)
    setDestination(temp)
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 max-w-4xl mx-auto">
      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
        {TABS.map((tab) => (
          <button key={tab.id} onClick={() => dispatch(setSearchType(tab.id))}
            className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all
              ${searchType === tab.id ? 'bg-white shadow-sm text-primary-600' : 'text-gray-600 hover:text-gray-900'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Trip type & Class */}
      {searchType === 'FLIGHT' && (
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            <button onClick={() => setTripType('oneway')}
              className={`px-3 py-1.5 text-sm rounded-md ${tripType === 'oneway' ? 'bg-white shadow-sm font-medium' : 'text-gray-600'}`}>
              One Way
            </button>
            <button onClick={() => setTripType('return')}
              className={`px-3 py-1.5 text-sm rounded-md ${tripType === 'return' ? 'bg-white shadow-sm font-medium' : 'text-gray-600'}`}>
              Round Trip
            </button>
          </div>
          <select value={cabinClass} onChange={(e) => setCabinClass(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-1.5">
            <option value="economy">Economy</option>
            <option value="premium_economy">Premium Economy</option>
            <option value="business">Business</option>
            <option value="first">First Class</option>
          </select>
        </div>
      )}

      <form onSubmit={handleSearch} className="space-y-4">
        {/* Origin / Destination */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 relative">
          <CityAutocomplete value={origin} onChange={setOrigin} placeholder="From — City or Airport" />
          <button type="button" onClick={swapCities}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-white border-2 border-gray-200 rounded-full w-8 h-8 flex items-center justify-center hover:border-primary-400 hover:bg-primary-50 transition-colors hidden md:flex">
            ⇄
          </button>
          <CityAutocomplete value={destination} onChange={setDestination} placeholder="To — City or Airport" />
        </div>

        {/* Dates & Passengers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              {searchType === 'HOTEL' ? 'Check-in' : 'Departure'}
            </label>
            <input type="date" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">
              {searchType === 'HOTEL' ? 'Check-out' : 'Return'}
            </label>
            <input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)}
              disabled={searchType === 'FLIGHT' && tripType === 'oneway'}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed" />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Travellers</label>
            <input type="number" min="1" max="9" value={passengers}
              onChange={(e) => setPassengers(parseInt(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
          </div>
        </div>

        <button type="submit"
          className="w-full bg-gradient-to-r from-primary-600 to-accent-500 text-white py-3.5 rounded-lg font-semibold hover:from-primary-700 hover:to-accent-600 transition-all shadow-lg hover:shadow-xl">
          🔍 Search {searchType === 'FLIGHT' ? 'Flights' : searchType === 'BUS' ? 'Buses' : searchType === 'HOTEL' ? 'Hotels' : 'Packages'}
        </button>
      </form>
    </div>
  )
}
