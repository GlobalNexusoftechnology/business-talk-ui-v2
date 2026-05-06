// ─── Notification domain types ─────────────────────────────────────────────
// Rule: notifications are owned exclusively by Redux (not React Query).
// Raw timestamps stored here; relative-time formatting happens in the UI layer.

export type NotificationType =
  // Social
  | 'like' | 'like_post' | 'like_blog' | 'like_story' | 'like_comment'
  | 'reaction'
  | 'comment' | 'comment_post' | 'comment_blog'
  | 'follow' | 'follow_user'
  | 'mention' | 'mention_post' | 'mention_comment'
  // Groups
  | 'group' | 'group_join_request' | 'group_invite' | 'group_accepted' | 'group_removed'
  // Chat
  | 'message' | 'conversation'
  // Moderation
  | 'moderation_alert' | 'content_removed' | 'account_warning'
  // Admin
  | 'admin_notice' | 'push_campaign'
  // System / AI (future-ready)
  | 'system' | 'system_alert' | 'ai_suggestion' | 'ai_summary'
  | string; // forward-compatible fallback

/**
 * Logical grouping category for a notification.
 * Used by selectors, the registry, and the grouped notifications UI.
 */
export type NotificationCategory =
  | 'social'
  | 'moderation'
  | 'groups'
  | 'chat'
  | 'admin'
  | 'system';

export interface NotificationActor {
  id: string;
  name: string;
  avatar: string;
}

/**
 * Normalized notification entity as stored in Redux.
 * All timestamps are raw Unix ms — format in the UI layer.
 * IDs drive EntityAdapter deduplication automatically.
 */
export interface NotificationEntity {
  id: string;
  type: NotificationType;
  message: string;
  /** Unix ms — never format here; use getTimeAgo in the component */
  createdAt: number;
  isRead: boolean;
  actor: NotificationActor;
  entityId: string;
  entityType: string;
}

export interface NotificationPaginationMeta {
  /** Current page loaded (0-indexed). Increment when loading more. */
  page: number;
  /** Whether the server has more pages available. */
  hasMore: boolean;
  /** Total notification count on the server, if returned by the API. */
  total: number | null;
}

export interface NotificationsState {
  // EntityAdapter-managed fields
  ids: string[];
  entities: Record<string, NotificationEntity>;
  // Metadata
  unreadCount: number;
  isLoading: boolean;
  /** True only when fetching page > 0 (infinite scroll). */
  isFetchingMore: boolean;
  error: string | null;
  pagination: NotificationPaginationMeta;
  /**
   * Unix ms of the last successful fetch.
   * Null means cache is stale / never fetched.
   * Used by the fetchNotifications condition to prevent redundant API calls.
   */
  lastFetchedAt: number | null;
}
