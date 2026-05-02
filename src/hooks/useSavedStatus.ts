import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/api-client'

/**
 * Persistent save/unsave state backed by the real API.
 * All instances share the same React Query cache key ['my-saved'] so the
 * saved-content list is fetched only once per session and reused across every
 * post card on the feed.
 */
export function useSavedStatus(
  contentId: string | undefined,
  contentType: 'post' | 'blog'
) {
  const queryClient = useQueryClient()
  const [showToast, setShowToast] = useState(false)

  const { data: savedItems } = useQuery<any[]>({
    queryKey: ['my-saved'],
    queryFn: async () => {
      const res = await apiClient.getSavedContent(1)
      // API shape: { items: [...] } or array directly
      return res.data?.items ?? (Array.isArray(res.data) ? res.data : [])
    },
    staleTime: 2 * 60 * 1000, // 2 min — shared across all save buttons
    enabled: !!contentId,
  })

  const isSaved = (savedItems ?? []).some((item: any) => {
    const itemId = String(item.data?.id ?? item.contentId ?? item.savedId ?? '')
    const itemType: string = item.type ?? ''
    return itemId === String(contentId) && itemType === contentType
  })

  const save = async () => {
    if (!contentId) return
    try {
      await apiClient.saveContent(contentId, contentType)
      // Optimistically add to cache so the icon flips immediately
      queryClient.setQueryData<any[]>(['my-saved'], (prev = []) => [
        ...prev,
        { data: { id: contentId }, type: contentType, savedId: contentId },
      ])
      setShowToast(true)
      setTimeout(() => setShowToast(false), 2500)
    } catch { /* ignore */ }
  }

  const unsave = async () => {
    if (!contentId) return
    try {
      await apiClient.unsaveContent(contentId, contentType)
      // Optimistically remove from cache
      queryClient.setQueryData<any[]>(['my-saved'], (prev = []) =>
        prev.filter((item: any) => {
          const itemId = String(item.data?.id ?? item.contentId ?? item.savedId ?? '')
          return !(itemId === String(contentId) && item.type === contentType)
        })
      )
    } catch { /* ignore */ }
  }

  const toggle = async (onToggle?: () => void) => {
    if (isSaved) await unsave()
    else await save()
    onToggle?.()
  }

  return { isSaved, toggle, showToast }
}
