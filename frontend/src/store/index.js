import { configureStore } from '@reduxjs/toolkit'
import searchReducer from './searchSlice'
import authReducer from './authSlice'
import packageReducer from './packageSlice'

export const store = configureStore({
  reducer: {
    search: searchReducer,
    auth: authReducer,
    packages: packageReducer,
  },
})
