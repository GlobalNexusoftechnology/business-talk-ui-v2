'use client'

import { useState } from 'react'
import { ImageIcon, Tag } from 'lucide-react'
import { TagsPopup } from '@/components/shared/TagsPopup'
import apiClient from '@/lib/api-client'

export function AdminCreateBlogBox() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [cover, setCover] = useState<File[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [showTags, setShowTags] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleCreate = async () => {
    if (!content.trim()) return

    try {
      setLoading(true)

      const formData = new FormData()
      formData.append('type', 'ADMIN_BLOG') // 🔥 KEY DIFFERENCE
      formData.append('title', title)
      formData.append('content', content)
      formData.append('tags', JSON.stringify(tags))

      if (cover[0]) formData.append('cover_image', cover[0])

      await apiClient.createBlog(formData)

      setTitle('')
      setContent('')
      setCover([])
      setTags([])
      window.location.reload()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-2xl border">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Blog title"
        className="w-full p-3 bg-gray-50 border rounded-xl"
      />

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write admin blog..."
        className="w-full mt-3 p-3 bg-gray-50 border rounded-xl"
      />

      <div className="flex justify-between mt-4">
        <div className="flex gap-4">
          <input hidden type="file" id="blog-img" onChange={(e) => setCover(Array.from(e.target.files || []))} />
          <label htmlFor="blog-img" className="cursor-pointer">
            <ImageIcon />
          </label>

          <button onClick={() => setShowTags(true)}>
            <Tag /> Tags
          </button>
        </div>

        <button
          onClick={handleCreate}
          className="bg-black text-white px-6 py-2 rounded-lg"
        >
          {loading ? 'Publishing...' : 'Create Blog'}
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