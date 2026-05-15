import React from 'react';
import type { MessageEntity } from '@/types/chat';

// Render text with auto-linked URLs and email addresses
function renderLinkedText(text?: string | null) {
  if (!text) return null;
  const splitRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/gi;
  const parts = text.split(splitRegex);

  const isEmail = (s: string) => /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/i.test(s);
  const isUrl = (s: string) => /^https?:\/\//i.test(s) || /^www\./i.test(s);

  return parts.map((part, idx) => {
    if (!part) return null;
    if (isEmail(part)) {
      return (
        <a key={idx} href={`mailto:${part}`} className="text-blue-600 underline break-words">
          {part}
        </a>
      );
    }
    if (isUrl(part)) {
      const href = part.match(/^https?:\/\//i) ? part : `https://${part}`;
      return (
        <a key={idx} href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-words">
          {part}
        </a>
      );
    }
    return <span key={idx}>{part}</span>;
  });
}

interface MessageBubbleProps {
  message: MessageEntity;
  isMine: boolean;
  isGroup: boolean;
  displayTime: string;
}

function SharedPreview({ message }: { message: MessageEntity }) {
  if (message.messageType !== 'blog' && message.messageType !== 'post') return null;
  const preview = message.preview;
  if (!preview) return null;
  const imgSrc = preview.image || preview.imageUrl || preview.thumbnailUrl || preview.img
  const title = preview.title || preview.headline || ''
  const description = preview.text || preview.description || preview.subtitle || ''

  return (
    <a
      href={preview.url || '#'}
      target={preview.url ? '_blank' : undefined}
      rel={preview.url ? 'noreferrer' : undefined}
      className="mt-2 block rounded-lg border border-gray-200 overflow-hidden bg-white"
    >
      {imgSrc && (
        <img
          src={imgSrc}
          alt={title || `${preview.type} preview`}
          className="w-full max-h-36 object-cover"
        />
      )}
      <div className="p-2">
        <p className="text-[11px] uppercase tracking-wide text-gray-500">{preview.type}</p>
        {title ? (
          <p className="text-sm font-semibold text-gray-900 line-clamp-2">{title}</p>
        ) : description ? (
          <p className="text-sm font-semibold text-gray-900 line-clamp-2">{description}</p>
        ) : null}
        {description && title && (
          <p className="text-xs text-gray-600 line-clamp-2">{description}</p>
        )}
      </div>
    </a>
  )
}

function AttachmentBlock({ message }: { message: MessageEntity }) {
  if (!message.attachments.length) return null;

  return (
    <div className="mt-2 space-y-2">
      {message.attachments.map((attachment) => {
        if (attachment.type === 'image') {
          return (
            <img
              key={attachment.id}
              src={attachment.thumbnailUrl || attachment.url}
              alt={attachment.fileName || 'Image attachment'}
              className="max-w-full rounded-lg border border-gray-200"
            />
          );
        }

        if (attachment.type === 'video') {
          return (
            <video
              key={attachment.id}
              poster={attachment.thumbnailUrl}
              controls
              className="max-w-full rounded-lg border border-gray-200"
            >
              <source src={attachment.url} />
            </video>
          );
        }

        if (attachment.type === 'audio' || attachment.type === 'voice') {
          return (
            <audio key={attachment.id} controls className="w-full">
              <source src={attachment.url} />
            </audio>
          );
        }

        return (
          <a
            key={attachment.id}
            href={attachment.url}
            target="_blank"
            rel="noreferrer"
            className="block text-xs underline break-all text-blue-700"
          >
            {attachment.fileName || 'Download file'}
          </a>
        );
      })}
    </div>
  );
}

const MessageBubble = React.memo<MessageBubbleProps>(({ message, isMine, isGroup, displayTime }) => {
  if (message.isDeleted) {
    return (
      <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
        <div className="px-3 py-2 rounded-2xl text-sm italic text-gray-400 bg-gray-100 border border-dashed border-gray-300">
          This message was deleted
        </div>
      </div>
    );
  }

  return (
    <div className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
      {!isMine && isGroup && (
        <img
          src={
            message.senderAvatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(message.senderName || 'User')}`
          }
          alt={message.senderName}
          className="w-6 h-6 md:w-7 md:h-7 rounded-full mr-2 self-end shrink-0"
        />
      )}

      <div className="max-w-[calc(100%-4rem)] md:max-w-[70%]">
        {!isMine && isGroup && (
          <p className="text-xs text-gray-500 ml-1 mb-1">{message.senderName}</p>
        )}

        <div
          className={`px-3 py-2 rounded-2xl text-sm break-words whitespace-pre-wrap ${
            isMine
              ? 'bg-[#DCF8C6] text-black rounded-br-sm'
              : 'bg-gray-100 text-black rounded-bl-sm'
          } ${message.status === 'pending' ? 'opacity-60' : ''}`}
        >
          {renderLinkedText(message.text)}
          <SharedPreview message={message} />
          <AttachmentBlock message={message} />
          <div className="flex items-center justify-end gap-1 mt-1">
            <span className="text-[10px] text-gray-500">{displayTime}</span>
            {isMine && (
              <span
                className={`text-[10px] ${
                  message.status === 'seen'
                    ? 'text-blue-500'
                    : message.status === 'failed'
                    ? 'text-red-500'
                    : 'text-gray-400'
                }`}
              >
                {message.status === 'failed'
                  ? 'x'
                  : message.status === 'seen' || message.status === 'delivered'
                  ? 'vv'
                  : 'v'}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

MessageBubble.displayName = 'MessageBubble';

export default MessageBubble;
