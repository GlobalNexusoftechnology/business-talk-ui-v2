'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bookmark, Image as ImageIcon, Loader2, FileText, BookOpen } from 'lucide-react'
import apiClient from '@/lib/api-client'
import RichTextContent from '@/components/common/RichTextContent'

type GalleryTab = 'media' | 'saved'

export function ProfileGallery() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<GalleryTab>('media')
  const [mediaItems, setMediaItems] = useState<any[]>([])
  const [savedItems, setSavedItems] = useState<any[]>([])
  const [loadingMedia, setLoadingMedia] = useState(true)
  const [loadingSaved, setLoadingSaved] = useState(true)
  const [mediaPage, setMediaPage] = useState(1)
  const [savedPage, setSavedPage] = useState(1)
  const [mediaTotalPages, setMediaTotalPages] = useState(1)
  const [savedTotalPages, setSavedTotalPages] = useState(1)

  // Fetch media library
  useEffect(() => {
    const fetchMedia = async () => {
      setLoadingMedia(true)
      try {
        const res = await apiClient.getMediaLibrary(mediaPage)
        const data = res.data
        setMediaItems(data.items || [])
        setMediaTotalPages(Math.ceil((data.total || 0) / 20))
      } catch {
        setMediaItems([])
      } finally {
        setLoadingMedia(false)
      }
    }
    fetchMedia()
  }, [mediaPage])

  // Fetch saved content
  useEffect(() => {
    const fetchSaved = async () => {
      setLoadingSaved(true)
      try {
        const res = await apiClient.getSavedContent(savedPage)
        const data = res.data
        setSavedItems(data.items || [])
        setSavedTotalPages(Math.ceil((data.total || 0) / 20))
      } catch {
        setSavedItems([])
      } finally {
        setLoadingSaved(false)
      }
    }
    fetchSaved()
  }, [savedPage])

  const handleUnsave = async (item: any) => {
    try {
      await apiClient.unsaveContent(item.data?.id || item.savedId, item.type)
      setSavedItems(prev => prev.filter(s => s.savedId !== item.savedId))
    } catch {
      // ignore
    }
  }

  const resolveSavedThumbnail = (data: any): string | null => {
    const isValidUrlString = (value: unknown): value is string => {
      if (typeof value !== 'string') return false
      const normalized = value.trim()
      return normalized.length > 0 && normalized !== 'null' && normalized !== 'undefined'
    }

    const pickFromObject = (obj: any): string | null => {
      if (!obj || typeof obj !== 'object') return null

      const directCandidates = [
        obj.cover_image,
        obj.coverImage,
        obj.image,
        obj.image_url,
        obj.media_url,
        obj.thumbnail,
        obj.thumbnail_url,
        obj.url,
        obj.src,
      ]

      const direct = directCandidates.find(isValidUrlString)
      if (direct) return direct

      if (Array.isArray(obj.media)) {
        const fromMedia = pickFromArray(obj.media)
        if (fromMedia) return fromMedia
      }

      return null
    }

    const pickFromArray = (arr: any[]): string | null => {
      if (!Array.isArray(arr) || arr.length === 0) return null

      const imageLike = arr.find((item) => {
        if (typeof item === 'string') return false
        const type = String(item?.type ?? item?.media_type ?? item?.mime_type ?? '').toLowerCase()
        return type.includes('image')
      })

      const candidate = imageLike ?? arr[0]
      if (isValidUrlString(candidate)) return candidate

      return pickFromObject(candidate)
    }

    const parseMaybeJson = (value: string): unknown => {
      const trimmed = value.trim()
      if (!(trimmed.startsWith('{') || trimmed.startsWith('['))) return value
      try {
        return JSON.parse(trimmed)
      } catch {
        return value
      }
    }

    const primary = pickFromObject(data)
    if (primary) return primary

    const media = data?.media
    if (isValidUrlString(media)) {
      const parsed = parseMaybeJson(media)
      if (typeof parsed === 'string') return parsed
      if (Array.isArray(parsed)) {
        const fromArray = pickFromArray(parsed)
        if (fromArray) return fromArray
      }
      if (parsed && typeof parsed === 'object') {
        const fromObj = pickFromObject(parsed)
        if (fromObj) return fromObj
      }
    }

    if (Array.isArray(media)) {
      const fromArray = pickFromArray(media)
      if (fromArray) return fromArray
    }

    return null
  }

  const formatSavedDate = (savedAt: unknown): string | null => {
    const value = Number(savedAt)
    if (!Number.isFinite(value) || value <= 0) return null

    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return null

    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="bg-white p-6 rounded-2xl border">

      {/* Header + Tabs */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Gallery</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('media')}
            className="flex items-center gap-1.5 px-2 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all"
            style={{
              backgroundColor: activeTab === 'media' ? '#212529' : '#F8F9FA',
              color: activeTab === 'media' ? '#FFFFFF' : '#5F6368',
            }}
          >
            <ImageIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            My Media
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className="flex items-center gap-1.5 px-2 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all"
            style={{
              backgroundColor: activeTab === 'saved' ? '#212529' : '#F8F9FA',
              color: activeTab === 'saved' ? '#FFFFFF' : '#5F6368',
            }}
          >
            <Bookmark className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Saved
          </button>
        </div>
      </div>

      {/* ── MEDIA TAB ── */}
      {activeTab === 'media' && (
        <>
          {loadingMedia ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : mediaItems.length === 0 ? (
            <div className="flex flex-col items-center py-16 gap-3">
              <ImageIcon className="w-12 h-12 text-gray-200" />
              <p className="font-semibold text-gray-700">No media yet</p>
              <p className="text-sm text-gray-400">Images and videos you upload will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {mediaItems.map((item) => (
                <div key={item.id} className="relative group rounded-xl overflow-hidden bg-gray-50 aspect-square">
                  {item.type === 'video' ? (
                    <video
                      src={item.url}
                      className="w-full h-full object-cover"
                      muted
                      onMouseEnter={e => { (e.currentTarget as HTMLVideoElement).play().catch(() => {}) }}
                      onMouseLeave={e => { (e.currentTarget as HTMLVideoElement).pause() }}
                    />
                  ) : (
                    <img
                      src={item.url}
                      alt={item.name || `Media item ${item.id || ''}`.trim()}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                    />
                  )}

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex flex-col items-end justify-start p-2">
                    {item.usageCount > 0 && (
                      <span className="text-xs bg-black/60 text-white rounded-full px-2 py-0.5">
                        Used in {item.usageCount} post{item.usageCount !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {mediaTotalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                disabled={mediaPage === 1}
                onClick={() => setMediaPage(p => p - 1)}
                className="px-3 py-1.5 text-sm rounded-lg bg-gray-100 disabled:opacity-40 hover:bg-gray-200 transition"
              >
                Previous
              </button>
              <span className="px-3 py-1.5 text-sm text-gray-500">
                {mediaPage} / {mediaTotalPages}
              </span>
              <button
                disabled={mediaPage === mediaTotalPages}
                onClick={() => setMediaPage(p => p + 1)}
                className="px-3 py-1.5 text-sm rounded-lg bg-gray-100 disabled:opacity-40 hover:bg-gray-200 transition"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* ── SAVED TAB ── */}
      {activeTab === 'saved' && (
        <>
          {loadingSaved ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : savedItems.length === 0 ? (
            <div className="flex flex-col items-center py-16 gap-3">
              <Bookmark className="w-12 h-12 text-gray-200" />
              <p className="font-semibold text-gray-700">Nothing saved yet</p>
              <p className="text-sm text-gray-400">Tap the bookmark on any post to save it here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {savedItems.map((item, idx) => {
                const data = item?.data ?? {}
                const isPost = item.type === 'post'
                const isBlog = item.type === 'blog' || item.type === 'story'
                const imgSrc = resolveSavedThumbnail(data)
                const authorHandle = String(data?.user?.username || data?.user?.full_name || '').trim()
                const savedDate = formatSavedDate(item.savedAt)

                const handleCardClick = () => {
                  const id = data?.id
                  if (!id) return
                  const type = (item.type ?? '').toLowerCase()
                  if (type === 'post') {
                    const postType = (data?.type || data?.post_type || '').toUpperCase()
                    router.push(postType === 'QUESTION' ? `/questions/${id}` : `/posts/${id}`)
                  } else if (type === 'story') {
                    router.push(`/stories/${id}`)
                  } else if (type === 'blog') {
                    const blogType = (data?.type || '').toUpperCase()
                    router.push(blogType === 'STORY' ? `/stories/${id}` : `/blogs/${id}`)
                  }
                }

                return (
                  <div
                    key={String(item.savedId ?? item.contentId ?? data?.id ?? `saved-${idx}`)}
                    className="flex gap-4 p-4 rounded-xl border hover:border-gray-300 transition group cursor-pointer"
                    style={{ borderColor: '#E8E8E8' }}
                    onClick={handleCardClick}
                  >
                    {/* Thumbnail */}
                    {imgSrc ? (
                      <img
                        src={imgSrc}
                        alt={data?.title ? `${data.title} thumbnail` : `${item.type} thumbnail`}
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                        {isBlog ? (
                          <BookOpen className="w-6 h-6 text-gray-300" />
                        ) : (
                          <FileText className="w-6 h-6 text-gray-300" />
                        )}
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          {data?.title && (
                            <RichTextContent className="font-semibold text-sm text-gray-900 truncate" html={data.title} />
                          )}
                          {data?.content && (
                            <RichTextContent className="text-sm text-gray-500 line-clamp-2 mt-0.5" html={data.content} />
                          )}
                          {data?.user && (
                            <p className="text-xs text-gray-400 mt-1">
                              by @{authorHandle || 'user'}
                            </p>
                          )}
                        </div>

                        <button
                          onClick={(e) => { e.stopPropagation(); handleUnsave(item) }}
                          className="flex-shrink-0 p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition"
                          title="Remove from saved"
                        >
                          <Bookmark className="w-4 h-4 fill-current" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{
                            backgroundColor: isPost ? '#EFF6FF' : '#F0FDF4',
                            color: isPost ? '#1d9bf0' : '#16a34a',
                          }}
                        >
                          {item.type}
                        </span>
                        {savedDate && (
                          <span className="text-xs text-gray-400">
                            {savedDate}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Pagination */}
          {savedTotalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                disabled={savedPage === 1}
                onClick={() => setSavedPage(p => p - 1)}
                className="px-3 py-1.5 text-sm rounded-lg bg-gray-100 disabled:opacity-40 hover:bg-gray-200 transition"
              >
                Previous
              </button>
              <span className="px-3 py-1.5 text-sm text-gray-500">
                {savedPage} / {savedTotalPages}
              </span>
              <button
                disabled={savedPage === savedTotalPages}
                onClick={() => setSavedPage(p => p + 1)}
                className="px-3 py-1.5 text-sm rounded-lg bg-gray-100 disabled:opacity-40 hover:bg-gray-200 transition"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}