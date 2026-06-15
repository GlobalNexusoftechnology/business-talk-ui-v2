'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { ImageIcon, Tag, X } from 'lucide-react'
import { TagsPopup } from '@/components/shared/TagsPopup'
import apiClient from '@/lib/api-client'
import { validateImageFile, validateFileBeforeUpload } from '@/lib/utils'
// import BasicEditor from '../editor/BasicEditor'

export function AdminCreateStoryBox({ onCreated }: { onCreated?: () => void }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [cover, setCover] = useState<File[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [showTags, setShowTags] = useState(false)
  const [loading, setLoading] = useState(false)
  const queryClient = useQueryClient()

  const handleCreate = async () => {
    if (!content.trim()) return

    try {
      setLoading(true)

      // Validate cover image before upload
      if (cover.length > 0) {
        const err = await validateFileBeforeUpload(cover[0])
        if (err) { alert(err); setLoading(false); return }
      }

      const formData = new FormData()
      formData.append('type', 'STORY')
      formData.append('title', title)
      formData.append('content', content)
      formData.append('tags', JSON.stringify(tags))

      if (cover[0]) formData.append('cover_image', cover[0])

      await apiClient.createBlog(formData)

      setTitle('')
      setContent('')
      setCover([])
      setTags([])
      await queryClient.invalidateQueries({ queryKey: ['admin-stories'] })
      await queryClient.invalidateQueries({ queryKey: ['stories-feed'] })
      onCreated?.()
    } catch (err) {
      console.error(err)
      const status = (err as any)?.response?.status
      if (status === 413) {
        alert('Upload failed: File is too large. Please upload a smaller file.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-2xl border">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Story title"
        className="w-full p-3 bg-gray-50 border rounded-xl"
      />

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write story..."
        className="w-full mt-3 min-h-[200px] max-h-[45vh] overflow-y-auto resize-y p-3 bg-gray-50 border rounded-xl hover:border-gray-400 focus-within:border-gray-400 transition-colors  selected:border-gray-700"
      />

      {/* 
      <BasicEditor
        value={content}
        onChange={setContent}
        placeholder="Write story..."
        className="w-full mt-3 p-3 bg-gray-50 border rounded-xl hover:border-gray-400 focus-within:border-gray-400 transition-colors  selected:border-gray-700"
      />
      */}

      {cover.length > 0 && (
        <div className="relative inline-block mt-3">
          <img
            src={URL.createObjectURL(cover[0])}
            alt="Cover preview"
            className="h-36 max-w-full rounded-xl border border-gray-200 object-cover"
          />
          <button
            type="button"
            onClick={() => setCover([])}
            className="absolute -top-1.5 -right-1.5 bg-gray-900 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-500 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Tags */}
              {tags.length > 0 && (
                <div className="flex items-center gap-2 mb-4">
                  <Tag className="w-4 h-4" />
                    <div className="flex flex-wrap gap-2">
                    {tags.map((tag, idx) => (
                      <span 
                        key={idx} 
                        className="px-3 py-1 rounded-full text-sm font-medium"
                        style={{ 
                          backgroundColor: '#F3F4F6',
                          color: '#5F6368' 
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

      <div className="flex flex-col sm:flex-row sm:justify-between gap-3 mt-4">
        <div className="flex gap-4">
          <input hidden type="file" id="story-img" accept="image/jpeg,image/png,image/gif,image/webp" onChange={(e) => {
            const file = e.target.files?.[0]
            if (!file) return
            const err = validateImageFile(file)
            if (err) { alert(err); return }
            setCover([file])
          }} />
          <label htmlFor="story-img" className="cursor-pointer">
            <ImageIcon />
          </label>

          <button type="button" onClick={() => setShowTags(true)}>
            <Tag /> Tags
          </button>
        </div>

        <button
          type="button"
          onClick={handleCreate}
          className="bg-black text-white px-6 py-2 rounded-lg"
        >
          {loading ? 'Publishing...' : 'Create Story'}
        </button>
      </div>

      <TagsPopup
        isOpen={showTags}
        onClose={() => setShowTags(false)}
        onTagsChange={setTags}
        selectedTags={tags}
      />
    </div>
  )
}