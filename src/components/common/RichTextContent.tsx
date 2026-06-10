'use client'

import DOMPurify from 'dompurify'
import { CSSProperties } from 'react'

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
      className={`rich-text-content ${className}`}
      style={style}
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(html || '', {
          ADD_ATTR: ['target'],
        }),
      }}
    />
  )
}