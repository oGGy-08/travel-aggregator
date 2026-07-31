import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import SearchResultsPage from './pages/SearchResultsPage'
import PackageBuilderPage from './pages/PackageBuilderPage'
import BookingPage from './pages/BookingPage'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="/flights/:origin-:destination/:date" element={<SearchResultsPage />} />
          <Route path="/buses/:origin-:destination/:date" element={<SearchResultsPage />} />
          <Route path="/hotels/:destination/:checkin/:checkout" element={<SearchResultsPage />} />
          <Route path="/packages" element={<PackageBuilderPage />} />
          <Route path="/booking" element={<BookingPage />} />
        </Routes>
      </main>
    </div>
  )
}
