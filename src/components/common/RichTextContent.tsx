'use client'

import DOMPurify from 'dompurify'
import { CSSProperties } from 'react'

function escapeHtml(value: string): string {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function renderHashtagsWithLinks(text: string): string {
  const input = String(text ?? '').trim()

  if (!input) return ''

  const hashMatches = [...input.matchAll(/#[\p{L}\p{N}_-]+/gu)]
  if (hashMatches.length > 0) {
    const parts = input.split(/(#[\p{L}\p{N}_-]+)/gu)
    return parts
      .map((part) => {
        if (!part) return ''
        if (/^#[\p{L}\p{N}_-]+$/u.test(part)) {
          const tag = part.slice(1)
          const href = `/search?q=${encodeURIComponent(tag)}`
          return `<a href="${href}" class="text-blue-600 font-medium hover:text-blue-700 hover:underline">${escapeHtml(part)}</a>`
        }
        return escapeHtml(part)
      })
      .join('')
  }

  if (input.includes(',') && !input.includes('\n')) {
    const terms = input
      .split(',')
      .map((term) => term.trim())
      .filter(Boolean)

    if (terms.length > 1) {
      return terms
        .map((term) => {
          const tag = term.replace(/^#+/, '')
          const href = `/search?q=${encodeURIComponent(tag)}`
          return `<a href="${href}" class="text-blue-600 font-medium hover:text-blue-700 hover:underline">#${escapeHtml(tag)}</a>`
        })
        .join(', ')
    }
  }

  return escapeHtml(input)
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