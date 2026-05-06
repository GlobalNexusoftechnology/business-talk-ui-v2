import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../store';
import type { ConversationEntity, MessageEntity } from '@/types/chat';

// ─── Base selectors ────────────────────────────────────────────────────────────

const selectConversationsById = (state: RootState) =>
  state.chat.conversations.byId;

const selectConversationAllIds = (state: RootState) =>
  state.chat.conversations.allIds;

const selectByConversation = (state: RootState) =>
  state.chat.messages.byConversation;

// ─── Conversation selectors ────────────────────────────────────────────────────

/**
 * Returns conversations sorted by:
 *   1. Pinned first
 *   2. Unread (any unread > 0) second
 *   3. Latest activity (lastMessageAt desc) third
 * Memoized: only recomputes when byId or allIds change.
 */
export const selectSortedConversations = createSelector(
  selectConversationsById,
  selectConversationAllIds,
  (byId, allIds): ConversationEntity[] =>
    allIds
      .map((id) => byId[id])
      .filter((c): c is ConversationEntity => c != null)
      .sort((a, b) => {
        // Pinned first
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        // Unread second (any unread > 0 floats above zero-unread)
        const aUnread = a.unread > 0;
        const bUnread = b.unread > 0;
        if (aUnread !== bUnread) return aUnread ? -1 : 1;
        // Latest activity third
        return b.lastMessageAt - a.lastMessageAt;
      }),
);

/**
 * Non-archived conversations in sorted order — used for the main sidebar.
 */
export const selectNonArchivedConversations = createSelector(
  selectSortedConversations,
  (convs): ConversationEntity[] => convs.filter((c) => !c.archived),
);

/**
 * Archived conversations in sorted order — shown in the Archived tab.
 */
export const selectArchivedConversations = createSelector(
  selectSortedConversations,
  (convs): ConversationEntity[] => convs.filter((c) => c.archived),
);

/**
 * Total unread message count across all conversations.
 */
export const selectTotalUnreadCount = createSelector(
  selectConversationsById,
  selectConversationAllIds,
  (byId, allIds): number =>
    allIds.reduce((total, id) => total + (byId[id]?.unread ?? 0), 0),
);

export const selectConversationsLoading = (state: RootState): boolean =>
  state.chat.conversations.loading;

export const selectConversationsError = (state: RootState): string | null =>
  state.chat.conversations.error;

export const selectActiveConversationId = (state: RootState): string | null =>
  state.chat.activeConversationId;

/**
 * The full ConversationEntity that is currently open, or null.
 * Memoized — stable reference unless the active conversation data changes.
 */
export const selectActiveConversation = createSelector(
  selectActiveConversationId,
  selectConversationsById,
  (activeId, byId): ConversationEntity | null =>
    activeId != null ? (byId[activeId] ?? null) : null,
);

// ─── Per-conversation message selectors (factories) ───────────────────────────
//
// Usage in components:
//   const selector = useMemo(() => selectConversationMessages(id), [id]);
//   const messages = useAppSelector(selector);
//
// Factory pattern creates a new selector instance per conversationId so that
// each call is independently memoized.

/**
 * Returns an ordered array of MessageEntity objects for a conversation.
 */
export const selectConversationMessages = (conversationId: string) =>
  createSelector(
    (state: RootState) => state.chat.messages.byConversation[conversationId],
    (convState): MessageEntity[] => {
      if (!convState) return [];
      return convState.ids
        .map((id) => convState.entities[id])
        .filter((m): m is MessageEntity => m != null);
    },
  );

/**
 * Returns whether messages for a conversation are currently being fetched.
 */
export const selectMessagesLoading = (conversationId: string) =>
  (state: RootState): boolean =>
    state.chat.messages.byConversation[conversationId]?.loading ?? false;

/**
 * Returns whether there are older pages available for a conversation.
 */
export const selectMessagesHasMore = (conversationId: string) =>
  (state: RootState): boolean =>
    state.chat.messages.byConversation[conversationId]?.hasMore ?? false;

// ─── Typing & online selectors ────────────────────────────────────────────────

/**
 * Returns the userName of the person currently typing in a conversation, or null.
 */
export const selectTypingUsers = (conversationId: string) =>
  createSelector(
    (state: RootState) => state.chat.typingUsers[conversationId],
    (typingUser): string | null => typingUser ?? null,
  );

export const selectOnlineUsers = (state: RootState): string[] =>
  state.chat.onlineUsers;

/**
 * Returns true if the given userId is currently online.
 */
export const selectIsUserOnline = (userId: string) =>
  (state: RootState): boolean =>
    state.chat.onlineUsers.includes(userId);
