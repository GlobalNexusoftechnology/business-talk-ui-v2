import React from 'react';
import { Check, X } from 'lucide-react'
import type { MessageEntity } from '@/types/chat';
import RichTextContent from '@/components/common/RichTextContent';
import { renderMessageHtml } from '@/lib/chat/renderMessage';

// Render text with auto-linked URLs and email addresses
// function renderLinkedText(text?: string | null) {
//   if (!text) return null;
//   const splitRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,})/gi;
//   const parts = text.split(splitRegex);

//   const isEmail = (s: string) => /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/i.test(s);
//   const isUrl = (s: string) => /^https?:\/\//i.test(s) || /^www\./i.test(s);

//   return parts.map((part, idx) => {
//     if (!part) return null;
//     if (isEmail(part)) {
//       return (
//         <a key={idx} href={`mailto:${part}`} className="text-blue-600 underline whitespace-pre-wrap break-words">
//           {part}
//         </a>
//       );
//     }
//     if (isUrl(part)) {
//       const href = part.match(/^https?:\/\//i) ? part : `https://${part}`;
//       return (
//         <a key={idx} href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline whitespace-pre-wrap break-words">
//           {part}
//         </a>
//       );
//     }
//     return <span key={idx} className="whitespace-pre-wrap break-words">{part}</span>;
//   });
// }

interface MessageBubbleProps {
  message: MessageEntity;
  isMine: boolean;
  isGroup: boolean;
  displayTime: string;
}

function SharedPreview({ message }: { message: MessageEntity }) {
  if (message.messageType !== 'blog' && message.messageType !== 'post') {
    return null;
  }

  const preview = message.preview;

  if (!preview) return null;

  const imgSrc =
    preview.image ||
    preview.imageUrl ||
    preview.thumbnailUrl ||
    preview.img;

  const title = preview.title || preview.headline || '';
  const description =
    preview.text ||
    preview.description ||
    preview.subtitle ||
    '';

  return (
    <a
      href={preview.url || '#'}
      target={preview.url ? '_blank' : undefined}
      rel={preview.url ? 'noreferrer' : undefined}
      className="mt-2 block rounded-lg border border-gray-200 overflow-hidden bg-white"
    >
      {imgSrc && (
        <div className="w-full h-36 bg-gray-100">
          <img
            src={imgSrc}
            alt={title || 'Preview'}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.parentElement?.remove();
            }}
          />
        </div>
      )}

      <div className="p-2">
        <p className="text-[11px] uppercase tracking-wide text-gray-500">
          {preview.type || 'POST'}
        </p>

        {title ? (
          <RichTextContent className="text-sm font-semibold text-gray-900 line-clamp-2" html={title} />
            // {title}

        ) : null}

        {description ? (
          <RichTextContent className="text-xs text-gray-600 line-clamp-2" html={description} />
        ) : null}
      </div>
    </a>
  );
}

function AttachmentBlock({ message }: { message: MessageEntity }) {
  if (!message.attachments?.length) return null;

  return (
    <div className="mt-2 space-y-2">
      {message.attachments?.map((attachment) => {
        if (attachment.type === 'image') {
          return (
            <div
              key={attachment.id}
              className="w-full max-w-md h-56 bg-gray-100 rounded-lg overflow-hidden border border-gray-200"
            >
              <img
                src={attachment.thumbnailUrl || attachment.url}
                alt={attachment.fileName || 'Image attachment'}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.parentElement?.remove();
                }}
              />
            </div>
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

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isMine,
  isGroup,
  displayTime,
}) => {
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
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
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
          <div
            className="break-words whitespace-normal"
            dangerouslySetInnerHTML={
              renderMessageHtml(message.text)
            }
          />
          <SharedPreview message={message} />
          <AttachmentBlock message={message} />
          <div className="flex items-center justify-end gap-1 mt-1">
            <span className="text-[10px] text-gray-500">{displayTime}</span>
            {isMine && (
              <span className="flex items-center gap-1">
                {message.status === 'failed' ? (
                  <span className="flex items-center gap-1">
                    <X className="w-3 h-3 text-red-500" aria-hidden />
                    <span className="sr-only">Failed</span>
                  </span>
                ) : message.status === 'seen' ? (
                  <span className="flex items-center gap-[2px]">
                    <span className="flex items-center">
                      <Check className="w-3 h-3 text-green-600" aria-hidden />
                    </span>
                    <span className="flex items-center">
                      <Check className="w-3 h-3 text-green-600" aria-hidden />
                    </span>
                    <span className="sr-only">Seen</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Check className="w-3 h-3 text-gray-500" aria-hidden />
                    <span className="sr-only">Sent</span>
                  </span>
                )}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
