'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ContentType, ContentData } from '@/hooks/useContentViewer'
import { PostViewCard } from './viewer-cards/PostViewCard'
import { BlogViewCard } from './viewer-cards/BlogViewCard'
import { QuestionViewCard } from './viewer-cards/QuestionViewCard'
import { StoryViewCard } from './viewer-cards/StoryViewCard'

interface UniversalContentViewerProps {
  isOpen: boolean
  type: ContentType | null
  data: ContentData | null
  onClose: () => void
}

export function UniversalContentViewer({
  isOpen,
  type,
  data,
  onClose
}: UniversalContentViewerProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const [isMobile, setIsMobile] = useState(false)

  // Detect if mobile/tablet
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  // Handle backdrop click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === modalRef.current) {
        onClose()
      }
    },
    [onClose]
  )

  // Render content based on type
  const renderContent = () => {
    if (!type || !data) return null

    switch (type) {
      case 'post':
        return <PostViewCard data={data} />
      case 'blog':
        return <BlogViewCard data={data} />
      case 'question':
        return <QuestionViewCard data={data} />
      case 'story':
        // Cast data to the expected type for StoryViewCard
        return <StoryViewCard data={data as Parameters<typeof StoryViewCard>[0]['data']} />
      default:
        return null
    }
  }

  // Mobile navigation - navigate to dedicated page instead of modal
  useEffect(() => {
    if (isMobile && isOpen && type && data?.id) {
      router.push(`/${type}/${data.id}`)
      onClose()
    }
  }, [isMobile, isOpen, type, data, router, onClose])

  // Don't render modal on mobile (routing handles it)
  if (isMobile || !isOpen || !type || !data) return null

  return (
    <div
      ref={modalRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      role="presentation"
    >
      {/* Modal Container */}
      <div
        ref={contentRef}
        className="relative w-full mx-4 max-w-2xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
          aria-label="Close modal"
          title="Close (ESC)"
        >
          <X className="w-6 h-6 text-gray-600" />
        </button>

        {/* Scrollable Content Area */}
        <div className="overflow-y-auto flex-1 p-6">
          <div id="modal-title" className="sr-only">
            {type.charAt(0).toUpperCase() + type.slice(1)} Viewer
          </div>
          {renderContent()}
        </div>
      </div>
    </div>
  )
}
