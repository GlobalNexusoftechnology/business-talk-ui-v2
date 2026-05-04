'use client'

import { useEffect, useState } from 'react'
import { Bookmark, Image, Loader2, FileText, BookOpen } from 'lucide-react'
import apiClient from '@/lib/api-client'

type GalleryTab = 'media' | 'saved'

export function ProfileGallery() {
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

  return (
    <div className="bg-white p-6 rounded-2xl border">

      {/* Header + Tabs */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Gallery</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('media')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              backgroundColor: activeTab === 'media' ? '#212529' : '#F8F9FA',
              color: activeTab === 'media' ? '#FFFFFF' : '#5F6368',
            }}
          >
            <Image className="w-4 h-4" />
            My Media
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{
              backgroundColor: activeTab === 'saved' ? '#212529' : '#F8F9FA',
              color: activeTab === 'saved' ? '#FFFFFF' : '#5F6368',
            }}
          >
            <Bookmark className="w-4 h-4" />
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
              <Image className="w-12 h-12 text-gray-200" />
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
                      onMouseEnter={e => (e.currentTarget as HTMLVideoElement).play()}
                      onMouseLeave={e => (e.currentTarget as HTMLVideoElement).pause()}
                    />
                  ) : (
                    <img
                      src={item.url}
                      alt={item.name || `Media item ${item.id || ''}`.trim()}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
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
              {savedItems.map((item) => {
                const data = item.data
                const isPost = item.type === 'post'
                const isBlog = item.type === 'blog' || item.type === 'story'

                return (
                  <div
                    key={item.savedId}
                    className="flex gap-4 p-4 rounded-xl border hover:border-gray-300 transition group"
                    style={{ borderColor: '#E8E8E8' }}
                  >
                    {/* Thumbnail */}
                    {(data?.media || data?.cover_image) && (
                      <img
                        src={data?.media || data?.cover_image}
                        alt={data?.title ? `${data.title} thumbnail` : `${item.type} thumbnail`}
                        className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                      />
                    )}

                    {/* No thumbnail — icon placeholder */}
                    {!(data?.media || data?.cover_image) && (
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
                            <p className="font-semibold text-sm text-gray-900 truncate">{data.title}</p>
                          )}
                          {data?.content && (
                            <p className="text-sm text-gray-500 line-clamp-2 mt-0.5">{data.content}</p>
                          )}
                          {data?.user && (
                            <p className="text-xs text-gray-400 mt-1">
                              by @{data.user.username}
                            </p>
                          )}
                        </div>

                        <button
                          onClick={() => handleUnsave(item)}
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
                        {item.savedAt && (
                          <span className="text-xs text-gray-400">
                            {new Date(item.savedAt).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                            })}
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