'use client';

import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import { useSearchParams } from 'next/navigation';
import EmojiPicker from 'emoji-picker-react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Search,
  Send,
  Smile,
  Users,
  MessageCircle,
  ArrowLeft,
  ChevronDown,
  MoreVertical,
  Pin,
  BellOff,
  Bell,
  Archive,
} from 'lucide-react';

import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import {
  fetchConversations,
  sendMessage,
  setActiveConversation,
  addPendingMessage,
  createConversation,
  muteConversation,
  unmuteConversation,
  archiveConversation,
  unarchiveConversation,
  pinConversation,
  unpinConversation,
} from '@/redux/slices/chatSlice';
import {
  emitTypingAction,
  emitMessageAction,
} from '@/redux/middleware/websocketMiddleware';
import {
  selectNonArchivedConversations,
  selectArchivedConversations,
  selectConversationsLoading,
  selectActiveConversation,
  selectActiveConversationId,
  selectConversationMessages,
  selectTypingUsers,
  selectOnlineUsers,
} from '@/redux/selectors/chatSelectors';
import {
  useInfiniteMessages,
  insertOptimisticIntoCache,
  replaceOptimisticInCache,
  markMessageFailedInCache,
  messagesQueryKey,
} from '@/hooks/useInfiniteMessages';
import type { ConversationEntity, MessageEntity } from '@/types/chat';

// ─── Helpers ───────────────────────────────────────────────────────────────────

const formatTime = (ms: number): string => {
  if (!ms) return '';
  const diff = Date.now() - ms;
  if (diff < 60_000) return 'now';
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h`;
  const d = new Date(ms);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

// ─── Skeleton loaders ─────────────────────────────────────────────────────────

const MessageSkeleton: React.FC<{ align: 'left' | 'right' }> = ({ align }) => (
  <div className={`flex ${align === 'right' ? 'justify-end' : 'justify-start'} animate-pulse`}>
    <div
      className={`h-9 rounded-2xl bg-gray-200 ${align === 'right' ? 'rounded-br-sm' : 'rounded-bl-sm'}`}
      style={{ width: `${110 + Math.floor(Math.random() * 80)}px` }}
    />
  </div>
);

const OlderMessagesSkeletons: React.FC = () => (
  <div className="space-y-1 pb-2">
    <MessageSkeleton align="left" />
    <MessageSkeleton align="right" />
    <MessageSkeleton align="left" />
  </div>
);

// ─── MessageBubble ────────────────────────────────────────────────────────────

interface MessageBubbleProps {
  msg: MessageEntity;
  isGroup: boolean;
}

const MessageBubble = React.memo<MessageBubbleProps>(({ msg, isGroup }) => {
  const isMe = msg.sender === 'me';

  if (msg.isDeleted) {
    return (
      <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
        <div className="px-3 py-2 rounded-2xl text-sm italic text-gray-400 bg-gray-100 border border-dashed border-gray-300">
          This message was deleted
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
      {!isMe && isGroup && (
        <img
          src={
            msg.senderAvatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.senderName || 'User')}`
          }
          alt={msg.senderName}
          className="w-6 h-6 md:w-7 md:h-7 rounded-full mr-2 self-end shrink-0"
        />
      )}
      <div className="max-w-[80%] md:max-w-[70%]">
        {!isMe && isGroup && (
          <p className="text-xs text-gray-500 ml-1 mb-1">{msg.senderName}</p>
        )}
        <div
          className={`px-3 py-2 rounded-2xl text-sm ${
            isMe
              ? 'bg-[#DCF8C6] text-black rounded-br-sm'
              : 'bg-gray-100 text-black rounded-bl-sm'
          } ${msg.status === 'pending' ? 'opacity-60' : ''}`}
        >
          {msg.text}
          <div className="flex items-center justify-end gap-1 mt-1">
            <span className="text-[10px] text-gray-500">{msg.timestamp}</span>
            {isMe && (
              <span className="text-[10px] text-gray-500">
                {msg.status === 'failed'
                  ? '✗'
                  : msg.status === 'seen' || msg.status === 'delivered'
                  ? '✓✓'
                  : '✓'}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});
MessageBubble.displayName = 'MessageBubble';

// ─── ConversationItem ─────────────────────────────────────────────────────────

interface ConversationItemProps {
  conv: ConversationEntity;
  isActive: boolean;
  isOnline: boolean;
  typingUser: string | null;
  onSelect: () => void;
}

const ConversationItem = React.memo<ConversationItemProps>(({
  conv,
  isActive,
  isOnline,
  typingUser,
  onSelect,
}) => {
  const dispatch = useAppDispatch();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [menuOpen]);

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen((prev) => !prev);
  };

  const handlePin = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(conv.pinned ? unpinConversation(conv.id) : pinConversation(conv.id));
    setMenuOpen(false);
  };

  const handleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(conv.muted ? unmuteConversation(conv.id) : muteConversation(conv.id));
    setMenuOpen(false);
  };

  const handleArchive = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(conv.archived ? unarchiveConversation(conv.id) : archiveConversation(conv.id));
    setMenuOpen(false);
  };

  const previewText = typingUser
    ? `${typingUser} is typing\u2026`
    : conv.lastMessage || 'No messages yet';
  const isTyping = !!typingUser;

  return (
    <div
      role="button"
      tabIndex={0}
      className={`group relative w-full p-3 flex gap-3 border-b cursor-pointer transition-colors select-none ${
        isActive ? 'bg-blue-50' : 'hover:bg-gray-50'
      } ${conv.isOptimistic ? 'opacity-60 pointer-events-none' : ''}`}
      onClick={onSelect}
      onKeyDown={(e) => e.key === 'Enter' && onSelect()}
    >
      {/* Avatar + presence/group indicator */}
      <div className="relative shrink-0">
        {conv.avatar ? (
          <img
            src={conv.avatar}
            alt={conv.name}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-sm font-medium text-gray-600">
            {conv.name?.charAt(0).toUpperCase() ?? '?'}
          </div>
        )}
        {conv.isGroup ? (
          <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white">
            <Users className="w-2 h-2 text-white" />
          </div>
        ) : isOnline ? (
          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white" />
        ) : null}
      </div>

      {/* Text content */}
      <div className="flex-1 min-w-0 pr-6">
        <div className="flex items-center gap-1 mb-0.5">
          {conv.pinned && (
            <Pin className="w-3 h-3 text-gray-400 shrink-0" />
          )}
          <span className="text-sm font-semibold truncate flex-1">{conv.name}</span>
          {conv.muted && (
            <BellOff className="w-3 h-3 text-gray-400 shrink-0" />
          )}
          <span className="text-[10px] text-gray-400 shrink-0 ml-1">
            {formatTime(conv.lastMessageAt)}
          </span>
        </div>
        <p
          className={`text-xs truncate leading-4 ${
            isTyping ? 'text-green-600 italic' : 'text-gray-500'
          }`}
        >
          {previewText}
        </p>
      </div>

      {/* Unread badge */}
      {conv.unread > 0 ? (
        conv.muted ? (
          // Muted: silent dot indicator instead of bold badge
          <div className="absolute right-3 top-3 w-2 h-2 rounded-full bg-gray-400" />
        ) : (
          <span className="absolute right-3 top-3 text-[10px] font-bold text-white bg-blue-600 rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
            {conv.unread > 99 ? '99+' : conv.unread}
          </span>
        )
      ) : null}

      {/* 3-dot context menu (visible on hover) */}
      <div
        ref={menuRef}
        className={`absolute right-2 bottom-2 transition-opacity ${
          menuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 focus-within:opacity-100'
        }`}
      >
        <button
          className="p-1 rounded-md hover:bg-gray-200 transition-colors"
          onClick={handleMenuToggle}
          aria-label="Conversation options"
        >
          <MoreVertical className="w-3.5 h-3.5 text-gray-500" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 bottom-7 z-50 bg-white border border-gray-100 rounded-xl shadow-lg min-w-[160px] py-1 overflow-hidden">
            <button
              className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 flex items-center gap-2.5 transition-colors"
              onClick={handlePin}
            >
              <Pin className="w-3.5 h-3.5 text-gray-500" />
              {conv.pinned ? 'Unpin conversation' : 'Pin conversation'}
            </button>
            <button
              className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 flex items-center gap-2.5 transition-colors"
              onClick={handleMute}
            >
              {conv.muted ? (
                <Bell className="w-3.5 h-3.5 text-gray-500" />
              ) : (
                <BellOff className="w-3.5 h-3.5 text-gray-500" />
              )}
              {conv.muted ? 'Unmute notifications' : 'Mute notifications'}
            </button>
            <div className="my-1 border-t border-gray-100" />
            <button
              className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 flex items-center gap-2.5 transition-colors"
              onClick={handleArchive}
            >
              <Archive className="w-3.5 h-3.5 text-gray-500" />
              {conv.archived ? 'Unarchive' : 'Archive'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
});
ConversationItem.displayName = 'ConversationItem';

// ─── MessagesClient ───────────────────────────────────────────────────────────

/** Distance from the bottom (px) within which we auto-scroll on new messages. */
const NEAR_BOTTOM_THRESHOLD = 120;

// Stable selector defined outside the component to avoid creating a new
// function reference on every render.
const selectTypingUsersMap = (s: { chat: { typingUsers: Record<string, string> } }) =>
  s.chat.typingUsers;

const MessagesClient = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const conversationIdFromURL = searchParams.get('conversationId');
  const userIdFromURL = searchParams.get('userId');

  // ── Local UI state ─────────────────────────────────────────────────────────
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'groups' | 'archived'>('all');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMobileList, setShowMobileList] = useState(true);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // ── Refs ───────────────────────────────────────────────────────────────────
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const topSentinelRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const emojiToggleRef = useRef<HTMLButtonElement>(null);
  const scrollAnchorRef = useRef<number | null>(null);
  const isNearBottomRef = useRef(true);
  const isFetchingOlderRef = useRef(false);

  // ── Redux state ────────────────────────────────────────────────────────────
  const conversationsLoading = useAppSelector(selectConversationsLoading);
  const conversations = useAppSelector(selectNonArchivedConversations);
  const archivedConversations = useAppSelector(selectArchivedConversations);
  const onlineUsers = useAppSelector(selectOnlineUsers);
  const allTypingUsers = useAppSelector(selectTypingUsersMap);
  const selectedConversation = useAppSelector(selectActiveConversation);
  const activeConversationId = useAppSelector(selectActiveConversationId);

  const optimisticSelector = useMemo(
    () => selectConversationMessages(activeConversationId ?? ''),
    [activeConversationId],
  );
  const typingSelector = useMemo(
    () => selectTypingUsers(activeConversationId ?? ''),
    [activeConversationId],
  );
  const optimisticMessages = useAppSelector(optimisticSelector);
  const typingUser = useAppSelector(typingSelector);

  // ── React Query — cursor-paginated messages ────────────────────────────────
  const {
    data: rqData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isInitialLoading,
  } = useInfiniteMessages(activeConversationId);

  // ── Merge: RQ historical + Redux optimistic (deduplicated) ────────────────
  const allMessages = useMemo(() => {
    const rqMessages =
      rqData?.pages
        .slice()
        .reverse()
        .flatMap((p) => p.messages) ?? [];
    const rqIds = new Set(rqMessages.map((m) => m.id));
    const uniqueOptimistic = optimisticMessages.filter((m) => !rqIds.has(m.id));
    return [...rqMessages, ...uniqueOptimistic].sort(
      (a, b) => a.createdAt - b.createdAt,
    );
  }, [rqData, optimisticMessages]);

  // ── Bootstrap ──────────────────────────────────────────────────────────────
  useEffect(() => {
    dispatch(fetchConversations());
  }, [dispatch]);

  // Auto-select from URL param or first conversation
  useEffect(() => {
    if (conversations.length === 0) return;
    if (conversationIdFromURL) {
      const found = conversations.find((c) => c.id === conversationIdFromURL);
      dispatch(setActiveConversation(found?.id ?? conversations[0].id));
    } else if (!activeConversationId) {
      dispatch(setActiveConversation(conversations[0].id));
    }
  }, [conversations, conversationIdFromURL, activeConversationId, dispatch]);

  // Handle ?userId= — open existing DM or create new one (DM reuse)
  useEffect(() => {
    if (!userIdFromURL) return;
    dispatch(createConversation({ participantId: userIdFromURL })).then((result) => {
      if (createConversation.fulfilled.match(result)) {
        const { conversationId, isNew } = result.payload;
        dispatch(setActiveConversation(conversationId));
        if (isNew) dispatch(fetchConversations());
        setShowMobileList(false);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userIdFromURL]);

  // Reset near-bottom anchor when switching conversations
  useEffect(() => {
    if (!activeConversationId) return;
    isNearBottomRef.current = true;
    setShowScrollButton(false);
  }, [activeConversationId]);

  // Auto-scroll when new messages arrive — only when near the bottom
  const prevMessageCountRef = useRef(0);
  useEffect(() => {
    const count = allMessages.length;
    if (count === prevMessageCountRef.current) return;
    const wasNew = count > prevMessageCountRef.current;
    prevMessageCountRef.current = count;
    if (wasNew && isNearBottomRef.current) {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      });
    }
  }, [allMessages.length]);

  // Restore scroll position after prepending older pages
  useEffect(() => {
    if (!isFetchingNextPage && scrollAnchorRef.current !== null) {
      const container = scrollContainerRef.current;
      if (container) {
        container.scrollTop = container.scrollHeight - scrollAnchorRef.current;
      }
      scrollAnchorRef.current = null;
      isFetchingOlderRef.current = false;
    }
  }, [isFetchingNextPage]);

  // Scroll to bottom on initial load of each conversation
  const didScrollInitialRef = useRef<string | null>(null);
  useEffect(() => {
    if (
      !isInitialLoading &&
      rqData &&
      activeConversationId &&
      didScrollInitialRef.current !== activeConversationId
    ) {
      didScrollInitialRef.current = activeConversationId;
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
      });
    }
  }, [isInitialLoading, rqData, activeConversationId]);

  // IntersectionObserver: top sentinel triggers loading older pages
  useEffect(() => {
    const container = scrollContainerRef.current;
    const sentinel = topSentinelRef.current;
    if (!container || !sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasNextPage &&
          !isFetchingNextPage &&
          !isFetchingOlderRef.current
        ) {
          isFetchingOlderRef.current = true;
          scrollAnchorRef.current =
            container.scrollHeight - container.scrollTop;
          fetchNextPage();
        }
      },
      { root: container, threshold: 0.1 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, activeConversationId]);

  // Close emoji picker on outside click
  useEffect(() => {
    if (!showEmojiPicker) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (emojiPickerRef.current?.contains(target)) return;
      if (emojiToggleRef.current?.contains(target)) return;
      setShowEmojiPicker(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiPicker]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleScrollEvent = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const distFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    isNearBottomRef.current = distFromBottom < NEAR_BOTTOM_THRESHOLD;
    setShowScrollButton(distFromBottom > NEAR_BOTTOM_THRESHOLD + 100);
  }, []);

  const handleSelectConversation = useCallback(
    (id: string) => {
      dispatch(setActiveConversation(id));
      setShowMobileList(false);
    },
    [dispatch],
  );

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !activeConversationId) return;

    const tempId = `temp_${Date.now()}`;
    const user: any = (() => {
      try {
        return JSON.parse(localStorage.getItem('user') || '{}');
      } catch {
        return {};
      }
    })();

    const pendingMessage: MessageEntity = {
      id: tempId,
      conversationId: activeConversationId,
      text: messageInput,
      sender: 'me',
      timestamp: new Date().toLocaleTimeString(),
      createdAt: Date.now(),
      senderId: user.id ?? '',
      senderName: user.full_name || user.username || 'Me',
      senderAvatar:
        user.profile_photo ?? `https://ui-avatars.com/api/?name=Me`,
      status: 'pending',
      tempId,
    };

    const hasRqCache = !!queryClient.getQueryData(
      messagesQueryKey(activeConversationId),
    );
    if (hasRqCache) {
      insertOptimisticIntoCache(queryClient, activeConversationId, pendingMessage);
    } else {
      dispatch(addPendingMessage(pendingMessage));
    }

    const content = messageInput;
    setMessageInput('');

    const result = await dispatch(
      sendMessage({ conversationId: activeConversationId, content, tempId }),
    );

    if (sendMessage.fulfilled.match(result)) {
      const { message } = result.payload;
      if (hasRqCache) {
        replaceOptimisticInCache(
          queryClient,
          activeConversationId,
          tempId,
          message,
        );
      }
      dispatch(emitMessageAction(message));
    } else if (hasRqCache) {
      markMessageFailedInCache(queryClient, activeConversationId, tempId);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEmojiClick = (emojiData: any) => {
    setMessageInput((prev) => prev + emojiData.emoji);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeConversationId) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const fileString = event.target?.result as string;
      const { default: apiClient } = await import('@/lib/api-client');
      await apiClient.sendMessageWithAttachment(activeConversationId, fileString);
    };
    reader.readAsDataURL(file);
  };

  // ── Filtered conversation list ─────────────────────────────────────────────
  const filteredConversations = useMemo(() => {
    if (activeTab === 'archived') {
      if (!searchQuery.trim()) return archivedConversations;
      const q = searchQuery.toLowerCase();
      return archivedConversations.filter((c) =>
        c.name.toLowerCase().includes(q),
      );
    }
    let base = conversations;
    if (activeTab === 'unread') base = base.filter((c) => c.unread > 0);
    if (activeTab === 'groups') base = base.filter((c) => c.isGroup);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      base = base.filter((c) => c.name.toLowerCase().includes(q));
    }
    return base;
  }, [conversations, archivedConversations, activeTab, searchQuery]);

  // ── Loading / empty screens ────────────────────────────────────────────────
  if (conversationsLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#F8F9FA]">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          <p className="text-sm">Loading conversations...</p>
        </div>
      </div>
    );
  }

  if (
    !conversationsLoading &&
    conversations.length === 0 &&
    archivedConversations.length === 0
  ) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#F8F9FA]">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm px-6">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
            <MessageCircle className="w-9 h-9 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800">
            No conversations yet
          </h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Message people from their profiles to start a conversation. Your
            chats will appear here.
          </p>
          <a
            href="/people"
            className="mt-2 px-6 py-2.5 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            Find People
          </a>
        </div>
      </div>
    );
  }

  if (!selectedConversation) return null;

  const activeConvIsOnline =
    !selectedConversation.isGroup &&
    !!selectedConversation.participantId &&
    onlineUsers.includes(selectedConversation.participantId);

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="h-[calc(100dvh-4.25rem)] lg:h-[100dvh] w-full flex overflow-hidden bg-[#F8F9FA]">

      {/* ── Sidebar ────────────────────────────────────────────────────────── */}
      <div
        className={`
          h-full flex flex-col bg-white border-r overflow-hidden
          w-full md:w-80 lg:w-96 shrink-0
          ${showMobileList ? 'flex' : 'hidden'} md:flex
        `}
      >
        {/* Search */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
            />
          </div>
        </div>

        {/* Tabs: All | Unread | Groups | Archived */}
        <div className="px-3 py-2 flex gap-1.5 border-b overflow-x-auto">
          {(['all', 'unread', 'groups', 'archived'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 text-xs rounded-lg capitalize whitespace-nowrap shrink-0 font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Conversation list */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-400">
              <p className="text-sm">
                {activeTab === 'archived'
                  ? 'No archived conversations'
                  : activeTab === 'unread'
                  ? 'No unread conversations'
                  : activeTab === 'groups'
                  ? 'No group conversations'
                  : 'No conversations found'}
              </p>
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <ConversationItem
                key={conv.id}
                conv={conv}
                isActive={selectedConversation?.id === conv.id}
                isOnline={
                  !conv.isGroup &&
                  !!conv.participantId &&
                  onlineUsers.includes(conv.participantId)
                }
                typingUser={allTypingUsers[conv.id] ?? null}
                onSelect={() => handleSelectConversation(conv.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* Divider — desktop only */}
      <div className="hidden md:block w-px bg-gray-200 shrink-0" />

      {/* ── Chat pane ──────────────────────────────────────────────────────── */}
      <div
        className={`
          h-full flex flex-col overflow-hidden flex-1 relative
          ${!showMobileList ? 'flex' : 'hidden'} md:flex
        `}
      >
        {/* Header */}
        <div className="p-3 md:p-4 flex items-center gap-2 md:gap-3 bg-white border-b">
          <button
            className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 shrink-0"
            onClick={() => setShowMobileList(true)}
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>

          <div className="relative shrink-0">
            <img
              src={selectedConversation.avatar}
              alt={selectedConversation.name}
              className="w-9 h-9 md:w-10 md:h-10 rounded-full object-cover"
            />
            {activeConvIsOnline && (
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-sm md:text-base truncate">
              {selectedConversation.name}
            </h2>
            {typingUser ? (
              <p className="text-xs text-green-600 italic">
                {typingUser} is typing&hellip;
              </p>
            ) : activeConvIsOnline ? (
              <p className="text-xs text-green-600">Online</p>
            ) : null}
          </div>
        </div>

        {/* Messages area */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScrollEvent}
          className="flex-1 min-h-0 overflow-y-auto bg-white"
        >
          <div className="p-3 md:p-4 space-y-1">
            {/* Invisible sentinel — IntersectionObserver triggers here */}
            <div ref={topSentinelRef} className="h-px" />

            {isFetchingNextPage && <OlderMessagesSkeletons />}

            {!hasNextPage && allMessages.length > 0 && (
              <div className="flex items-center justify-center py-3">
                <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                  Beginning of conversation
                </span>
              </div>
            )}

            {isInitialLoading && (
              <div className="space-y-1 py-4">
                {[...Array(6)].map((_, i) => (
                  <MessageSkeleton
                    key={i}
                    align={i % 2 === 0 ? 'left' : 'right'}
                  />
                ))}
              </div>
            )}

            {allMessages.map((msg) => (
              <MessageBubble
                key={msg.id}
                msg={msg}
                isGroup={selectedConversation.isGroup}
              />
            ))}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Scroll-to-bottom button */}
        {showScrollButton && (
          <button
            onClick={scrollToBottom}
            className="absolute bottom-20 right-4 z-10 w-9 h-9 bg-white border border-gray-200 shadow-md rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
            aria-label="Scroll to latest messages"
          >
            <ChevronDown className="w-4 h-4 text-gray-600" />
          </button>
        )}

        {/* Message input */}
        <div className="p-2 md:p-3 bg-white border-t flex items-end gap-2 relative">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />

          <button
            ref={emojiToggleRef}
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-1.5 shrink-0 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Smile className="w-5 h-5 text-gray-500" />
          </button>

          {showEmojiPicker && (
            <div
              ref={emojiPickerRef}
              className="absolute bottom-14 left-2 md:left-10 z-50"
            >
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </div>
          )}

          <textarea
            value={messageInput}
            onChange={(e) => {
              setMessageInput(e.target.value);
              if (activeConversationId) {
                dispatch(
                  emitTypingAction({ conversationId: activeConversationId }),
                );
              }
            }}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Type a message"
            className="flex-1 px-3 md:px-4 py-2 border rounded resize-none max-h-28 overflow-y-auto text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
          />

          <button
            onClick={handleSendMessage}
            disabled={!messageInput.trim()}
            className="bg-black text-white px-2.5 md:px-3 py-2 rounded shrink-0 disabled:opacity-40 transition-opacity"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessagesClient;