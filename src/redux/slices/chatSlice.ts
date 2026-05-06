import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from '@reduxjs/toolkit';
import apiClient from '@/lib/api-client';
import type {
  ChatState,
  ConversationEntity,
  ConversationMessagesState,
  MessageEntity,
} from '@/types/chat';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const emptyConvMessages = (): ConversationMessagesState => ({
  ids: [],
  entities: {},
  hasMore: true,
  loading: false,
  unreadCount: 0,
});

/**
 * Inserts a message only if its ID is not already present.
 * Used for Redux-held optimistic/pending messages only.
 */
const upsertMessageInto = (
  convState: ConversationMessagesState,
  message: MessageEntity,
): void => {
  if (convState.entities[message.id]) {
    convState.entities[message.id] = { ...convState.entities[message.id], ...message };
  } else {
    convState.ids.push(message.id);
    convState.entities[message.id] = message;
  }
};

const parseCurrentUser = (): { id: string } => {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}');
  } catch {
    return { id: '' };
  }
};

// ─── Async Thunks ─────────────────────────────────────────────────────────────
// NOTE: fetchMessages has been removed — React Query (useInfiniteMessages) owns
// all historical + real-time message fetching and caching.

export const fetchConversations = createAsyncThunk(
  'chat/fetchConversations',
  async (_: void, { rejectWithValue }) => {
    try {
      const res = await apiClient.getConversations();
      const currentUser = parseCurrentUser();

      const conversations: ConversationEntity[] = res.data.map((c: any) => {
        const conv = c.conversation ?? c;
        const isGroup: boolean = conv.is_group ?? false;

        let name: string = conv.title ?? '';
        let avatar: string =
          conv.cover_image ??
          `https://ui-avatars.com/api/?name=${encodeURIComponent(conv.title || 'User')}`;

        let participantId: string | undefined;
        if (!isGroup) {
          const otherUser = conv.participants?.find(
            (p: any) => p.user?.id !== currentUser.id,
          )?.user;
          if (otherUser) {
            name = otherUser.full_name || otherUser.username || '';
            avatar =
              otherUser.profile_photo ??
              `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser.full_name || 'User')}`;
            participantId = otherUser.id as string | undefined;
          }
        } else {
          name =
            conv.title ||
            conv.participants?.map((p: any) => p.user?.username).join(', ') ||
            '';
        }

        const lastMsg = conv.messages?.[conv.messages.length - 1] ?? null;

        return {
          id: conv.id as string,
          name: name || 'Unknown',
          avatar,
          lastMessage: lastMsg?.content ?? '',
          lastMessageAt: lastMsg ? Number(lastMsg.created_on) : 0,
          unread: 0,
          online: true,
          isGroup,
          members: conv.participants?.length,
          participantId,
          muted: false,
          archived: false,
          pinned: false,
        };
      });

      return conversations;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message ?? 'Failed to fetch conversations',
      );
    }
  },
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (
    {
      conversationId,
      content,
      tempId,
    }: { conversationId: string; content: string; tempId: string },
    { rejectWithValue },
  ) => {
    try {
      const res = await apiClient.sendMessage(conversationId, content);
      const m = res.data;
      const user = parseCurrentUser();

      const message: MessageEntity = {
        id: m.id as string,
        conversationId,
        text: m.content as string,
        sender: 'me',
        timestamp: new Date(Number(m.created_on)).toLocaleTimeString(),
        createdAt: Number(m.created_on),
        senderId: (user as any).id ?? '',
        senderName:
          (user as any).full_name || (user as any).username || 'Me',
        senderAvatar:
          (user as any).profile_photo ??
          `https://ui-avatars.com/api/?name=Me`,
        status: 'sent',
        tempId,
      };

      return { tempId, message };
    } catch (err: any) {
      return rejectWithValue({
        tempId,
        error: err.response?.data?.message ?? 'Failed to send message',
      });
    }
  },
);

// ─── Initial state ─────────────────────────────────────────────────────────────

const initialState: ChatState = {
  conversations: {
    byId: {},
    allIds: [],
    loading: false,
    error: null,
  },
  messages: {
    byConversation: {},
  },
  activeConversationId: null,
  typingUsers: {},
  onlineUsers: [],
};

// ─── Slice ─────────────────────────────────────────────────────────────────────

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    // ── Navigation ────────────────────────────────────────────────────────────
    setActiveConversation(state, action: PayloadAction<string | null>) {
      state.activeConversationId = action.payload;
      if (action.payload && state.conversations.byId[action.payload]) {
        state.conversations.byId[action.payload].unread = 0;
      }
      // Retain only pending/failed optimistic messages when switching conversations
      if (action.payload && state.messages.byConversation[action.payload]) {
        const stale = state.messages.byConversation[action.payload];
        const pendingIds = stale.ids.filter(
          (id) =>
            stale.entities[id]?.status === 'pending' ||
            stale.entities[id]?.status === 'failed',
        );
        stale.ids = pendingIds;
        const pendingEntities: Record<string, MessageEntity> = {};
        for (const id of pendingIds) {
          if (stale.entities[id]) pendingEntities[id] = stale.entities[id];
        }
        stale.entities = pendingEntities;
      }
    },

    // ── Incoming WebSocket events ─────────────────────────────────────────────
    // Real-time display is handled by React Query cache (WebSocketProvider injects there).
    // This reducer ONLY updates conversation sidebar metadata: preview + unread count.
    wsMessageReceived(
      state,
      action: PayloadAction<{ conversationId: string; message: MessageEntity }>,
    ) {
      const { conversationId, message } = action.payload;

      const conv = state.conversations.byId[conversationId];
      if (conv) {
        conv.lastMessage = message.isDeleted ? 'This message was deleted' : message.text;
        conv.lastMessageAt = message.createdAt;
        // Only increment unread if conversation is not active AND not muted
        if (state.activeConversationId !== conversationId && !conv.muted) {
          conv.unread += 1;
          if (!state.messages.byConversation[conversationId]) {
            state.messages.byConversation[conversationId] = emptyConvMessages();
          }
          state.messages.byConversation[conversationId].unreadCount += 1;
        }
      }
    },

    wsTypingReceived(
      state,
      action: PayloadAction<{ conversationId: string; userName: string }>,
    ) {
      state.typingUsers[action.payload.conversationId] = action.payload.userName;
    },

    clearTypingUser(state, action: PayloadAction<string>) {
      delete state.typingUsers[action.payload];
    },

    wsUserOnline(state, action: PayloadAction<string>) {
      if (!state.onlineUsers.includes(action.payload)) {
        state.onlineUsers.push(action.payload);
      }
    },

    wsUserOffline(state, action: PayloadAction<string>) {
      state.onlineUsers = state.onlineUsers.filter((id) => id !== action.payload);
    },

    markConversationRead(state, action: PayloadAction<string>) {
      const conv = state.conversations.byId[action.payload];
      if (conv) conv.unread = 0;
      const convMsg = state.messages.byConversation[action.payload];
      if (convMsg) convMsg.unreadCount = 0;
    },

    // ── Optimistic sending ─────────────────────────────────────────────────────
    // Redux only holds pending/failed messages; confirmed messages live in RQ cache.
    addPendingMessage(state, action: PayloadAction<MessageEntity>) {
      const { conversationId } = action.payload;
      if (!state.messages.byConversation[conversationId]) {
        state.messages.byConversation[conversationId] = emptyConvMessages();
      }
      upsertMessageInto(state.messages.byConversation[conversationId], action.payload);
    },

    /** Remove a specific optimistic message from Redux after it is confirmed. */
    removeOptimisticMessage(
      state,
      action: PayloadAction<{ conversationId: string; tempId: string }>,
    ) {
      const { conversationId, tempId } = action.payload;
      const convMessages = state.messages.byConversation[conversationId];
      if (!convMessages) return;
      convMessages.ids = convMessages.ids.filter((id) => id !== tempId);
      delete convMessages.entities[tempId];
    },

    // ── Conversation-level controls ───────────────────────────────────────────
    muteConversation(state, action: PayloadAction<string>) {
      const conv = state.conversations.byId[action.payload];
      if (conv) conv.muted = true;
    },
    unmuteConversation(state, action: PayloadAction<string>) {
      const conv = state.conversations.byId[action.payload];
      if (conv) conv.muted = false;
    },
    archiveConversation(state, action: PayloadAction<string>) {
      const conv = state.conversations.byId[action.payload];
      if (conv) {
        conv.archived = true;
        // Archiving resets unread so badge doesn't reappear on unarchive
        conv.unread = 0;
      }
    },
    unarchiveConversation(state, action: PayloadAction<string>) {
      const conv = state.conversations.byId[action.payload];
      if (conv) conv.archived = false;
    },
    pinConversation(state, action: PayloadAction<string>) {
      const conv = state.conversations.byId[action.payload];
      if (conv) conv.pinned = true;
    },
    unpinConversation(state, action: PayloadAction<string>) {
      const conv = state.conversations.byId[action.payload];
      if (conv) conv.pinned = false;
    },
    /**
     * Insert or update a conversation entity directly.
     * Used for optimistic conversation creation and WS-delivered new conversations.
     */
    upsertConversation(state, action: PayloadAction<ConversationEntity>) {
      const conv = action.payload;
      state.conversations.byId[conv.id] = conv;
      if (!state.conversations.allIds.includes(conv.id)) {
        state.conversations.allIds.unshift(conv.id);
      }
    },
  },

  extraReducers: (builder) => {
    // ── fetchConversations ─────────────────────────────────────────────────────
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.conversations.loading = true;
        state.conversations.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.conversations.loading = false;
        const newById: typeof state.conversations.byId = {};
        const newAllIds: string[] = [];
        for (const conv of action.payload) {
          const existing = state.conversations.byId[conv.id];
          // Preserve local-only flags that are not stored server-side
          newById[conv.id] = {
            ...conv,
            muted: existing?.muted ?? false,
            archived: existing?.archived ?? false,
            pinned: existing?.pinned ?? false,
          };
          newAllIds.push(conv.id);
        }
        state.conversations.byId = newById;
        state.conversations.allIds = newAllIds;
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.conversations.loading = false;
        state.conversations.error = action.payload as string;
      });

    // ── sendMessage ────────────────────────────────────────────────────────────
    builder
      .addCase(sendMessage.fulfilled, (state, action) => {
        const { tempId, message } = action.payload;
        const { conversationId } = message;

        // Update conversation preview
        const conv = state.conversations.byId[conversationId];
        if (conv) {
          conv.lastMessage = message.text;
          conv.lastMessageAt = message.createdAt;
        }

        // Remove the temp entry from Redux — RQ cache holds the confirmed message
        const convMessages = state.messages.byConversation[conversationId];
        if (convMessages) {
          convMessages.ids = convMessages.ids.filter((id) => id !== tempId);
          delete convMessages.entities[tempId];
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        const payload = action.payload as
          | { tempId: string; error: string }
          | undefined;
        if (!payload) return;

        for (const convId of Object.keys(state.messages.byConversation)) {
          const entry =
            state.messages.byConversation[convId].entities[payload.tempId];
          if (entry) {
            entry.status = 'failed';
            break;
          }
        }
      });
  },
});

export const {
  setActiveConversation,
  wsMessageReceived,
  wsTypingReceived,
  clearTypingUser,
  wsUserOnline,
  wsUserOffline,
  markConversationRead,
  addPendingMessage,
  removeOptimisticMessage,
  muteConversation,
  unmuteConversation,
  archiveConversation,
  unarchiveConversation,
  pinConversation,
  unpinConversation,
  upsertConversation,
} = chatSlice.actions;

export default chatSlice.reducer;

// ─── Thunks defined after slice to access action creators without circular deps ─

/**
 * Open a 1-on-1 conversation with a user.
 * Automatically reuses an existing DM instead of creating a duplicate.
 * Returns { conversationId, isNew } — the caller should dispatch
 * setActiveConversation(conversationId) and optionally fetchConversations() if isNew.
 */
export const createConversation = createAsyncThunk(
  'chat/createConversation',
  async (
    { participantId }: { participantId: string },
    { getState, rejectWithValue },
  ) => {
    const state = getState() as { chat: ChatState };

    // DM reuse: return existing conversation without hitting the API
    const existingId = state.chat.conversations.allIds.find((id) => {
      const conv = state.chat.conversations.byId[id];
      return !conv.isGroup && conv.participantId === participantId;
    });
    if (existingId) {
      return { conversationId: existingId, isNew: false };
    }

    try {
      const { id } = await apiClient.getOrCreateConversation(participantId);
      return { conversationId: id, isNew: true };
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.message ?? err.message ?? 'Failed to open conversation',
      );
    }
  },
);