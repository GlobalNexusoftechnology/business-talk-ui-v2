import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction, ActionReducerMapBuilder } from '@reduxjs/toolkit'
import { Notification } from '@/types'
import apiClient from '@/lib/api-client'

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

export const getNotifications = createAsyncThunk(
  'notifications/getNotifications',
  async (page: number = 1, { rejectWithValue }: any) => {
    try {
      const response = await apiClient.getNotifications(page)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch notifications')
    }
  }
)

export const markAsRead = createAsyncThunk('notifications/markAsRead', async (id: string, { rejectWithValue }: any) => {
  try {
    const response = await apiClient.markAsRead(id)
    return response.data
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to mark as read')
  }
})

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state: NotificationsState, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload)
      if (!action.payload.is_read) {
        state.unreadCount += 1
      }
    },
  },
  extraReducers: (builder: ActionReducerMapBuilder<NotificationsState>) => {
    builder
      .addCase(getNotifications.pending, (state: NotificationsState) => {
        state.isLoading = true
      })
      .addCase(getNotifications.fulfilled, (state: NotificationsState, action: PayloadAction<any>) => {
        state.isLoading = false
        state.notifications = action.payload.notifications
        state.unreadCount = action.payload.unread_count
      })
      .addCase(getNotifications.rejected, (state: NotificationsState, action: PayloadAction<any>) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      .addCase(markAsRead.fulfilled, (state: NotificationsState, action: PayloadAction<any>) => {
        const notification = state.notifications.find((n: Notification) => n.id === action.payload.id)
        if (notification && !notification.is_read) {
          notification.is_read = true
          state.unreadCount -= 1
        }
      })
  },
})

export const { addNotification } = notificationsSlice.actions
export default notificationsSlice.reducer
