import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import notificationsReducer from './slices/notificationsSlice'
import chatReducer from './slices/chatSlice'
import pushReducer from './slices/pushSlice'
import { websocketMiddleware } from './middleware/websocketMiddleware'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    notifications: notificationsReducer,
    chat: chatReducer,
    push: pushReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // websocketMiddleware intercepts virtual actions before they reach
      // reducers, so the non-serializable wsManager ref never enters state.
      serializableCheck: {
        ignoredActions: ['ws/emitTyping', 'ws/emitMessage'],
      },
    }).concat(websocketMiddleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

