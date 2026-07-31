import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../services/api'

export const searchFlights = createAsyncThunk('search/flights', async (params) => {
  const res = await api.post('/search/flights', params)
  return res.data
})

export const searchBuses = createAsyncThunk('search/buses', async (params) => {
  const res = await api.post('/search/buses', params)
  return res.data
})

export const searchHotels = createAsyncThunk('search/hotels', async (params) => {
  const res = await api.post('/search/hotels', params)
  return res.data
})

const searchSlice = createSlice({
  name: 'search',
  initialState: {
    results: [],
    filteredResults: [],
    loading: false,
    error: null,
    searchType: 'FLIGHT',
    filters: {},
    sortBy: 'price_amount',
    sortOrder: 'asc',
  },
  reducers: {
    setSearchType: (state, action) => { state.searchType = action.payload },
    setFilters: (state, action) => { state.filters = action.payload },
    setSortBy: (state, action) => { state.sortBy = action.payload },
    setSortOrder: (state, action) => { state.sortOrder = action.payload },
    applyLocalFilters: (state) => {
      let results = [...state.results]
      const f = state.filters
      if (f.maxPrice) results = results.filter(r => (r.price_amount || r.total_price || 0) <= f.maxPrice)
      if (f.minPrice) results = results.filter(r => (r.price_amount || r.total_price || 0) >= f.minPrice)
      if (f.maxDuration) results = results.filter(r => r.duration_minutes <= f.maxDuration)
      if (f.maxStops !== undefined) results = results.filter(r => (r.stops ?? 0) <= f.maxStops)
      // Airline filter
      if (f.selectedAirlines && f.selectedAirlines.length > 0) {
        results = results.filter(r => f.selectedAirlines.includes(r.airline))
      }
      // Bus operator filter
      if (f.selectedOperators && f.selectedOperators.length > 0) {
        results = results.filter(r => f.selectedOperators.includes(r.operator_name))
      }
      results.sort((a, b) => {
        const key = state.sortBy
        return state.sortOrder === 'asc' ? (a[key] ?? 0) - (b[key] ?? 0) : (b[key] ?? 0) - (a[key] ?? 0)
      })
      state.filteredResults = results
    },
  },
  extraReducers: (builder) => {
    const handlePending = (state) => { state.loading = true; state.error = null }
    const handleFulfilled = (state, action) => {
      state.loading = false
      state.results = action.payload.results
      state.filteredResults = action.payload.results
    }
    const handleRejected = (state, action) => { state.loading = false; state.error = action.error.message }
    builder
      .addCase(searchFlights.pending, handlePending)
      .addCase(searchFlights.fulfilled, handleFulfilled)
      .addCase(searchFlights.rejected, handleRejected)
      .addCase(searchBuses.pending, handlePending)
      .addCase(searchBuses.fulfilled, handleFulfilled)
      .addCase(searchBuses.rejected, handleRejected)
      .addCase(searchHotels.pending, handlePending)
      .addCase(searchHotels.fulfilled, handleFulfilled)
      .addCase(searchHotels.rejected, handleRejected)
  },
})

export const { setSearchType, setFilters, setSortBy, setSortOrder, applyLocalFilters } = searchSlice.actions
export default searchSlice.reducer
