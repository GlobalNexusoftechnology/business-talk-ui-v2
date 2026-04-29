'use client'

import { X, ImageIcon, BookOpen, Tag } from 'lucide-react'
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
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-gray-100 p-2 rounded-full">
          <BookOpen className="w-5 h-5" />
        </div>
        <h3 className="font-semibold text-gray-900">Share Your Story</h3>
      </div>

      <input
        value={storyTitle}
        onChange={(e) => setStoryTitle(e.target.value)}
        placeholder="Give your story a compelling title..."
        className="w-full p-3 bg-gray-50 border rounded-xl"
      />

      <textarea
        value={storyText}
        placeholder='Tell your story... Share insights, experiences, and lessons learned.'
        onChange={(e) => setStoryText(e.target.value)}
        className="w-full p-3 mt-3 bg-gray-50 border rounded-xl"
      />

      <div className="flex justify-between mt-4">
        <div className="flex gap-4 items-center">
          <input
            type="file"
            id="media-upload"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <label htmlFor="media-upload" className="cursor-pointer flex gap-2">
            <ImageIcon className='text-[#474b50]'/> Add Cover
          </label>

          <button onClick={() => setShowTagsPopup(true)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-all">
            <Tag className="w-4 h-4" />
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

      {coverImage.length > 0 && (
        <p className="text-sm mt-2">{coverImage.length} file selected</p>
      )}

      <div className="flex flex-nowrap overflow-x-auto gap-2 mt-2 pb-1">
        {tags.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 text-sm px-2 py-1 rounded bg-gray-100 whitespace-nowrap"
          >
            {tag}
            <X
              onClick={() => setTags(tags.filter((t) => t !== tag))}
              className="w-4 h-4 cursor-pointer"
            />
          </span>
        ))}
      </div>

      <TagsPopup
        isOpen={showTagsPopup}
        onClose={() => setShowTagsPopup(false)}
        onTagsChange={setTags}
        selectedTags={tags}
      />
    </div>
  )
}