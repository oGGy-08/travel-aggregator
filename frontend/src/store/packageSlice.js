import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../services/api'

export const buildPackage = createAsyncThunk('packages/build', async (segments) => {
  const origin_city = segments[0]?.origin || ''
  const destination_city = segments[segments.length - 1]?.destination || ''
  const res = await api.post('/packages/', { segments, origin_city, destination_city })
  return res.data
})

const packageSlice = createSlice({
  name: 'packages',
  initialState: {
    segments: [],
    currentPackage: null,
    loading: false,
    error: null,
    conflicts: [],
  },
  reducers: {
    addSegment: (state, action) => { state.segments.push(action.payload) },
    removeSegment: (state, action) => {
      state.segments = state.segments.filter((_, i) => i !== action.payload)
    },
    clearPackage: (state) => { state.segments = []; state.currentPackage = null; state.conflicts = [] },
  },
  extraReducers: (builder) => {
    builder
      .addCase(buildPackage.pending, (state) => { state.loading = true; state.error = null })
      .addCase(buildPackage.fulfilled, (state, action) => {
        state.loading = false
        state.currentPackage = action.payload.package
        state.conflicts = []
      })
      .addCase(buildPackage.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
  },
})

export const { addSegment, removeSegment, clearPackage } = packageSlice.actions
export default packageSlice.reducer
