import React, { useEffect, useRef, useState } from 'react'

interface ExpandableTextProps {
  children: string | null | undefined
  className?: string
  lines?: number
  stopPropagation?: boolean
  onClick?: () => void
}

export default function ExpandableText({ children, className = '', lines = 4, stopPropagation = true, onClick }: ExpandableTextProps) {
  const text = children || ''
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
  }, [text, lines])

  return (
    <div>
      <div
        onClick={(e) => {
          if (stopPropagation) e.stopPropagation()
          // Only trigger external onClick when expanded (Show Less visible)
          if (expanded && onClick) onClick()
        }}
        ref={ref}
        className={`whitespace-pre-wrap break-words ${className}`}
        style={
          expanded
            ? { display: 'block' }
            : { display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden', WebkitLineClamp: String(lines) } as React.CSSProperties
        }
      >
        {text}
      </div>

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
