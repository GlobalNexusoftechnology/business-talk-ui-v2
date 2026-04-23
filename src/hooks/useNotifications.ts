import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from '@/redux/store'
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
} from '@/redux/slices/notificationsSlice'

export const useNotifications = () => {
  const dispatch = useDispatch<AppDispatch>()

  const { notifications, unreadCount, isLoading, error } = useSelector(
    (state: RootState) => state.notifications
  )

  useEffect(() => {
    dispatch(getNotifications())
    dispatch(getUnreadCount())
  }, [dispatch])

  const handleMarkAsRead = (id: string) => {
    dispatch(markAsRead(id))
  }

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead())
  }

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    handleMarkAsRead,
    handleMarkAllAsRead,
  }
}