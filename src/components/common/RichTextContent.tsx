'use client'

import DOMPurify from 'dompurify'
import { CSSProperties } from 'react'

export function renderHashtagsWithLinks(text: string): string {
  const input = String(text ?? '').trim()
  if (!input) return ''

  const parts = input.split(/(<[^>]+>)/g)
  let inAnchor = false

  return parts
    .map((part) => {
      if (!part) return ''

      if (/^<[^>]+>$/i.test(part)) {
        if (/^<a\b/i.test(part)) {
          inAnchor = true
        } else if (/^<\/a>/i.test(part)) {
          inAnchor = false
        }
        return part
      }

      if (inAnchor) {
        return part
      }

      return part.replace(/#([\p{L}\p{N}_-]+)/gu, (_match, tag) => {
        const href = `/search?q=${encodeURIComponent(tag)}`
        return `<a href="${href}" class="text-blue-600 font-medium hover:text-blue-700 hover:underline">#${tag}</a>`
      })
    })
    .join('')
}

interface Props {
  html?: string | null
  className?: string
  style?: CSSProperties
}

export default function RichTextContent({
  html,
  className = '',
  style,
}: Props) {
  return (
    <div
      className={`rich-text-content whitespace-pre-wrap break-words ${className}`}
      style={style}
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(renderHashtagsWithLinks(html || ''), {
          ADD_ATTR: ['target'],
        }),
      }}
    />
  )
}