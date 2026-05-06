import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import type { NotificationEntity, NotificationCategory } from '@/types/notification';
import { notificationsAdapter } from '../slices/notificationsSlice';
import { getCategoryForType, CATEGORY_META } from '@/lib/notificationRegistry';

// ─── Base adapter selectors ───────────────────────────────────────────────────
// These derive from the EntityAdapter's normalized ids/entities.

const adapterSelectors = notificationsAdapter.getSelectors(
  (state: RootState) => state.notifications,
);

export const selectAllNotifications = adapterSelectors.selectAll;
export const selectNotificationById = adapterSelectors.selectById;
export const selectNotificationIds = adapterSelectors.selectIds;
export const selectNotificationTotal = adapterSelectors.selectTotal;

// ─── Metadata selectors ───────────────────────────────────────────────────────

export const selectNotificationsLoading = (state: RootState): boolean =>
  state.notifications.isLoading;

export const selectIsFetchingMore = (state: RootState): boolean =>
  state.notifications.isFetchingMore;

export const selectNotificationsError = (state: RootState): string | null =>
  state.notifications.error;

export const selectNotificationPagination = (state: RootState) =>
  state.notifications.pagination;

export const selectHasMoreNotifications = (state: RootState): boolean =>
  state.notifications.pagination.hasMore;

export const selectNotificationUnreadCount = (state: RootState): number =>
  state.notifications.unreadCount;

export const selectNotificationsLastFetchedAt = (state: RootState): number | null =>
  state.notifications.lastFetchedAt;

// ─── Derived selectors (memoized) ─────────────────────────────────────────────

/**
 * All unread notifications, newest-first.
 * Memoized — only recomputes when the notifications entities change.
 */
export const selectUnreadNotifications = createSelector(
  selectAllNotifications,
  (notifications): NotificationEntity[] =>
    notifications.filter((n) => !n.isRead),
);

/**
 * The N most recent notifications regardless of read state.
 * Useful for notification drop-down previews.
 */
export const selectRecentNotifications = (count = 5) =>
  createSelector(
    selectAllNotifications,
    (notifications): NotificationEntity[] => notifications.slice(0, count),
  );

// ─── Category helpers ─────────────────────────────────────────────────────────
// getCategoryForType is now sourced from notificationRegistry — no local switch.

/**
 * All notifications by category (social / content / system).
 * Factory pattern creates an independent memoized selector per category.
 *
 * Usage:
 *   const selector = useMemo(() => selectNotificationsByCategory('social'), []);
 *   const socialNotifs = useAppSelector(selector);
 */
export const selectNotificationsByCategory = (category: NotificationCategory) =>
  createSelector(
    selectAllNotifications,
    (notifications): NotificationEntity[] =>
      notifications.filter((n) => getCategoryForType(n.type) === category),
  );

// ─── Grouped notifications (req 11) ───────────────────────────────────────────

export interface NotificationGroup {
  category: NotificationCategory;
  label: string;
  notifications: NotificationEntity[];
}

/**
 * All notifications grouped into social / content / system buckets.
 * Groups with no notifications are omitted.
 * Memoized — only recomputes when entities change.
 */
export const selectGroupedNotifications = createSelector(
  selectAllNotifications,
  (notifications): NotificationGroup[] => {
    const buckets = new Map<NotificationCategory, NotificationEntity[]>();

    for (const n of notifications) {
      const cat = getCategoryForType(n.type);
      const existing = buckets.get(cat);
      if (existing) {
        existing.push(n);
      } else {
        buckets.set(cat, [n]);
      }
    }

    return CATEGORY_META
      .filter(({ category }) => buckets.has(category))
      .map(({ category, label }) => ({
        category,
        label,
        notifications: buckets.get(category)!,
      }));
  },
);

/**
 * Unread count derived from loaded entities.
 * Use `selectNotificationUnreadCount` for the authoritative server value.
 * This derived count is useful when the server value hasn't been fetched yet.
 */
export const selectDerivedUnreadCount = createSelector(
  selectAllNotifications,
  (notifications): number => notifications.filter((n) => !n.isRead).length,
);
