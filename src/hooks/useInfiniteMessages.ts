import {
  useInfiniteQuery,
  type InfiniteData,
  type QueryClient,
} from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import type { MessageEntity, MessagePage } from '@/types/chat';
import {
  isRawMessageContract,
  normalizeMessage,
  warnInvalidMessageContract,
  type RawMessageContract,
} from '@/lib/chat/normalizeMessage';
import {
  insertMessageIntoInfiniteData,
  markTempMessageFailedInInfiniteData,
  mergeUniqueMessages,
  replaceTempMessageInInfiniteData,
  updateMessageInInfiniteData,
  deleteMessageInInfiniteData,
  markMessageDeliveredInInfiniteData,
  markMessageSeenInInfiniteData,
} from '@/lib/chat/messages';

export const MESSAGES_PAGE_SIZE = 50;

export const messagesQueryKey = (conversationId: string) =>
  ['messages', conversationId] as const;

interface MessagePageResponse {
  messages: RawMessageContract[];
  nextCursor: string | null;
  hasMore: boolean;
}

function parseMessagePageResponse(data: unknown): MessagePageResponse {
  if (typeof data !== 'object' || data === null) {
    return { messages: [], nextCursor: null, hasMore: false };
  }

  const obj = data as Record<string, unknown>;
  const rawMessages = Array.isArray(obj.messages)
    ? obj.messages
    : Array.isArray(obj.data)
      ? obj.data
      : [];
  const messages = rawMessages.filter((msg) => {
    const valid = isRawMessageContract(msg);
    if (!valid) {
      warnInvalidMessageContract(msg, 'rest');
    }
    return valid;
  });

  const meta =
    typeof obj.meta === 'object' && obj.meta !== null
      ? (obj.meta as Record<string, unknown>)
      : null;

  const nextCursor =
    typeof obj.nextCursor === 'string'
      ? obj.nextCursor
      : typeof meta?.nextCursor === 'string' || typeof meta?.nextCursor === 'number'
        ? String(meta?.nextCursor)
        : null;

  const hasMore =
    obj.hasMore === true ||
    meta?.hasMore === true;

  return {
    messages,
    nextCursor,
    hasMore,
  };
}

async function fetchMessagePage(
  conversationId: string,
  cursor: string | undefined,
): Promise<MessagePage> {
  const res = await apiClient.getMessages(conversationId, cursor, MESSAGES_PAGE_SIZE);
  const page = parseMessagePageResponse(res.data);

  const messages: MessageEntity[] = mergeUniqueMessages(
    page.messages.map((raw) => normalizeMessage(raw)),
  );

  const derivedCursor =
    page.nextCursor ??
    (messages.length >= MESSAGES_PAGE_SIZE ? String(messages[0]?.createdAt ?? '') : null);

  return {
    messages,
    nextCursor: derivedCursor,
    hasMore: page.hasMore || messages.length >= MESSAGES_PAGE_SIZE,
  };
}

export function useInfiniteMessages(conversationId: string | null) {
  return useInfiniteQuery<
    MessagePage,
    Error,
    InfiniteData<MessagePage>,
    readonly ['messages', string],
    string | undefined
  >({
    queryKey: messagesQueryKey(conversationId ?? ''),
    queryFn: ({ pageParam }) => fetchMessagePage(conversationId!, pageParam),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) =>
      lastPage.hasMore && lastPage.nextCursor ? lastPage.nextCursor : undefined,
    enabled: !!conversationId,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function insertMessageIntoCache(
  queryClient: QueryClient,
  conversationId: string,
  message: MessageEntity,
): void {
  // Part 1: Guard against empty conversationId
  if (!conversationId || conversationId.trim().length === 0) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[chat-cache] Prevented cache insertion with empty conversationId');
    }
    return;
  }

  queryClient.setQueryData<InfiniteData<MessagePage>>(
    messagesQueryKey(conversationId),
    (old) => insertMessageIntoInfiniteData(old, message),
  );
}

export function replaceOptimisticInCache(
  queryClient: QueryClient,
  conversationId: string,
  tempId: string,
  confirmedMessage: MessageEntity,
): void {
  // Part 1: Guard against empty conversationId
  if (!conversationId || conversationId.trim().length === 0) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        '[chat-cache] Prevented optimistic replacement with empty conversationId',
      );
    }
    return;
  }

  queryClient.setQueryData<InfiniteData<MessagePage>>(
    messagesQueryKey(conversationId),
    (old) => replaceTempMessageInInfiniteData(old, tempId, confirmedMessage),
  );
}

export function markMessageFailedInCache(
  queryClient: QueryClient,
  conversationId: string,
  tempId: string,
): void {
  // Part 1: Guard against empty conversationId
  if (!conversationId || conversationId.trim().length === 0) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[chat-cache] Prevented failed message mark with empty conversationId');
    }
    return;
  }

  queryClient.setQueryData<InfiniteData<MessagePage>>(
    messagesQueryKey(conversationId),
    (old) => markTempMessageFailedInInfiniteData(old, tempId),
  );
}

export function insertOptimisticIntoCache(
  queryClient: QueryClient,
  conversationId: string,
  pendingMessage: MessageEntity,
): void {
  insertMessageIntoCache(queryClient, conversationId, pendingMessage);
}

// ─── Part 3: Realtime synchronization helpers ────────────────────────────────

/**
 * Update a message in cache (for realtime message:update events).
 * Handles delivery ticks, seen ticks, edited content, and status reconciliation.
 * Part 5: Prevents duplicate updates via stale-event guards.
 */
export function updateMessageInCache(
  queryClient: QueryClient,
  conversationId: string,
  update: Partial<MessageEntity> & { id: string; updatedAt?: number },
): void {
  if (!conversationId || conversationId.trim().length === 0) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[chat-cache] Prevented message update with empty conversationId');
    }
    return;
  }

  queryClient.setQueryData<InfiniteData<MessagePage>>(
    messagesQueryKey(conversationId),
    (old) => updateMessageInInfiniteData(old, update),
  );
}

/**
 * Delete a message from cache (for realtime message:delete events).
 * Uses soft deletion (isDeleted=true) to preserve pagination integrity.
 * Part 6: Sidebar preview recalculates automatically when deleted.
 */
export function deleteMessageFromCache(
  queryClient: QueryClient,
  conversationId: string,
  messageId: string,
): void {
  if (!conversationId || conversationId.trim().length === 0) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[chat-cache] Prevented message delete with empty conversationId');
    }
    return;
  }

  queryClient.setQueryData<InfiniteData<MessagePage>>(
    messagesQueryKey(conversationId),
    (old) => deleteMessageInInfiniteData(old, messageId),
  );
}

/**
 * Mark a message as delivered in cache (for realtime delivery tick events).
 * Updates status = 'delivered' without requiring a refetch.
 * Part 5: Stale-event guards prevent duplicate deliveries.
 */
export function markMessageDeliveredInCache(
  queryClient: QueryClient,
  conversationId: string,
  messageId: string,
): void {
  if (!conversationId || conversationId.trim().length === 0) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[chat-cache] Prevented delivery mark with empty conversationId');
    }
    return;
  }

  queryClient.setQueryData<InfiniteData<MessagePage>>(
    messagesQueryKey(conversationId),
    (old) => markMessageDeliveredInInfiniteData(old, messageId),
  );
}

/**
 * Mark a message as seen in cache (for realtime seen tick events).
 * Updates status = 'seen' without requiring a refetch.
 * Part 5: Stale-event guards prevent duplicate seen ticks.
 */
export function markMessageSeenInCache(
  queryClient: QueryClient,
  conversationId: string,
  messageId: string,
): void {
  if (!conversationId || conversationId.trim().length === 0) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[chat-cache] Prevented seen mark with empty conversationId');
    }
    return;
  }

  queryClient.setQueryData<InfiniteData<MessagePage>>(
    messagesQueryKey(conversationId),
    (old) => markMessageSeenInInfiniteData(old, messageId),
  );
}
