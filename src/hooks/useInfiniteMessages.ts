/**
 * useInfiniteMessages — cursor-based infinite query for chat messages.
 *
 * Architecture:
 *  - React Query owns ALL fetched + WebSocket-inserted messages.
 *  - Redux owns optimistic/pending messages only (via chatSlice.addPendingMessage).
 *  - The component merges both sets and deduplicates by message ID.
 *
 * Page direction:
 *  - pages[0] = latest N messages  (loaded on conversation open)
 *  - pages[1] = next N older messages  (loaded when user scrolls to top)
 *  - pages[2] = even older …
 *
 * Display order: reverse(pages).flatMap(p => p.messages) → oldest → newest
 *
 * Cursor:
 *  - The `nextCursor` returned per page is the `created_on` (Unix ms, as string)
 *    of the oldest message in that page.
 *  - Passed to the API as `?before=<cursor>` to retrieve the preceding page.
 *  - Backward-compatible: if the API still uses `?page=<n>`, nothing breaks —
 *    the `before` param is simply ignored and full pages are returned.
 */

import {
  useInfiniteQuery,
  type InfiniteData,
  type QueryClient,
} from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { MessageEntity, MessagePage } from '@/types/chat';

// ─── Constants ─────────────────────────────────────────────────────────────────

export const MESSAGES_PAGE_SIZE = 50;

/** The React Query key factory for a conversation's message pages. */
export const messagesQueryKey = (conversationId: string) =>
  ['messages', conversationId] as const;

// ─── Shared message parser (used by hook AND WebSocketProvider) ───────────────
//
// Normalizes multiple backend and WebSocket payload shapes:
//   sender object:   { id, full_name, username, profile_photo }
//   flat fields:     sender_id, sender_name, sender_avatar
//   legacy alias:    user  (instead of sender)
//   timestamps:      created_on (ms string/number) | created_at (ISO or ms)
//   conversation id: conversationId | conversation_id
//
export const parseApiMessage = (
  m: any,
  currentUserId: string,
  conversationId: string,
): MessageEntity => {
  const firstNonEmptyString = (...values: unknown[]): string | undefined => {
    for (const v of values) {
      if (typeof v === 'string' && v.trim() !== '') return v;
    }
    return undefined;
  };

  // ── Normalize sender ──────────────────────────────────────────────────────
  // Priority: sender object > user object > flat sender_id field
  const senderObj = m.sender ?? m.user ?? null;
  const rawSenderId: string =
    senderObj?.id ??
    senderObj?.user_id ??
    m.sender_id ??
    m.senderId ??
    '';

  const senderName: string =
    firstNonEmptyString(
      senderObj?.full_name,
      senderObj?.name,
      senderObj?.username,
      m.sender_name,
      m.senderName,
    ) ?? 'User';

  const senderAvatar: string =
    firstNonEmptyString(
      senderObj?.profile_photo,
      senderObj?.avatar,
      m.sender_avatar,
      m.senderAvatar,
    ) ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(senderName)}`;

  // ── Normalize timestamp ───────────────────────────────────────────────────
  const rawTs =
    m.created_on ?? m.createdAt ?? m.created_at ?? m.timestamp ?? 0;
  // Support Unix-ms numbers, numeric strings, and ISO date strings
  let createdAt: number;
  if (typeof rawTs === 'number') {
    createdAt = rawTs;
  } else {
    const parsed = Number(rawTs);
    createdAt = Number.isFinite(parsed) && parsed > 1e10
      ? parsed
      : new Date(rawTs).getTime();
  }

  // ── Normalize conversation id ─────────────────────────────────────────────
  const convId: string =
    conversationId ||
    m.conversationId ||
    m.conversation_id ||
    '';

  // ── Sender-side detection ─────────────────────────────────────────────────
  // Compare as strings to avoid type mismatches (number vs string UUIDs).
  const isMe =
    !!currentUserId &&
    !!rawSenderId &&
    String(rawSenderId) === String(currentUserId);

  return {
    id: (m.id ?? m.message_id ?? m.tempId ?? '') as string,
    conversationId: convId,
    text: (m.content ?? m.text ?? m.message ?? m.preview ?? '') as string,
    sender: isMe ? 'me' : 'other',
    senderId: rawSenderId,
    senderName,
    senderAvatar,
    timestamp: createdAt
      ? new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '',
    createdAt,
    status: (m.status as MessageEntity['status']) ?? 'sent',
    isDeleted: Boolean(m.is_deleted ?? m.isDeleted),
  };
};

const parseCurrentUserId = (): string => {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}')?.id ?? '';
  } catch {
    return '';
  }
};

// ─── Page fetcher ──────────────────────────────────────────────────────────────

async function fetchMessagePage(
  conversationId: string,
  cursor: string | undefined,
): Promise<MessagePage> {
  const userId = parseCurrentUserId();
  const res = await apiClient.getMessages(conversationId, cursor, MESSAGES_PAGE_SIZE);
  const raw = res.data;

  // Handle both array response (legacy) and paginated response shape
  const rawMessages: any[] = Array.isArray(raw)
    ? raw
    : (raw.messages ?? raw.data ?? []);

  const nextCursor: string | null =
    raw.nextCursor ?? raw.next_cursor ?? null;

  const messages: MessageEntity[] = rawMessages
    .map((m: any) => parseApiMessage(m, userId, conversationId))
    .sort((a, b) => a.createdAt - b.createdAt);

  // Compute cursor from oldest message when the API doesn't provide one
  const derivedCursor =
    nextCursor ??
    (messages.length >= MESSAGES_PAGE_SIZE
      ? String(messages[0]?.createdAt ?? '')
      : null);

  const hasMore =
    raw.hasMore ?? raw.has_more ?? messages.length >= MESSAGES_PAGE_SIZE;

  return { messages, nextCursor: derivedCursor, hasMore };
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useInfiniteMessages(conversationId: string | null) {
  return useInfiniteQuery<
    MessagePage,
    Error,
    InfiniteData<MessagePage>,
    readonly ['messages', string],
    string | undefined
  >({
    queryKey: messagesQueryKey(conversationId ?? ''),
    queryFn: ({ pageParam }) =>
      fetchMessagePage(conversationId!, pageParam),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore && lastPage.nextCursor ? lastPage.nextCursor : undefined,
    enabled: !!conversationId,
    // Keep data fresh for 5 min; GC after 30 min — survives conversation switching
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

// ─── Cache helpers (used by WebSocketProvider and MessagesClient) ─────────────

/**
 * Insert a single message into the latest page of an existing query cache entry.
 * Deduplicates by message ID across ALL pages to prevent duplicates.
 * Noop if no cache entry exists yet.
 */
export function insertMessageIntoCache(
  queryClient: QueryClient,
  conversationId: string,
  message: MessageEntity,
): void {
  queryClient.setQueryData<InfiniteData<MessagePage>>(
    messagesQueryKey(conversationId),
    (old) => {
      if (!old || old.pages.length === 0) return old;

      // Deduplicate across ALL pages
      const isDuplicate = old.pages.some((page) =>
        page.messages.some((m) => m.id === message.id),
      );
      if (isDuplicate) return old;

      const pages = old.pages.slice();
      const latestPage = pages[pages.length - 1]; // pages[last] = newest messages

      pages[pages.length - 1] = {
        ...latestPage,
        messages: [...latestPage.messages, message],
      };

      return { ...old, pages };
    },
  );
}

/**
 * Replace an optimistic message (by tempId) with the server-confirmed message
 * in the React Query cache.
 * If tempId is not found, appends the confirmed message to the latest page
 * (deduplicated by confirmed message ID) to ensure it is never lost.
 */
export function replaceOptimisticInCache(
  queryClient: QueryClient,
  conversationId: string,
  tempId: string,
  confirmedMessage: MessageEntity,
): void {
  queryClient.setQueryData<InfiniteData<MessagePage>>(
    messagesQueryKey(conversationId),
    (old) => {
      if (!old) return old;

      let replaced = false;

      const pages = old.pages.map((page) => {
        const idx = page.messages.findIndex((m) => m.id === tempId);
        if (idx !== -1) {
          replaced = true;
          const msgs = page.messages.slice();
          msgs[idx] = confirmedMessage;
          return { ...page, messages: msgs };
        }
        return page;
      });

      if (replaced) {
        return { ...old, pages };
      }

      // tempId not found — ensure confirmed message is present (deduplicated)
      const alreadyPresent = pages.some((page) =>
        page.messages.some((m) => m.id === confirmedMessage.id),
      );
      if (alreadyPresent) return { ...old, pages };

      // Append to latest page
      const latestIdx = pages.length - 1;
      pages[latestIdx] = {
        ...pages[latestIdx],
        messages: [...pages[latestIdx].messages, confirmedMessage],
      };

      return { ...old, pages };
    },
  );
}

/**
 * Mark an optimistic message as `failed` in the React Query cache.
 */
export function markMessageFailedInCache(
  queryClient: QueryClient,
  conversationId: string,
  tempId: string,
): void {
  queryClient.setQueryData<InfiniteData<MessagePage>>(
    messagesQueryKey(conversationId),
    (old) => {
      if (!old) return old;

      const pages = old.pages.map((page) => {
        const idx = page.messages.findIndex((m) => m.id === tempId);
        if (idx === -1) return page;
        const msgs = page.messages.slice();
        msgs[idx] = { ...msgs[idx], status: 'failed' };
        return { ...page, messages: msgs };
      });

      return { ...old, pages };
    },
  );
}

/**
 * Insert an optimistic (pending) message into the React Query cache.
 */
export function insertOptimisticIntoCache(
  queryClient: QueryClient,
  conversationId: string,
  pendingMessage: MessageEntity,
): void {
  insertMessageIntoCache(queryClient, conversationId, pendingMessage);
}
