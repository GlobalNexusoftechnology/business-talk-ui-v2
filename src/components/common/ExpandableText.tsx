import React, { useEffect, useRef, useState } from 'react'
import DOMPurify from 'dompurify'

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

interface ExpandableTextProps {
  children: string | null | undefined | any
  className?: string 
  lines?: number
  stopPropagation?: boolean
  onClick?: () => void
}

export default function ExpandableText({ children, className = '', lines = 4, stopPropagation = true, onClick }: ExpandableTextProps) {
  const html = DOMPurify.sanitize(
    renderHashtagsWithLinks(String(children || '')),
  )
  const [expanded, setExpanded] = useState(false)
  const [showToggle, setShowToggle] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    // measure overflow by cloning element without clamp
    const clone = el.cloneNode(true) as HTMLDivElement
    clone.style.position = 'absolute'
    clone.style.visibility = 'hidden'
    clone.style.maxHeight = 'none'
    ;(clone.style as any).WebkitLineClamp = 'none'
    clone.style.display = 'block'
    el.parentElement?.appendChild(clone)
    const isOverflowing = clone.scrollHeight > el.clientHeight + 1
    setShowToggle(isOverflowing)
    clone.remove()
  }, [html, lines])

  return (
    <div>
      <div
        onClick={(e) => {
          if (stopPropagation) e.stopPropagation()

          if (expanded && onClick) {
            onClick()
          }
        }}
        ref={ref}
        className={`rich-text-content whitespace-pre-wrap break-words ${className}`}
        dangerouslySetInnerHTML={{
          __html: html,
        }}
        style={
          expanded
            ? { display: 'block' }
            : {
                display: '-webkit-box',
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                WebkitLineClamp: String(lines),
              } as React.CSSProperties
        }
      />

      {showToggle && (
          <button
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation()
              setExpanded(!expanded)
            }}
            className="mt-2 text-sm font-medium text-blue-500 hover:underline"
            aria-expanded={expanded}
          >
            {expanded ? 'Show Less' : 'Read More'}
          </button>
      )}
    </div>
  )
}
