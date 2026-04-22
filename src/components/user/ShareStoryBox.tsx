'use client'

import { BookOpen, Tag, X, ImageIcon } from 'lucide-react'
import { useState } from 'react'
import { TagsPopup } from '@/components/shared/TagsPopup'
import apiClient from '@/lib/api-client'

export function ShareStoryBox() {
  const [storyTitle, setStoryTitle] = useState('')
  const [storyText, setStoryText] = useState('')
  const [coverImage, setCoverImage] = useState<File[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [showTagsPopup, setShowTagsPopup] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setCoverImage(Array.from(e.target.files))
    }
  }

  const handleShareStory = async () => {
    if (!storyTitle && !storyText) return

    try {
      setLoading(true)

      const formData = new FormData()
      formData.append('type', 'STORY')
      formData.append('title', storyTitle)
      formData.append('content', storyText)
      formData.append('tags', JSON.stringify(tags))

      if (coverImage[0]) {
        formData.append('cover_image', coverImage[0])
      }

      await apiClient['client'].post('/blogs', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      setStoryTitle('')
      setStoryText('')
      setCoverImage([])
      setTags([])

      window.location.reload()
    } catch (err) {
      console.error('Story failed:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-2xl border">
      <input
        value={storyTitle}
        onChange={(e) => setStoryTitle(e.target.value)}
        placeholder="Title"
        className="w-full p-3 bg-gray-50 border rounded-xl"
      />

      <textarea
        value={storyText}
        onChange={(e) => setStoryText(e.target.value)}
        className="w-full p-3 mt-3 bg-gray-50 border rounded-xl"
      />

      <div className="flex justify-between mt-4">
        <div className="flex gap-4 items-center">
          <input
            type="file"
            id="media-upload"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <label htmlFor="media-upload" className="cursor-pointer flex gap-2">
            <ImageIcon />
          </label>

          <button onClick={() => setShowTagsPopup(true)}>
            Add Tags ({tags.length})
          </button>
        </div>

        <button
          onClick={handleShareStory}
          disabled={loading || !storyText.trim()}
          className="bg-black text-white px-6 py-2 rounded-lg"
        >
          {loading ? 'Publishing...' : 'Publish Story'}
        </button>
      </div>

      {tags.map((tag) => (
        <span key={tag} className="mr-2">
          {tag}
          <X onClick={() => setTags(tags.filter((t) => t !== tag))} />
        </span>
      ))}

      <TagsPopup
        isOpen={showTagsPopup}
        onClose={() => setShowTagsPopup(false)}
        onTagsChange={setTags}
        selectedTags={tags}
      />
    </div>
  )
}