import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../services/api'

export const login = createAsyncThunk('auth/login', async (credentials) => {
  const res = await api.post('/auth/login', credentials)
  localStorage.setItem('access_token', res.data.access_token)
  return res.data
})

export const register = createAsyncThunk('auth/register', async (data) => {
  const res = await api.post('/auth/register', data)
  localStorage.setItem('access_token', res.data.access_token)
  return res.data
})

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, loading: false, error: null },
  reducers: {
    logout: (state) => {
      state.user = null
      localStorage.removeItem('access_token')
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => { state.loading = true })
      .addCase(login.fulfilled, (state, action) => { state.loading = false; state.user = action.payload.user })
      .addCase(login.rejected, (state, action) => { state.loading = false; state.error = action.error.message })
      .addCase(register.pending, (state) => { state.loading = true })
      .addCase(register.fulfilled, (state, action) => { state.loading = false; state.user = action.payload.user })
      .addCase(register.rejected, (state, action) => { state.loading = false; state.error = action.error.message })
  },
})

export const { logout } = authSlice.actions
export default authSlice.reducer
