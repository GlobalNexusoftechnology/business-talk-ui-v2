'use client'

import { useState } from 'react'
import { Card } from '@/components/shared/Card'
import { Button } from '@/components/shared/Button'
import { AdminCreateQuestionBox } from '@/components/admin/AdminCreateQuestionBox'
import { useAdminQuestions, useDeleteQuestion } from '@/hooks/useAdminQuestions'
import apiClient from '@/lib/api-client'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const filters = ['All', 'Latest', 'Trending', 'Reported']

export default function AdminQuestionsPage() {
  const [activeFilter, setActiveFilter] = useState('All')
  const [showCreate, setShowCreate] = useState(false)

  const queryClient = useQueryClient()
  const { data: questions = [], isLoading } = useAdminQuestions(activeFilter)
  const deleteQuestion = useDeleteQuestion()
  const createQuestion = useMutation({
    mutationFn: async (content: string) => {
      // Questions are created as posts with post_type QUESTION
      return apiClient.createPost({ content, post_type: 'QUESTION' })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-questions'] })
      setShowCreate(false)
    },
  })

  return (
    <div>
      <h1 className="text-3xl font-bold text-secondary-900 mb-6">Questions Management</h1>
      <div className="mb-4 flex gap-2 items-center">
        {filters.map((f) => (
          <Button
            key={f}
            variant={activeFilter === f ? 'primary' : 'outline'}
            className="capitalize"
            onClick={() => setActiveFilter(f)}
          >
            {f}
          </Button>
        ))}
        <Button variant="primary" className="ml-auto" onClick={() => setShowCreate(true)}>
          Create Question
        </Button>
      </div>
      <Card>
        <div className="divide-y">
          {isLoading ? (
            <div className="py-8 text-center text-secondary-500">Loading...</div>
          ) : questions.length === 0 ? (
            <div className="py-8 text-center text-secondary-500">No questions found.</div>
          ) : questions.map((q: any) => (
            <div key={q.id} className="flex items-center justify-between py-4">
              <div>
                <div className="font-semibold">{q.title || q.content}</div>
                <div className="text-xs text-secondary-500">by {q.user?.username || q.author?.name || 'User'} • {q.time || q.created_on}</div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="danger" isLoading={deleteQuestion.status === 'pending'} onClick={() => deleteQuestion.mutate(q.id)}>Delete</Button>
                <Button size="sm" variant="secondary">Warn User</Button>
                <Button size="sm" variant="secondary">Ban User</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
      {showCreate && (
        <AdminCreateQuestionBox
          onClose={() => setShowCreate(false)}
          onCreate={(content: string) => createQuestion.mutate(content)}
          isLoading={createQuestion.status === 'pending'}
        />
      )}
    </div>
  )
}
