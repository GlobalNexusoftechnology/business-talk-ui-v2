'use client'

import { useState } from 'react'
import { Button } from '@/components/shared/Button'
import { AdminCreatePostBox } from '@/components/admin/AdminCreatePostBox'
import { useAdminPosts, useDeletePost, useWarnUser, useBanUser } from '@/hooks/useAdminPosts'
import { AdminContentCard } from '@/components/admin/AdminContentCard'

const filters = ['All', 'Latest', 'Trending', 'Reported']

export default function AdminPostsPage() {
  const [filter, setFilter] = useState('All')
  const [showCreate, setShowCreate] = useState(false)

  const { data: posts = [], isLoading } = useAdminPosts(filter)
  const deletePost = useDeletePost()
  const warnUser = useWarnUser()
  const banUser = useBanUser()

  return (
    <div className="p-6 min-h-screen" style={{ backgroundColor: '#F8F9FA' }}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold" style={{ color: '#212529' }}>Posts Management</h1>
          <Button onClick={() => setShowCreate(true)}>Create Post</Button>
        </div>

        <div className="flex gap-2 mb-6 flex-wrap">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{
                backgroundColor: filter === f ? '#212529' : '#fff',
                color: filter === f ? '#fff' : '#5F6368',
                border: '1px solid #E8E8E8',
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-gray-400">Loading...</div>
        ) : posts.length === 0 ? (
          <div className="py-16 text-center text-gray-400">No posts found.</div>
        ) : (
          posts.map((p: any) => (
            <AdminContentCard
              key={p.id}
              id={p.id}
              type="post"
              author={{
                id: p.user?.id || '',
                name: p.user?.full_name || p.user?.username || 'Unknown',
                avatar: p.user?.profile_photo,
                title: p.user?.profession,
              }}
              content={p.content}
              media={p.media || []}
              tags={p.tags || []}
              likes={p.upvotes ?? p.likes ?? 0}
              commentsCount={p.commentsCount ?? p.comments_count ?? p.comment_count ?? 0}
              views={p.views}
              createdOn={p.created_on}
              onWarn={(uid) => warnUser.mutate(uid)}
              onBan={(uid) => banUser.mutate(uid)}
              onDelete={(id) => deletePost.mutate(id)}
            />
          ))
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="w-full max-w-2xl">
            <AdminCreatePostBox onCreated={() => setShowCreate(false)} />
            <div className="text-center mt-4">
              <Button onClick={() => setShowCreate(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}