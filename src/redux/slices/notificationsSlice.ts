import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import apiClient from '@/lib/api-client'

interface Notification {
  id: string
  message: string
  created_on: string
  is_read: boolean
  sender?: {
    username?: string
    profile_photo?: string
  }
  type?: string
}

interface NotificationsState {
  notifications: Notification[]
  unreadCount: number
  isLoading: boolean
  error: string | null
}

const initialState: NotificationsState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
}

// ✅ GET NOTIFICATIONS
export const getNotifications = createAsyncThunk(
  'notifications/getNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.getMyNotifications()
      return res.data
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

// ✅ MARK SINGLE
export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (id: string, { rejectWithValue }) => {
    try {
      await apiClient.markNotificationAsRead(id)
      return id
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

// ✅ MARK ALL
export const markAllAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (_, { rejectWithValue }) => {
    try {
      await apiClient.markAllNotificationsRead()
      return true
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

// ✅ UNREAD COUNT
export const getUnreadCount = createAsyncThunk(
  'notifications/getUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.getUnreadNotificationCount()
      return res.data.unread
    } catch (error: any) {
      return rejectWithValue(error.message)
    }
  }
)

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // GET
      .addCase(getNotifications.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getNotifications.fulfilled, (state, action) => {
        state.isLoading = false
        state.notifications = action.payload || []
      })
      .addCase(getNotifications.rejected, (state, action: any) => {
        state.isLoading = false
        state.error = action.payload
      })

      // MARK ONE
      .addCase(markAsRead.fulfilled, (state, action) => {
        const n = state.notifications.find((x) => x.id === action.payload)
        if (n && !n.is_read) {
          n.is_read = true
          state.unreadCount -= 1
        }
      })

      // MARK ALL
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.notifications.forEach((n) => (n.is_read = true))
        state.unreadCount = 0
      })

      // UNREAD COUNT
      .addCase(getUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload
      })
  },
})

export default notificationsSlice.reducer