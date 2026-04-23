'use client'

import { HelpCircle, X } from 'lucide-react'
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
      <div className="flex gap-2 mb-3">
        <HelpCircle /> <h3>Ask a Question</h3>
      </div>

      <textarea
        value={questionText}
        onChange={(e) => setQuestionText(e.target.value)}
        className="w-full p-3 bg-gray-50 border rounded-xl"
      />

      <div className="flex justify-between mt-3">
        <button onClick={() => setShowTagsPopup(true)}>
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