import { useEffect, useMemo } from 'react'
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux'
import type { RootState, AppDispatch } from '@/redux/store'
import {
  selectSortedConversations,
  selectActiveConversation,
  selectActiveConversationId,
  selectConversationMessages,
  selectConversationsLoading,
  selectTotalUnreadCount,
  selectTypingUsers,
  selectMessagesLoading,
} from '@/redux/selectors/chatSelectors'

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

export const useAuth = () => {
  const auth = useAppSelector((state) => state.auth)
  const dispatch = useAppDispatch()

  return {
    ...auth,
    dispatch,
  }
}


export const useNotifications = () => {
  const unreadCount = useAppSelector(
    (state) => state.notifications.unreadCount,
  );
  const isLoading = useAppSelector(
    (state) => state.notifications.isLoading,
  );
  const error = useAppSelector(
    (state) => state.notifications.error,
  );
  const dispatch = useAppDispatch();

  return { unreadCount, isLoading, error, dispatch };
}

export const useAccountStatus = () => {
  const user = useAppSelector((state) => state.auth.user) as any
  // isRestricted is the canonical Redux flag — set on login/session restore
  const isRestricted = useAppSelector((state) => (state.auth as any).isRestricted) as boolean
  // isBanned unifies Redux flag with user field (defence-in-depth)
  const isBanned = isRestricted || Boolean(user?.is_banned || user?.isBanned)
  const isShadowBanned = Boolean(user?.is_shadow_banned || user?.isShadowBanned)

  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && isShadowBanned) {
      console.log('[DEBUG] User is shadow banned')
    }
  }, [isShadowBanned])

  return { isBanned, isShadowBanned, isRestricted }
}

/** @deprecated Use useChat() for the normalized chat state instead. */
export const useMessages = () => {
  const messages = useAppSelector((state) => state.messages)
  const dispatch = useAppDispatch()

  return {
    ...messages,
    dispatch,
  }
}

/**
 * Convenience hook for the normalized Redux chat state.
 *
 * @param conversationId - optional; when provided, also returns the messages
 *   and typing indicator for that conversation.
 */
export const useChat = (conversationId?: string) => {
  const dispatch = useAppDispatch()

  const conversations = useAppSelector(selectSortedConversations)
  const activeConversation = useAppSelector(selectActiveConversation)
  const activeConversationId = useAppSelector(selectActiveConversationId)
  const conversationsLoading = useAppSelector(selectConversationsLoading)
  const totalUnreadCount = useAppSelector(selectTotalUnreadCount)

  const targetId = conversationId ?? activeConversationId ?? ''

  const messagesSelector = useMemo(
    () => selectConversationMessages(targetId),
    [targetId],
  )
  const messagesLoadingSelector = useMemo(
    () => selectMessagesLoading(targetId),
    [targetId],
  )
  const typingSelector = useMemo(
    () => selectTypingUsers(targetId),
    [targetId],
  )

  const messages = useAppSelector(messagesSelector)
  const messagesLoading = useAppSelector(messagesLoadingSelector)
  const typingUser = useAppSelector(typingSelector)

  return {
    dispatch,
    conversations,
    activeConversation,
    activeConversationId,
    conversationsLoading,
    totalUnreadCount,
    messages,
    messagesLoading,
    typingUser,
  }
}

