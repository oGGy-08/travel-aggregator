import { useState, useEffect } from 'react'

const MAX_RECENT = 5

export default function useRecentlyViewed() {
  const [recent, setRecent] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('recentlyViewed') || '[]')
    } catch { return [] }
  })

  useEffect(() => {
    localStorage.setItem('recentlyViewed', JSON.stringify(recent))
  }, [recent])

  const addViewed = (item) => {
    setRecent(prev => {
      const filtered = prev.filter(r => r.id !== item.id)
      return [item, ...filtered].slice(0, MAX_RECENT)
    })
  }

  const clearRecent = () => setRecent([])

  return { recent, addViewed, clearRecent }
}
