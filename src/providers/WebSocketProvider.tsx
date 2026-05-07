import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import WebSocketManager from '@/lib/websocket';
import { store } from '@/redux/store';
import {
  wsMessageReceived,
  wsTypingReceived,
  clearTypingUser,
  wsUserOnline,
  wsUserOffline,
  fetchConversations,
} from '@/redux/slices/chatSlice';
import { registerWsManager } from '@/redux/middleware/websocketMiddleware';
import {
  insertMessageIntoCache,
  messagesQueryKey,
  updateMessageInCache,
  deleteMessageFromCache,
} from '@/hooks/useInfiniteMessages';
import { CHAT_EVENTS } from '@/lib/chat/events';
import { normalizeMessage } from '@/lib/chat/normalizeMessage';
import {
  parseWsMessagePayload,
  parseWsPresencePayload,
  parseWsTypingPayload,
} from '@/lib/chat/websocketPayloads';
import {
  wsNotificationReceived,
  parseApiNotification,
} from '@/redux/slices/notificationsSlice';

interface WebSocketContextValue {
  wsManager: WebSocketManager | null;
  isConnected: boolean;
}

const WebSocketContext = createContext<WebSocketContextValue>({
  wsManager: null,
  isConnected: false,
});

export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const wsManagerRef = useRef<WebSocketManager | null>(null);
  const disconnectStartedAtRef = useRef<number | null>(null);
  const hasConnectedRef = useRef(false);
  const [isConnected, setIsConnected] = useState(false);
  // React Query client — available because WebSocketProvider is inside QueryClientProvider
  const queryClient = useQueryClient();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let userStr: string | null = null;
    try {
      userStr = localStorage.getItem('user');
    } catch {
      return;
    }

    if (!userStr) return;

    let user: any;
    try {
      user = JSON.parse(userStr);
    } catch {
      return;
    }

    const userId = String(
      user?.id ??
      user?.user_id ??
      user?.userId ??
      '',
    );
    if (!userId) {
      console.warn(
        'WebSocketProvider: no userId found in localStorage user — skipping connection',
      );
      return;
    }

    const ws = new WebSocketManager();
    const unsubscribers: Array<() => void> = [];

    // ── Connection state ─────────────────────────────────────────────────────
    unsubscribers.push(ws.on('connect', () => {
      setIsConnected(true);
      registerWsManager(ws);

      const wasConnectedBefore = hasConnectedRef.current;
      hasConnectedRef.current = true;

      const disconnectedForMs = disconnectStartedAtRef.current
        ? Date.now() - disconnectStartedAtRef.current
        : 0;
      disconnectStartedAtRef.current = null;

      // Bonus stabilization: avoid aggressive refetch/invalidation storms.
      // Refresh conversations on first connect, or after significant downtime.
      const shouldRefreshConversations =
        !wasConnectedBefore || disconnectedForMs >= 30_000;

      if (shouldRefreshConversations) {
        store.dispatch(fetchConversations());
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('[chat-realtime] socket connected', {
          wasConnectedBefore,
          disconnectedForMs,
          shouldRefreshConversations,
        });
      }
    }));

    unsubscribers.push(ws.on('disconnect', () => {
      setIsConnected(false);
      registerWsManager(null);
      disconnectStartedAtRef.current = Date.now();

      if (process.env.NODE_ENV === 'development') {
        console.log('[chat-realtime] socket disconnected');
      }
    }));

    // ── Incoming message → React Query cache + Redux metadata ───────────────
    unsubscribers.push(ws.on(CHAT_EVENTS.MESSAGE_NEW, (data: unknown) => {
      const payload = parseWsMessagePayload(data);
      if (!payload) return;
      const message = normalizeMessage(payload);
      const conversationId = message.conversationId;

      // 1. Insert into React Query cache (handles display / deduplication)
      //    Only inserts when a cache entry already exists (conversation was opened).
      insertMessageIntoCache(queryClient, conversationId, message);

      // 2. Invalidate stale conversations that DON'T have an open cache yet
      //    so new unread messages trigger a refetch when the conversation is opened.
      if (!queryClient.getQueryData(messagesQueryKey(conversationId))) {
        // No cache entry — mark it as needing a fresh fetch next open
        queryClient.invalidateQueries({ queryKey: messagesQueryKey(conversationId) });
      }

      // 3. Update Redux: conversation preview + unread count (sidebar only)
      store.dispatch(
        wsMessageReceived({ conversationId, message, currentUserId: userId }),
      );
    }));

    // ── Message update → React Query cache (delivery/seen/edited) ────────────
    // Part 4: Handle message:update for delivery ticks, seen ticks, edited content
    unsubscribers.push(ws.on(CHAT_EVENTS.MESSAGE_UPDATE, (data: unknown) => {
      if (!data || typeof data !== 'object') return;
      const update = data as any;
      const conversationId = update.conversationId;
      const messageId = update.id;

      if (!conversationId || !messageId) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('[chat-cache] Invalid message:update payload:', data);
        }
        return;
      }

      // Update message in React Query cache without refetch
      // Part 5: Stale-event guards in updateMessageInCache prevent duplicates
      updateMessageInCache(queryClient, conversationId, {
        id: messageId,
        status: update.status,
        text: update.content,
        isDeleted: update.isDeleted,
        updatedAt: update.updatedAt,
      });

      // Part 6: Invalidate conversations for sidebar preview recalculation
      if (update.status || update.isDeleted) {
        queryClient.invalidateQueries({
          queryKey: ['conversations'],
        });
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('[chat-realtime] message:update received:', {
          messageId,
          conversationId,
          status: update.status,
          isDeleted: update.isDeleted,
        });
      }
    }));

    // ── Message delete → React Query cache (soft delete) ───────────────────
    // Part 4: Handle message:delete for deleted messages
    unsubscribers.push(ws.on(CHAT_EVENTS.MESSAGE_DELETE, (data: unknown) => {
      if (!data || typeof data !== 'object') return;
      const deletion = data as any;
      const conversationId = deletion.conversationId;
      const messageId = deletion.id;

      if (!conversationId || !messageId) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('[chat-cache] Invalid message:delete payload:', data);
        }
        return;
      }

      // Soft delete in React Query cache (isDeleted=true, preserve pagination)
      // Part 5: Soft deletion prevents pagination corruption and message loss
      deleteMessageFromCache(queryClient, conversationId, messageId);

      // Part 6: Invalidate conversations for sidebar preview recalculation
      queryClient.invalidateQueries({
        queryKey: ['conversations'],
      });

      if (process.env.NODE_ENV === 'development') {
        console.log('[chat-realtime] message:delete received:', {
          messageId,
          conversationId,
        });
      }
    }));

    // ── Typing indicator → Redux ─────────────────────────────────────────────
    unsubscribers.push(ws.on(CHAT_EVENTS.TYPING_START, (data: unknown) => {
      const payload = parseWsTypingPayload(data);
      if (!payload) return;

      store.dispatch(wsTypingReceived(payload));

      // Auto-clear after 2 s
      setTimeout(() => {
        store.dispatch(clearTypingUser(payload.conversationId));
      }, 2000);
    }));

    unsubscribers.push(ws.on(CHAT_EVENTS.TYPING_STOP, (data: unknown) => {
      const payload = parseWsTypingPayload(data);
      if (!payload) return;
      store.dispatch(clearTypingUser(payload.conversationId));
    }));

    // ── Online/offline presence → Redux ──────────────────────────────────────
    unsubscribers.push(ws.on(CHAT_EVENTS.USER_ONLINE, (data: unknown) => {
      const payload = parseWsPresencePayload(data);
      if (!payload) return;
      store.dispatch(wsUserOnline(payload.userId));
    }));

    unsubscribers.push(ws.on(CHAT_EVENTS.USER_OFFLINE, (data: unknown) => {
      const payload = parseWsPresencePayload(data);
      if (!payload) return;
      store.dispatch(wsUserOffline(payload.userId));
    }));

    // ── Incoming notification → Redux (req 7: no component-level WS listeners) ─
    // parseApiNotification handles both embedded-actor and actor_id-only payloads.
    // NO getUserById calls — actor data must come from the WS payload.
    unsubscribers.push(ws.on('notification', (data: any) => {
      const notification = parseApiNotification(data);
      store.dispatch(wsNotificationReceived(notification));
    }));

    // Delay connection slightly so auth cookies/session are fully established
    const timer = setTimeout(() => {
      ws.connect();
    }, 1500);

    wsManagerRef.current = ws;

    return () => {
      clearTimeout(timer);
      unsubscribers.forEach((unsubscribe) => unsubscribe());
      ws.disconnect();
      registerWsManager(null);
      setIsConnected(false);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryClient]);

  return (
    <WebSocketContext.Provider
      value={{ wsManager: wsManagerRef.current, isConnected }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};
