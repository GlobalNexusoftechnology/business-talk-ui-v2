'use client'

import { HelpCircle, Tag, X } from 'lucide-react'
import { useState } from 'react'
import { TagsPopup } from '@/components/shared/TagsPopup'
import apiClient from '@/lib/api-client'

export function PostQuestionBox() {
  const [questionText, setQuestionText] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [showTagsPopup, setShowTagsPopup] = useState(false)
  const [loading, setLoading] = useState(false)

  const handlePostQuestion = async () => {
    if (!questionText.trim()) return

    try {
      setLoading(true)

      await apiClient.createPost({
        type: 'QUESTION',
        content: questionText,
        tags,
      })

      setQuestionText('')
      setTags([])

      window.location.reload()
    } catch (err) {
      console.error('Question post failed:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl p-6 mb-6 border">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-gray-100 p-2 rounded-full">
          <HelpCircle className="w-5 h-5" />
        </div>
        <h3 className="font-semibold text-gray-900">Ask a Question</h3>
      </div>

      <textarea
        value={questionText}
        placeholder='What would you like to know from the community?'
        onChange={(e) => setQuestionText(e.target.value)}
        className="w-full p-3 bg-gray-50 border rounded-xl"
      />

      <div className="flex justify-between mt-3">
        <button onClick={() => setShowTagsPopup(true)} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-all">
          <Tag className="w-4 h-4" />
          Add Tags ({tags.length})
        </button>

        <button
          onClick={handlePostQuestion}
          disabled={loading}
          className="bg-black text-white px-5 py-2 rounded-lg"
        >
          {loading ? 'Posting...' : 'Post Question'}
        </button>
      </div>

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