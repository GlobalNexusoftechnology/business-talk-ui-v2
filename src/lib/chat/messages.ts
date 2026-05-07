import type { InfiniteData } from '@tanstack/react-query';
import type { MessageEntity, MessagePage } from '@/types/chat';

export function sortMessagesOldestFirst(messages: MessageEntity[]): MessageEntity[] {
  return messages.slice().sort((a, b) => a.createdAt - b.createdAt);
}

export function dedupeMessagesById(messages: MessageEntity[]): MessageEntity[] {
  const byId = new Map<string, MessageEntity>();
  for (const msg of messages) {
    byId.set(msg.id, msg);
  }
  return Array.from(byId.values());
}

export function mergeUniqueMessages(messages: MessageEntity[]): MessageEntity[] {
  return sortMessagesOldestFirst(dedupeMessagesById(messages));
}

// ─── Realtime cache mutation utilities for update/delete/status events ──────

/**
 * Update a message in infinite data while preserving:
 * - Pagination structure
 * - Sorting order (oldest first)
 * - Deduplication
 * - Message position in cache
 *
 * Protections:
 * - Ignores updates older than current updatedAt (stale-event guard)
 * - Logs development mismatches
 * - Prevents out-of-order mutations
 */
export function updateMessageInInfiniteData(
  old: InfiniteData<MessagePage> | undefined,
  update: Partial<MessageEntity> & { id: string; updatedAt?: number },
): InfiniteData<MessagePage> | undefined {
  if (!old || old.pages.length === 0) return old;

  let found = false;
  const pages = old.pages.map((page) => {
    const idx = page.messages.findIndex((m) => m.id === update.id);
    if (idx === -1) return page;

    const current = page.messages[idx];
    
    // Part 7: Stale-event guard — ignore older updates than current updatedAt
    if (update.updatedAt !== undefined && current.updatedAt !== undefined) {
      if (update.updatedAt < current.updatedAt) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(
            '[chat-cache] Ignored stale update for message',
            update.id,
            'current updatedAt:',
            current.updatedAt,
            'received updatedAt:',
            update.updatedAt,
          );
        }
        return page;
      }
    }

    found = true;
    const next = page.messages.slice();
    next[idx] = { ...current, ...update };
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[chat-cache] Updated message in cache:', update.id, update);
    }
    
    return { ...page, messages: next };
  });

  if (!found && process.env.NODE_ENV === 'development') {
    console.warn('[chat-cache] Message not found for update:', update.id);
  }

  return { ...old, pages };
}

/**
 * Delete a message from infinite data while preserving:
 * - Pagination structure
 * - Message position/gap (soft delete with isDeleted flag)
 * - Sorting order
 * - Message count accuracy
 *
 * Uses soft deletion (isDeleted=true) instead of removal
 * to maintain message indices and pagination integrity.
 */
export function deleteMessageInInfiniteData(
  old: InfiniteData<MessagePage> | undefined,
  messageId: string,
): InfiniteData<MessagePage> | undefined {
  if (!old || old.pages.length === 0) return old;

  return updateMessageInInfiniteData(old, {
    id: messageId,
    isDeleted: true,
    text: '',
  });
}

/**
 * Mark a message as delivered (status = 'delivered') in infinite data.
 * Does not refetch — only updates existing cache entry.
 */
export function markMessageDeliveredInInfiniteData(
  old: InfiniteData<MessagePage> | undefined,
  messageId: string,
): InfiniteData<MessagePage> | undefined {
  return updateMessageInInfiniteData(old, {
    id: messageId,
    status: 'delivered',
  });
}

/**
 * Mark a message as seen (status = 'seen') in infinite data.
 * Does not refetch — only updates existing cache entry.
 */
export function markMessageSeenInInfiniteData(
  old: InfiniteData<MessagePage> | undefined,
  messageId: string,
): InfiniteData<MessagePage> | undefined {
  return updateMessageInInfiniteData(old, {
    id: messageId,
    status: 'seen',
  });
}

export function insertMessageIntoInfiniteData(
  old: InfiniteData<MessagePage> | undefined,
  message: MessageEntity,
): InfiniteData<MessagePage> | undefined {
  if (!old || old.pages.length === 0) return old;

  const exists = old.pages.some((page) => page.messages.some((m) => m.id === message.id));
  if (exists) return old;

  const pages = old.pages.slice();
  const latestIndex = pages.length - 1;
  const latest = pages[latestIndex];

  pages[latestIndex] = {
    ...latest,
    messages: mergeUniqueMessages([...latest.messages, message]),
  };

  return { ...old, pages };
}

export function replaceTempMessageInInfiniteData(
  old: InfiniteData<MessagePage> | undefined,
  tempId: string,
  confirmed: MessageEntity,
): InfiniteData<MessagePage> | undefined {
  if (!old) return old;

  let replaced = false;
  const pages = old.pages.map((page) => {
    const idx = page.messages.findIndex((m) => m.id === tempId);
    if (idx === -1) return page;
    replaced = true;
    const next = page.messages.slice();
    next[idx] = confirmed;
    return { ...page, messages: mergeUniqueMessages(next) };
  });

  if (replaced) {
    return { ...old, pages };
  }

  const latestIndex = pages.length - 1;
  if (latestIndex < 0) return old;
  pages[latestIndex] = {
    ...pages[latestIndex],
    messages: mergeUniqueMessages([...pages[latestIndex].messages, confirmed]),
  };
  return { ...old, pages };
}

export function markTempMessageFailedInInfiniteData(
  old: InfiniteData<MessagePage> | undefined,
  tempId: string,
): InfiniteData<MessagePage> | undefined {
  if (!old) return old;

  const pages = old.pages.map((page) => {
    const idx = page.messages.findIndex((m) => m.id === tempId);
    if (idx === -1) return page;
    const next = page.messages.slice();
    next[idx] = { ...next[idx], status: 'failed' };
    return { ...page, messages: next };
  });

  return { ...old, pages };
}
