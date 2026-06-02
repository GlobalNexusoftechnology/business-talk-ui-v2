import {
  createSlice,
  createAsyncThunk,
  createEntityAdapter,
  type PayloadAction,
} from '@reduxjs/toolkit';
import apiClient from '@/lib/api-client';
import type {
  NotificationEntity,
  NotificationsState,
} from '@/types/notification';

// ─── Constants ────────────────────────────────────────────────────────────────

/** Minimum time (ms) before the same page is re-fetched from the API. */
export const NOTIFICATION_STALE_TIME_MS = 5 * 60 * 1000; // 5 minutes
export const NOTIFICATIONS_PER_PAGE = 20;

// ─── Entity Adapter ───────────────────────────────────────────────────────────
// IDs are strings; sortComparer keeps ids[] in newest-first order at all times.

export const notificationsAdapter = createEntityAdapter<NotificationEntity>({
  sortComparer: (a: NotificationEntity, b: NotificationEntity) => b.createdAt - a.createdAt,
});

// ─── Parse helper ─────────────────────────────────────────────────────────────
// Converts raw API/WS payload → NotificationEntity.
// Handles both future format (embedded actor object) and legacy (actor_id only).
// NO getUserById calls — if actor data isn't present, defaults to "Unknown".

export const parseApiNotification = (input: any): NotificationEntity => {
  // API row may be wrapped: { notification, display_message, avatars, ... }
  // WS payload may be direct: { id, type, message, ... }
  const n = input?.notification ?? input ?? {};

  const avatarActor = Array.isArray(input?.avatars) ? input.avatars[0] : null;
  const snapshotActor = Array.isArray(n.actor_snapshots) ? n.actor_snapshots[0] : null;

  // Prefer explicit actor object, then avatars/snapshots, then legacy flat actor fields.
  const actorRaw =
    n.actor ??
    n.sender ??
    avatarActor ??
    snapshotActor ??
    {
      id: n.actor_id ?? '',
      full_name: n.actor_name ?? '',
      profile_photo: n.actor_avatar ?? null,
    };

  const actorName =
    (actorRaw?.full_name as string) ||
    (actorRaw?.name as string) ||
    (actorRaw?.username as string) ||
    'Unknown';

  return {
    id: (n.id as string) ?? '',
    type: (n.type as string) ?? 'unknown',
    message: (input?.display_message as string) ?? (n.message as string) ?? '',
    createdAt: Number(n.created_on ?? n.createdAt ?? n.created_at ?? 0),
    isRead: n.is_read === true,
    actor: {
      id: (actorRaw?.id as string) ?? '',
      name: actorName,
      avatar:
        (actorRaw?.profile_photo as string) ??
        (actorRaw?.avatar as string) ??
        `https://ui-avatars.com/api/?name=${encodeURIComponent(actorName)}`,
    },
    entityId: (n.entity_id as string) ?? '',
    entityType: (n.entity_type as string) ?? '',
  };
};

// ─── Async Thunks ─────────────────────────────────────────────────────────────

type FetchPayload = {
  entities: NotificationEntity[];
  page: number;
  hasMore: boolean;
  total: number | null;
};

type FetchArg = { page?: number; force?: boolean } | undefined;

/**
 * Fetches notifications from the API.
 *
 * Stale cache prevention (req 13): the `condition` callback skips the API call
 * entirely when data was fetched within NOTIFICATION_STALE_TIME_MS, unless
 * force=true or page > 0 (infinite scroll load-more).
 *
 * React Query vs Redux sync rule (req 12): notifications are Redux-only.
 * Never put notification data in React Query cache.
 */
export const fetchNotifications = createAsyncThunk<
  FetchPayload,
  FetchArg,
  { state: { notifications: NotificationsState } }
>(
  'notifications/fetch',
  async (params, { rejectWithValue }) => {
    const page = params?.page ?? 0;

    try {
      const res = await apiClient.getMyNotifications();
      const body = res.data ?? {};

      // Contract: { notifications: [{ notification, display_message, avatars, ... }], nextCursor }
      // Keep array fallback only for websocket-like or legacy transport safety.
      const rows: any[] = Array.isArray(body)
        ? body
        : Array.isArray(body.notifications)
          ? body.notifications
          : [];

      const entities = rows
        .map(parseApiNotification)
        .filter((n) => typeof n.id === 'string' && n.id.length > 0);
      // Sort newest-first (adapter's sortComparer handles insert order, but
      // we also sort here so pagination page merges are predictable)
      entities.sort((a, b) => b.createdAt - a.createdAt);

      const nextCursorRaw = Array.isArray(body) ? null : body.nextCursor;
      const hasMore = typeof nextCursorRaw === 'string' && nextCursorRaw.length > 0;
      const total =
        typeof body.total === 'number'
          ? body.total
          : entities.length;

      return {
        entities,
        page,
        hasMore,
        total,
      };
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message ?? err.message ?? 'Failed to fetch notifications',
      );
    }
  },
  {
    // Stale cache guard: skip if not stale (page 0, not forced)
    condition: (params, { getState }) => {
      const page = params?.page ?? 0;
      const force = params?.force ?? false;
      if (force || page > 0) return true;

      const { lastFetchedAt } = getState().notifications;
      if (!lastFetchedAt) return true;
      return Date.now() - lastFetchedAt >= NOTIFICATION_STALE_TIME_MS;
    },
  },
);

export const fetchUnreadCount = createAsyncThunk(
  'notifications/fetchUnreadCount',
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiClient.getUnreadNotificationCount();
      return Number(res.data?.unread ?? 0);
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  },
);

/**
 * Marks a single notification as read.
 * Optimistic: applied immediately in .pending, rolled back in .rejected.
 */
export const markNotificationRead = createAsyncThunk<string, string>(
  'notifications/markRead',
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.markNotificationAsRead(id);
      return id;
    } catch (err: any) {
      // Pass the ID back so .rejected can identify which to roll back
      return rejectWithValue(id);
    }
  },
);

/**
 * Marks all notifications as read.
 * Optimistic in .pending; on .rejected invalidates cache so next render re-fetches.
 */
export const markAllNotificationsRead = createAsyncThunk(
  'notifications/markAllRead',
  async (_, { rejectWithValue }) => {
    try {
      await apiClient.markAllNotificationsRead();
      return true;
    } catch (err: any) {
      return rejectWithValue(err.message);
    }
  },
);

// Backward-compat aliases so existing imports keep working without changes
export const getNotifications = fetchNotifications;
export const getUnreadCount = fetchUnreadCount;
export const markAsRead = markNotificationRead;
export const markAllAsRead = markAllNotificationsRead;

// ─── Initial state ─────────────────────────────────────────────────────────────

type NotificationsExtraState = Omit<NotificationsState, 'ids' | 'entities'>;

const initialState = notificationsAdapter.getInitialState<NotificationsExtraState>({
  unreadCount: 0,
  isLoading: false,
  isFetchingMore: false,
  error: null,
  pagination: { page: 0, hasMore: false, total: null },
  lastFetchedAt: null,
});

// ─── Slice ─────────────────────────────────────────────────────────────────────

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    /**
     * Real-time: a new notification arrived via WebSocket.
     * `upsertOne` deduplicates by ID — safe to call multiple times with the same event.
     * This is the ONLY place WebSocket notification data enters Redux (req 7).
     */
    wsNotificationReceived(state, action: PayloadAction<NotificationEntity>) {
      const isNew = !state.entities[action.payload.id];
      notificationsAdapter.upsertOne(state, action.payload);
      if (isNew && !action.payload.isRead) {
        state.unreadCount += 1;
      }
    },

    /**
   * Called when notificationAck is sent successfully over websocket.
   * Updates Redux immediately instead of waiting for API refresh.
   */
  notificationAcknowledged(
    state,
    action: PayloadAction<string>,
  ) {
    const notification = state.entities[action.payload];

    if (notification && !notification.isRead) {
      notification.isRead = true;

      state.unreadCount = Math.max(
        0,
        state.unreadCount - 1,
      );
    }
  },

    /**
     * Invalidate the notification cache (req 9).
     * Next call to fetchNotifications() will bypass the stale check and hit the API.
     */
    invalidateNotificationCache(state) {
      state.lastFetchedAt = null;
    },
  },

  extraReducers: (builder) => {
    // ── fetchNotifications ─────────────────────────────────────────────────────
    builder
      .addCase(fetchNotifications.pending, (state, action) => {
        const page = action.meta.arg?.page ?? 0;
        if (page === 0) {
          state.isLoading = true;
        } else {
          state.isFetchingMore = true;
        }
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        const { entities, page, hasMore, total } = action.payload;
        state.isLoading = false;
        state.isFetchingMore = false;

        if (page === 0) {
          // Full replace on first page — clears any stale or orphaned entities
          notificationsAdapter.setAll(state, entities);
          // Derive unread from the fresh data
          state.unreadCount = entities.filter((n) => !n.isRead).length;
        } else {
          // Subsequent pages: upsert (deduplication via adapter IDs)
          notificationsAdapter.upsertMany(state, entities);
          // Recount across all loaded entities
          state.unreadCount = (
            Object.values(state.entities) as NotificationEntity[]
          ).filter((n) => !n.isRead).length;
        }

        state.pagination = { page, hasMore, total };
        state.lastFetchedAt = Date.now();
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.isFetchingMore = false;
        state.error = (action.payload as string) ?? 'Failed to fetch notifications';
      });

    // ── fetchUnreadCount ───────────────────────────────────────────────────────
    // Authoritative override from server — always wins over derived count
    builder.addCase(fetchUnreadCount.fulfilled, (state, action) => {
      state.unreadCount = action.payload;
    });

    // ── markNotificationRead (optimistic + rollback) ───────────────────────────
    builder
      .addCase(markNotificationRead.pending, (state, action) => {
        // Optimistic apply
        const n = state.entities[action.meta.arg];
        if (n && !n.isRead) {
          n.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markNotificationRead.rejected, (state, action) => {
        // Rollback: payload is the notification ID (passed via rejectWithValue)
        const id = (action.payload as string) ?? action.meta.arg;
        const n = state.entities[id];
        if (n && n.isRead) {
          n.isRead = false;
          state.unreadCount += 1;
        }
      });
    // .fulfilled is a no-op — optimistic already applied in .pending

    // ── markAllNotificationsRead (optimistic + invalidate-on-fail) ────────────
    builder
      .addCase(markAllNotificationsRead.pending, (state) => {
        // Optimistic: mark every loaded notification as read
        for (const id of state.ids) {
          const n = state.entities[id];
          if (n) n.isRead = true;
        }
        state.unreadCount = 0;
      })
      .addCase(markAllNotificationsRead.rejected, (state) => {
        // Rollback via cache invalidation — next render triggers a fresh fetch
        state.lastFetchedAt = null;
      });
    // .fulfilled is a no-op
  },
});

export const { wsNotificationReceived, notificationAcknowledged, invalidateNotificationCache } =
  notificationsSlice.actions;

export default notificationsSlice.reducer;