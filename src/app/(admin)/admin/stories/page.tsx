'use client'

import { useState } from 'react'
import { Button } from '@/components/shared/Button'
import { AdminCreateStoryBox } from '@/components/admin/AdminCreateStoryBox'
import { useAdminStories, useDeleteStory } from '@/hooks/useAdminStories'
import { useBanUser, useWarnUser } from '@/hooks/useAdminPosts'
import { AdminContentCard } from '@/components/admin/AdminContentCard'

const filters = ['All', 'Latest', 'Trending', 'Reported']

export default function AdminStoriesPage() {
  const [activeFilter, setActiveFilter] = useState('All')
  const [showCreate, setShowCreate] = useState(false)

  const { data: stories = [], isLoading } = useAdminStories(activeFilter)
  const deleteStory = useDeleteStory()
  const warnUser = useWarnUser()
  const banUser = useBanUser()

  return (
    <div className="p-6 min-h-screen" style={{ backgroundColor: '#F8F9FA' }}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold" style={{ color: '#212529' }}>Stories Management</h1>
          <Button onClick={() => setShowCreate(true)}>Create Story</Button>
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
        ) : stories.length === 0 ? (
          <div className="py-16 text-center text-gray-400">No stories found.</div>
        ) : (
          stories.map((s: any) => (
            <AdminContentCard
              key={s.id}
              id={s.id}
              type="story"
              author={{
                id: s.user?.id || '',
                name: s.user?.full_name || s.user?.username || 'Unknown',
                avatar: s.user?.profile_photo,
                title: s.user?.profession,
              }}
              title={s.title}
              content={s.content}
              coverImage={s.cover_image}
              media={s.media || []}
              likes={s.upvotes ?? s.likes ?? 0}
              commentsCount={s.comments_count ?? 0}
              views={s.views}
              createdOn={s.created_on}
              onWarn={(uid) => warnUser.mutate(uid)}
              onBan={(uid) => banUser.mutate(uid)}
              onDelete={(id) => deleteStory.mutate(id)}
            />
          ))
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="w-full max-w-2xl">
            <AdminCreateStoryBox />
            <div className="text-center mt-4">
              <Button onClick={() => setShowCreate(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}