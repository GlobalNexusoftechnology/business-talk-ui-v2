import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import notificationsReducer from './slices/notificationsSlice'
import messagesReducer from './slices/messagesSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    notifications: notificationsReducer,
    messages: messagesReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
