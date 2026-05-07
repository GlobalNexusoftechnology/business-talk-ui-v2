// ─── Message & Conversation domain types for the normalized chat slice ────────

export type MessageStatus = 'pending' | 'sent' | 'delivered' | 'seen' | 'failed';

export type MessageType =
  | 'text'
  | 'image'
  | 'video'
  | 'audio'
  | 'voice'
  | 'file'
  | 'blog'
  | 'post';

export interface MessagePreview {
  id?: string;
  type: 'blog' | 'post';
  title?: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  url?: string;
}

export interface MessageAttachment {
  id: string;
  type: MessageType;
  url: string;
  fileName?: string;
  mimeType?: string;
  size?: number;
  thumbnailUrl?: string;
}

/** One cursor-paginated page of messages returned by the API / useInfiniteMessages. */
export interface MessagePage {
  messages: MessageEntity[];
  /**
   * Opaque cursor to pass as `before` to load the next (older) page.
   * Null when this is the oldest page.
   */
  nextCursor: string | null;
  hasMore: boolean;
}

export interface ConversationEntity {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  /** Unix ms of the last message — used for sort order */
  lastMessageAt: number;
  unread: number;
  online: boolean;
  isGroup: boolean;
  members?: number;
  /** For DMs: the other participant's user ID (used to look up online status) */
  participantId?: string;
  /** If true, new messages do not increment the unread counter */
  muted: boolean;
  /** If true, hidden from the main list and shown in the Archived tab */
  archived: boolean;
  /** If true, conversation is sorted before all non-pinned conversations */
  pinned: boolean;
  /** True while the conversation is being optimistically inserted before API confirmation */
  isOptimistic?: boolean;
}

export interface MessageEntity {
  id: string;
  conversationId: string;
  text: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  createdAt: number;
  updatedAt?: number;
  status: MessageStatus;
  messageType: MessageType;
  attachments: MessageAttachment[];
  preview?: MessagePreview | null;
  /** Temporary client-side ID used before the server confirms the message */
  tempId?: string;
  /** True when the backend has soft-deleted this message */
  isDeleted?: boolean;
}

export interface ConversationMessagesState {
  /** Ordered list of message IDs (oldest → newest) */
  ids: string[];
  /** Message entities keyed by ID */
  entities: Record<string, MessageEntity>;
  hasMore: boolean;
  loading: boolean;
  unreadCount: number;
}

export interface ChatState {
  conversations: {
    byId: Record<string, ConversationEntity>;
    allIds: string[];
    loading: boolean;
    error: string | null;
  };
  messages: {
    byConversation: Record<string, ConversationMessagesState>;
  };
  /** ID of the conversation currently open in the chat pane */
  activeConversationId: string | null;
  /** conversationId → userName of the person currently typing */
  typingUsers: Record<string, string>;
  /** IDs of online users */
  onlineUsers: string[];
}
