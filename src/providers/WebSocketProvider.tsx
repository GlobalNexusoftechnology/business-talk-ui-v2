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
} from '@/redux/slices/chatSlice';
import { registerWsManager } from '@/redux/middleware/websocketMiddleware';
import {
  insertMessageIntoCache,
  messagesQueryKey,
  parseApiMessage,
} from '@/hooks/useInfiniteMessages';
import {
  wsNotificationReceived,
  parseApiNotification,
} from '@/redux/slices/notificationsSlice';
import type { MessageEntity } from '@/types/chat';

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

    const userId: string = user?.id;
    if (!userId) {
      console.warn(
        'WebSocketProvider: no userId found in localStorage user — skipping connection',
      );
      return;
    }

    const ws = new WebSocketManager();

    // ── Connection state ─────────────────────────────────────────────────────
    ws.on('connect', () => {
      setIsConnected(true);
      registerWsManager(ws);
    });

    ws.on('disconnect', () => {
      setIsConnected(false);
      registerWsManager(null);
    });

    // ── Incoming message → React Query cache + Redux metadata ───────────────
    ws.on('message', (data: any) => {
      const currentUser: any = (() => {
        try {
          return JSON.parse(localStorage.getItem('user') || '{}');
        } catch {
          return {};
        }
      })();

      const conversationId = (data.conversationId ?? data.conversation_id ?? '') as string;

      const message: MessageEntity = parseApiMessage(data, currentUser.id ?? '', conversationId);

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
        wsMessageReceived({ conversationId, message }),
      );
    });

    // ── Typing indicator → Redux ─────────────────────────────────────────────
    ws.on('typing', (data: any) => {
      const conversationId = data.conversationId as string;
      const userName =
        (data.userName as string) || (data.user_name as string) || 'Someone';

      store.dispatch(wsTypingReceived({ conversationId, userName }));

      // Auto-clear after 2 s
      setTimeout(() => {
        store.dispatch(clearTypingUser(conversationId));
      }, 2000);
    });

    // ── Online/offline presence → Redux ──────────────────────────────────────
    ws.on('user_online', (data: any) => {
      store.dispatch(wsUserOnline(data.userId as string));
    });

    ws.on('user_offline', (data: any) => {
      store.dispatch(wsUserOffline(data.userId as string));
    });

    // ── Incoming notification → Redux (req 7: no component-level WS listeners) ─
    // parseApiNotification handles both embedded-actor and actor_id-only payloads.
    // NO getUserById calls — actor data must come from the WS payload.
    ws.on('notification', (data: any) => {
      const notification = parseApiNotification(data);
      store.dispatch(wsNotificationReceived(notification));
    });

    // Delay connection slightly so auth cookies/session are fully established
    const timer = setTimeout(() => {
      ws.connect(userId);
    }, 1500);

    wsManagerRef.current = ws;

    return () => {
      clearTimeout(timer);
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
