import type { MessageEntity } from '@/types/chat';

interface CurrentUser {
  id: string;
  full_name?: string;
  profile_photo?: string | null;
}

export function createOptimisticMessageId(): string {
  const randomPart =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
  return `tmp_${Date.now()}_${randomPart}`;
}

export function buildOptimisticMessage(params: {
  conversationId: string;
  text: string;
  currentUser: CurrentUser;
}): MessageEntity {
  const tempId = createOptimisticMessageId();
  const senderName = params.currentUser.full_name || 'Me';

  return {
    id: tempId,
    tempId,
    conversationId: params.conversationId,
    text: params.text,
    senderId: String(params.currentUser.id || ''),
    senderName,
    senderAvatar:
      params.currentUser.profile_photo ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(senderName)}`,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    status: 'pending',
    messageType: 'text',
    attachments: [],
    preview: null,
    isDeleted: false,
  };
}
