import { configureStore } from '@reduxjs/toolkit'
import themeReducer from './slices/themeSlice'
import driverReducer from './slices/driverSlice'

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    driver: driverReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
