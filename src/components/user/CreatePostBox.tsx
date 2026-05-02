'use client'

import { ImageIcon, Video } from 'lucide-react'
import { useState } from 'react'
import apiClient from '@/lib/api-client'

export function CreatePostBox() {
  const [postContent, setPostContent] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files)
      setSelectedFiles((prev) => [...prev, ...filesArray])
    }
  }

  const handleCreatePost = async () => {
    if (!postContent.trim()) return

    try {
      setLoading(true)

      const formData = new FormData()
      formData.append('type', 'NORMAL')
      formData.append('content', postContent)

      selectedFiles.forEach((file) => {
        formData.append('media', file)
      })

      // tags optional
      formData.append('tags', JSON.stringify([]))

      await apiClient['client'].post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      setPostContent('')
      setSelectedFiles([])

      window.location.reload()
    } catch (err) {
      console.error('Create post failed:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border">
      <textarea
        value={postContent}
        onChange={(e) => setPostContent(e.target.value)}
        placeholder="Ask, Share, Contribute…"
        className="w-full min-h-[120px] p-4 rounded-xl resize-none bg-gray-50 border"
      />

      {selectedFiles.length > 0 && (
        <p className="text-sm mt-2">{selectedFiles.length} file(s) selected</p>
      )}

      <div className="flex justify-between mt-4">
        <input
          type="file"
          id="media-upload"
          accept="image/*,video/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        <label htmlFor="media-upload" className="cursor-pointer flex gap-2">
          <ImageIcon /> <Video />
        </label>

        <button
          onClick={handleCreatePost}
          disabled={loading || !postContent.trim()}
          className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-400 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Posting...' : 'Create Post'}
        </button>
      </div>
    </div>
  )
}