import type { MessageEntity } from '@/types/chat';

export interface RawSenderContract {
  id: string;
  fullName?: string | null;
  profilePhoto?: string | null;
  username?: string | null;
}

export interface RawAttachmentContract {
  id: string;
  type: 'image' | 'video' | 'audio' | 'voice' | 'file' | 'blog' | 'post';
  url: string;
  fileName?: string;
  mimeType?: string;
  size?: number;
  thumbnailUrl?: string;
}

export interface RawPreviewContract {
  id?: string;
  type: 'blog' | 'post';
  title?: string;
  subtitle?: string;
  description?: string;
  // backend variants
  image?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  img?: string;
  headline?: string;
  text?: string;
  url?: string;
  [k: string]: unknown;
}

export interface RawMessageContract {
  id: string;
  conversationId: string | null | undefined;
  content: string | null;
  createdAt: number;
  updatedAt?: number;
  status?: MessageEntity['status'];
  isDeleted?: boolean;
  messageType?: 'text' | 'image' | 'video' | 'audio' | 'voice' | 'file' | 'blog' | 'post';
  sender: RawSenderContract;
  attachments?: RawAttachmentContract[];
  preview?: RawPreviewContract | null;
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isValidStatus = (value: unknown): value is MessageEntity['status'] =>
  value === 'pending' ||
  value === 'sent' ||
  value === 'delivered' ||
  value === 'seen' ||
  value === 'failed';

export function isRawMessageContract(value: unknown): value is RawMessageContract {
  if (!isObject(value)) return false;
  if (typeof value.id !== 'string' || value.id.length === 0) return false;
  // Allow null/undefined conversationId — frontend will fallback to empty string
  if (value.conversationId !== null && value.conversationId !== undefined && (typeof value.conversationId !== 'string')) return false;
  // Allow null content for link/post preview messages (backend may provide preview.text instead)
  if (value.content !== null && typeof value.content !== 'string') return false;
  if (typeof value.createdAt !== 'number' || !Number.isFinite(value.createdAt)) return false;
  if (value.updatedAt !== undefined && (typeof value.updatedAt !== 'number' || !Number.isFinite(value.updatedAt))) return false;

  const sender = value.sender;
  if (!isObject(sender)) return false;
  if (typeof sender.id !== 'string' || sender.id.length === 0) return false;
  // Allow nullable fullName for deleted users and legacy accounts
  if (sender.fullName !== undefined && sender.fullName !== null && typeof sender.fullName !== 'string') return false;
  // Allow nullable profilePhoto for deleted users and legacy accounts
  if (sender.profilePhoto !== undefined && sender.profilePhoto !== null && typeof sender.profilePhoto !== 'string') return false;
  // Allow nullable username for legacy accounts
  if (sender.username !== undefined && sender.username !== null && typeof sender.username !== 'string') return false;

  if (value.status !== undefined && !isValidStatus(value.status)) return false;

  if (value.attachments !== undefined) {
    if (!Array.isArray(value.attachments)) return false;
    for (const item of value.attachments) {
      if (!isObject(item)) return false;
      if (typeof item.id !== 'string') return false;
      if (typeof item.url !== 'string') return false;
      if (
        item.type !== 'image' &&
        item.type !== 'video' &&
        item.type !== 'audio' &&
        item.type !== 'voice' &&
        item.type !== 'file' &&
        item.type !== 'blog' &&
        item.type !== 'post'
      ) {
        return false;
      }
      if (item.fileName !== undefined && typeof item.fileName !== 'string') return false;
      if (item.mimeType !== undefined && typeof item.mimeType !== 'string') return false;
      if (item.size !== undefined && typeof item.size !== 'number') return false;
      if (item.thumbnailUrl != null && typeof item.thumbnailUrl !== 'string') return false;
    }
  }

  if (value.preview !== undefined && value.preview !== null) {
    if (!isObject(value.preview)) return false;
    if (value.preview.type !== 'blog' && value.preview.type !== 'post') return false;
    if (value.preview.id !== undefined && typeof value.preview.id !== 'string') return false;
    if (value.preview.title !== undefined && typeof value.preview.title !== 'string') return false;
    if (value.preview.subtitle !== undefined && typeof value.preview.subtitle !== 'string') return false;
    if (value.preview.description !== undefined && typeof value.preview.description !== 'string') return false;
    // backend may return `image` or `imageUrl` or `thumbnailUrl`
    if (value.preview.image != null && typeof value.preview.image !== 'string') return false;
    if (value.preview.imageUrl != null && typeof value.preview.imageUrl !== 'string') return false;
    if (value.preview.thumbnailUrl != null && typeof value.preview.thumbnailUrl !== 'string') return false;
    if (value.preview.url != null && typeof value.preview.url !== 'string') return false;
    // backend may return `text` instead of description
    if (value.preview.text != null && typeof value.preview.text !== 'string') return false;
  }

  return true;
}

export function normalizeMessage(raw: RawMessageContract): MessageEntity {
  const conversationId = raw.conversationId || '';
  if (!conversationId && process.env.NODE_ENV === 'development') {
    console.warn('[chat-contract] Message has null/empty conversationId:', raw.id);
  }

  const senderName = raw.sender.fullName || raw.sender.username || 'User';
  const avatarName = encodeURIComponent(senderName);
  const senderAvatar = raw.sender.profilePhoto || `https://ui-avatars.com/api/?name=${avatarName}`;

  return {
    id: raw.id,
    conversationId,
    // If content is null (link/post preview), prefer preview.text/description, else empty
    text: raw.isDeleted ? '' : (raw.content ?? raw.preview?.text ?? raw.preview?.description ?? ''),
    senderId: raw.sender.id,
    senderName,
    senderAvatar,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    status: raw.status ?? 'sent',
    isDeleted: Boolean(raw.isDeleted),
    messageType: raw.messageType ?? 'text',
    attachments: raw.attachments ? raw.attachments.map((a) => ({ ...a })) : [],
    preview: raw.preview
      ? {
          id: raw.preview.id,
          type: raw.preview.type,
          title: raw.preview.title ?? raw.preview.headline ?? undefined,
          subtitle: raw.preview.subtitle ?? undefined,
          description: raw.preview.description ?? raw.preview.text ?? undefined,
          imageUrl: raw.preview.image ?? raw.preview.imageUrl ?? raw.preview.thumbnailUrl ?? raw.preview.img ?? undefined,
          url: raw.preview.url ?? undefined,
          ...(raw.preview as Record<string, unknown>),
        }
      : null,
  };
}

export function warnInvalidMessageContract(payload: unknown, source: string): void {
  if (process.env.NODE_ENV !== 'development') return;
  if (isRawMessageContract(payload)) return;
  console.warn(`[chat-contract] Invalid message payload from ${source}`, payload);
}
