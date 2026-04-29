'use client'

import { MessageCircle, ThumbsUp, Send } from 'lucide-react'
import { useState, useEffect } from 'react'
import { ShareModal } from '@/components/shared/ShareModal'
import { ContentData } from '@/hooks/useContentViewer'
import apiClient from '@/lib/api-client'

interface Props {
  data: ContentData
}

export function QuestionViewCard({ data }: Props) {
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(data.likes || 0)

  const [answersList, setAnswersList] = useState<any[]>([])
  const [answersCount, setAnswersCount] = useState(0)

  const [showAnswers, setShowAnswers] = useState(false)
  const [answerInput, setAnswerInput] = useState('')
  // const [replyInput, setReplyInput] = useState('')
  // const [replyingTo, setReplyingTo] = useState<string | null>(null)

  const [likedAnswers, setLikedAnswers] = useState<Set<string>>(new Set())
  const [showShareModal, setShowShareModal] = useState(false)

  // ✅ FETCH ANSWERS COUNT + VIEW
  useEffect(() => {
    const init = async () => {
      if (!data?.id) return

      try {
        const res = await apiClient.getPostComments(data.id)

        setAnswersList(res || [])
        setAnswersCount((res || []).length)

        // await apiClient.incrementPostView(data.id) // Removed: method does not exist
      } catch (err) {
        console.error('QuestionView init failed')
      }
    }

    init()
  }, [data?.id])

  // ✅ LIKE QUESTION
  const handleLike = () => {
    setLiked(prev => {
      setLikeCount((c: number) => prev ? c - 1 : c + 1)
      return !prev
    })
  }

  // ✅ ADD ANSWER
  const handleAddAnswer = () => {
    if (!answerInput.trim()) return

    const newAnswer = {
      id: Date.now(),
      author: { name: 'You', avatar: '/avatar.png' },
      content: answerInput,
      likes: 0,
      replies: []
    }

    setAnswersList([...answersList, newAnswer])
    setAnswersCount(prev => prev + 1)
    setAnswerInput('')
  }

  // ✅ LIKE ANSWER
  const handleLikeAnswer = (id: number) => {
    const key = `answer-${id}`
    const isLiked = likedAnswers.has(key)

    const newSet = new Set(likedAnswers)
    isLiked ? newSet.delete(key) : newSet.add(key)
    setLikedAnswers(newSet)

    setAnswersList(prev =>
      prev.map(a =>
        a.id === id
          ? { ...a, likes: isLiked ? a.likes - 1 : a.likes + 1 }
          : a
      )
    )
  }

  return (
    <div className="space-y-4">

      {/* Header */}
      <div className="flex items-center gap-3">
        <img 
        src={data.author?.avatar} 
        alt={data.author?.name || 'Avatar'} 
        className="w-12 h-12 rounded-full" />
        <div>
          <h3>{data.author?.name}</h3>
          <p className="text-sm text-gray-500">{data.timestamp}</p>
        </div>
      </div>

      {/* Question */}
      <h2 className="text-lg font-semibold">
        {data.question || data.content}
      </h2>

      {/* Actions */}
      <div className="flex gap-3 border-t pt-3">
        <button onClick={handleLike} className={`flex items-center gap-1 px-2 py-1 rounded ${liked ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:bg-gray-50'}`}>
          <ThumbsUp /> {likeCount}
        </button>

        <button onClick={() => setShowAnswers(!showAnswers)}>
          <MessageCircle /> {answersCount} Answers
        </button>

        <button onClick={() => setShowShareModal(true)}>
          <Send />
        </button>
      </div>

      {/* Answers */}
      {showAnswers && (
        <div className="space-y-3">

          <input
            value={answerInput}
            onChange={(e) => setAnswerInput(e.target.value)}
            placeholder="Write an answer..."
            className="border p-2 w-full"
          />

          <button onClick={handleAddAnswer}>Post</button>

          {answersList.map((ans) => (
            <div key={ans.id} className="border p-3 rounded">

              <p>{ans.content}</p>

              <button onClick={() => handleLikeAnswer(ans.id)}>
                <ThumbsUp /> {ans.likes}
              </button>

            </div>
          ))}
        </div>
      )}

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        postContent={data.content}
        contentType="question"
        contentId={data.id}
      />
    </div>
  )
}