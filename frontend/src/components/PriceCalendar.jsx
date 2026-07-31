import { useEffect, useState } from 'react'
import api from '../services/api'

export default function PriceCalendar({ origin, destination }) {
  const [calendar, setCalendar] = useState([])
  const [cheapest, setCheapest] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!origin || !destination) return
    setLoading(true)
    api.get(`/explore/price-calendar?origin=${origin}&destination=${destination}`)
      .then(res => {
        setCalendar(res.data.calendar || [])
        setCheapest({
          date: res.data.cheapest_date,
          price: res.data.cheapest_price,
        })
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [origin, destination])

  if (loading || calendar.length === 0) return null

  const maxPrice = Math.max(...calendar.map(d => d.price))
  const minPrice = Math.min(...calendar.map(d => d.price))

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-gray-900 text-sm">📅 Price Calendar</h3>
        {cheapest && (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
            Cheapest: {new Date(cheapest.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} — ₹{cheapest.price.toLocaleString('en-IN')}
          </span>
        )}
      </div>
      <div className="flex items-end space-x-0.5 h-16 overflow-x-auto">
        {calendar.slice(0, 14).map((day, i) => {
          const height = ((day.price - minPrice) / (maxPrice - minPrice)) * 100
          const isMin = day.is_cheapest
          return (
            <div key={i} className="flex flex-col items-center flex-1 min-w-[20px]" title={`${day.date}: ₹${day.price}`}>
              <div
                className={`w-full rounded-t transition-all ${isMin ? 'bg-green-500' : 'bg-primary-200 hover:bg-primary-400'}`}
                style={{ height: `${Math.max(height, 10)}%` }}
              ></div>
              <span className="text-[9px] text-gray-400 mt-1">
                {new Date(day.date).getDate()}
              </span>
            </div>
          )
        })}
      </div>
      <div className="flex justify-between text-[10px] text-gray-400 mt-1">
        <span>₹{minPrice.toLocaleString('en-IN')}</span>
        <span>Next 14 days</span>
        <span>₹{maxPrice.toLocaleString('en-IN')}</span>
      </div>
    </div>
  )
}
