import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '@/redux/store';
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  NOTIFICATION_STALE_TIME_MS,
} from '@/redux/slices/notificationsSlice';
import {
  selectAllNotifications,
  selectNotificationUnreadCount,
  selectNotificationsLoading,
  selectNotificationsError,
  selectUnreadNotifications,
  selectHasMoreNotifications,
  selectIsFetchingMore,
} from '@/redux/selectors/notificationSelectors';
import type { NotificationEntity } from '@/types/notification';

/**
 * Central notification hook.
 * All notification state comes from Redux — no local state, no N+1 actor fetching.
 *
 * Stale cache rule: dispatches fetchNotifications only when the cache is stale
 * (older than NOTIFICATION_STALE_TIME_MS) or on first mount. The thunk's `condition`
 * callback enforces the same check as a second layer of protection.
 */
export const useNotifications = () => {
  const dispatch = useDispatch<AppDispatch>();

  const notifications = useSelector<RootState, NotificationEntity[]>(selectAllNotifications);
  const unreadNotifications = useSelector<RootState, NotificationEntity[]>(selectUnreadNotifications);
  const unreadCount = useSelector<RootState, number>(selectNotificationUnreadCount);
  const isLoading = useSelector<RootState, boolean>(selectNotificationsLoading);
  const isFetchingMore = useSelector<RootState, boolean>(selectIsFetchingMore);
  const hasMore = useSelector<RootState, boolean>(selectHasMoreNotifications);
  const error = useSelector<RootState, string | null>(selectNotificationsError);
  const lastFetchedAt = useSelector<RootState, number | null>(
    (state) => state.notifications.lastFetchedAt,
  );

  useEffect(() => {
    const isStale =
      !lastFetchedAt || Date.now() - lastFetchedAt >= NOTIFICATION_STALE_TIME_MS;

    if (isStale) {
      dispatch(fetchNotifications());
    }
    // Always sync unread count with the server on mount
    dispatch(fetchUnreadCount());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const handleMarkAsRead = (id: string) => {
    dispatch(markNotificationRead(id));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllNotificationsRead());
  };

  const loadMore = () => {
    if (hasMore && !isFetchingMore) {
      const nextPage = Math.floor(notifications.length / 20) + 1;
      dispatch(fetchNotifications({ page: nextPage }));
    }
  };

  return {
    // Data
    notifications,
    unreadNotifications,
    // Counts
    unreadCount,
    // Loading states
    isLoading,
    isFetchingMore,
    hasMore,
    error,
    // Actions
    handleMarkAsRead,
    handleMarkAllAsRead,
    loadMore,
  };
};