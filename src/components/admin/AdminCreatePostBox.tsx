'use client'

import { useState } from 'react'
import { ImageIcon, Video } from 'lucide-react'
import apiClient from '@/lib/api-client'

export function AdminCreatePostBox() {
  const [content, setContent] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
    }
  }

  const handleCreate = async () => {
    if (!content.trim()) return

    try {
      setLoading(true)

      const formData = new FormData()
      formData.append('type', 'NORMAL')
      formData.append('content', content)
      formData.append('tags', JSON.stringify([]))

      files.forEach((file) => formData.append('media', file))

      await apiClient.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      setContent('')
      setFiles([])
      window.location.reload()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl p-6 border mb-6">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Create an admin post..."
        className="w-full p-4 rounded-xl bg-gray-50 border"
      />

      <div className="flex flex-wrap justify-between gap-2 mt-4">
        <input type="file" multiple hidden id="post-media" onChange={handleFileSelect} />
        <label htmlFor="post-media" className="flex gap-2 cursor-pointer">
          <ImageIcon /> <Video />
        </label>

        <button
          onClick={handleCreate}
          disabled={loading || !content.trim()}
          className="bg-black text-white px-6 py-2 rounded-lg"
        >
          {loading ? 'Posting...' : 'Create Post'}
        </button>
      </div>
    </div>
  )
}