export default function CompareModal({ items, onClose, type }) {
  if (!items || items.length < 2) return null

  const formatTime = (iso) => iso ? new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'
  const formatDuration = (mins) => mins ? `${Math.floor(mins/60)}h ${mins%60}m` : '--'

  const fields = type === 'FLIGHT'
    ? [
        { label: 'Airline', key: 'airline' },
        { label: 'Flight', key: 'flight_number' },
        { label: 'Departure', key: 'departure_time', fmt: formatTime },
        { label: 'Arrival', key: 'arrival_time', fmt: formatTime },
        { label: 'Duration', key: 'duration_minutes', fmt: formatDuration },
        { label: 'Stops', key: 'stops' },
        { label: 'Class', key: 'cabin_class' },
        { label: 'Price', key: 'price_amount', fmt: (v) => `₹${Math.round(v).toLocaleString('en-IN')}` },
        { label: 'Provider', key: 'provider' },
        { label: 'Refundable', key: 'refundable', fmt: (v) => v ? '✅ Yes' : '❌ No' },
      ]
    : type === 'BUS'
    ? [
        { label: 'Operator', key: 'operator_name' },
        { label: 'Type', key: 'bus_type' },
        { label: 'Departure', key: 'departure_time', fmt: formatTime },
        { label: 'Duration', key: 'duration_minutes', fmt: formatDuration },
        { label: 'Stops', key: 'stops' },
        { label: 'Seats Left', key: 'seats_available' },
        { label: 'Rating', key: 'rating', fmt: (v) => `⭐ ${v}` },
        { label: 'Price', key: 'price_amount', fmt: (v) => `₹${Math.round(v).toLocaleString('en-IN')}` },
      ]
    : [
        { label: 'Hotel', key: 'hotel_name' },
        { label: 'Stars', key: 'star_rating', fmt: (v) => '⭐'.repeat(v) },
        { label: 'Rating', key: 'user_rating', fmt: (v) => `${v}/10` },
        { label: 'Room', key: 'room_type' },
        { label: 'Per Night', key: 'price_per_night', fmt: (v) => `₹${Math.round(v).toLocaleString('en-IN')}` },
        { label: 'Total', key: 'total_price', fmt: (v) => `₹${Math.round(v).toLocaleString('en-IN')}` },
        { label: 'Cancellation', key: 'cancellation_policy' },
      ]

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[80vh] overflow-auto p-6" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Compare ({items.length} items)</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-3 text-gray-500 font-medium">Field</th>
                {items.map((item, i) => (
                  <th key={i} className="text-left py-2 px-3 font-semibold">Option {i+1}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fields.map((field) => (
                <tr key={field.key} className="border-b border-gray-100">
                  <td className="py-2 px-3 text-gray-500">{field.label}</td>
                  {items.map((item, i) => {
                    const val = item[field.key]
                    const display = field.fmt ? field.fmt(val) : (val ?? '--')
                    const isCheapest = field.key === 'price_amount' || field.key === 'total_price'
                    const minPrice = isCheapest ? Math.min(...items.map(it => it[field.key] || Infinity)) : null
                    return (
                      <td key={i} className={`py-2 px-3 ${isCheapest && val === minPrice ? 'text-green-600 font-bold' : ''}`}>
                        {display}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
