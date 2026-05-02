'use client'

import { useState } from 'react'
import { Button } from '@/components/shared/Button'
import { AdminCreateQuestionBox } from '@/components/admin/AdminCreateQuestionBox'
import { useAdminQuestions, useDeleteQuestion } from '@/hooks/useAdminQuestions'
import { useWarnUser, useBanUser } from '@/hooks/useAdminPosts'
import { AdminContentCard } from '@/components/admin/AdminContentCard'

const filters = ['All', 'Latest', 'Trending', 'Reported']

export default function AdminQuestionsPage() {
  const [activeFilter, setActiveFilter] = useState('All')
  const [showCreate, setShowCreate] = useState(false)

  const { data: questions = [], isLoading } = useAdminQuestions(activeFilter)
  const deleteQuestion = useDeleteQuestion()
  const warnUser = useWarnUser()
  const banUser = useBanUser()

  return (
    <div className="p-6 min-h-screen" style={{ backgroundColor: '#F8F9FA' }}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold" style={{ color: '#212529' }}>Questions Management</h1>
          <Button onClick={() => setShowCreate(true)}>Create Question</Button>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{
                backgroundColor: activeFilter === f ? '#212529' : '#fff',
                color: activeFilter === f ? '#fff' : '#5F6368',
                border: '1px solid #E8E8E8',
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-gray-400">Loading...</div>
        ) : questions.length === 0 ? (
          <div className="py-16 text-center text-gray-400">No questions found.</div>
        ) : (
          questions.map((q: any) => (
            <AdminContentCard
              key={q.id}
              id={q.id}
              type="question"
              author={{
                id: q.user?.id || '',
                name: q.user?.full_name || q.user?.username || 'Unknown',
                avatar: q.user?.profile_photo,
                title: q.user?.profession,
              }}
              title={q.content}
              content={q.description}
              tags={q.tags || []}
              likes={q.upvotes ?? q.likes ?? 0}
              commentsCount={q.comments_count ?? 0}
              views={q.views}
              createdOn={q.created_on}
              onWarn={(uid) => warnUser.mutate(uid)}
              onBan={(uid) => banUser.mutate(uid)}
              onDelete={(id) => deleteQuestion.mutate(id)}
            />
          ))
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="w-full max-w-2xl">
            <AdminCreateQuestionBox />
            <div className="text-center mt-4">
              <Button onClick={() => setShowCreate(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}