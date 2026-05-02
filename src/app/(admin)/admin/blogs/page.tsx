'use client'

import { useState } from 'react'
import { Button } from '@/components/shared/Button'
import { AdminCreateBlogBox } from '@/components/admin/AdminCreateBlogBox'
import { useAdminBlogs, useDeleteBlog } from '@/hooks/useAdminBlogs'
import { useBanUser, useWarnUser } from '@/hooks/useAdminPosts'
import { AdminContentCard } from '@/components/admin/AdminContentCard'

const filters = ['All', 'Latest', 'Trending', 'Reported']

export default function AdminBlogsPage() {
  const [activeFilter, setActiveFilter] = useState('All')
  const [showCreate, setShowCreate] = useState(false)

  const { data: blogs = [], isLoading } = useAdminBlogs(activeFilter)
  const deleteBlog = useDeleteBlog()
  const warnUser = useWarnUser()
  const banUser = useBanUser()

  return (
    <div className="p-6 min-h-screen" style={{ backgroundColor: '#F8F9FA' }}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold" style={{ color: '#212529' }}>Blogs Management</h1>
          <Button onClick={() => setShowCreate(true)}>Create Blog</Button>
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
        ) : blogs.length === 0 ? (
          <div className="py-16 text-center text-gray-400">No blogs found.</div>
        ) : (
          blogs.map((b: any) => (
            <AdminContentCard
              key={b.id}
              id={b.id}
              type="blog"
              author={{
                id: b.user?.id || '',
                name: b.user?.full_name || b.user?.username || 'Unknown',
                avatar: b.user?.profile_photo,
                title: b.user?.profession,
              }}
              title={b.title}
              content={b.content}
              coverImage={b.cover_image}
              media={b.media || []}
              tags={b.tags || []}
              likes={b.upvotes ?? b.likes ?? 0}
              commentsCount={b.comments_count ?? 0}
              views={b.views}
              createdOn={b.created_on}
              onWarn={(uid) => warnUser.mutate(uid)}
              onBan={(uid) => banUser.mutate(uid)}
              onDelete={(id) => deleteBlog.mutate(id)}
            />
          ))
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="w-full max-w-2xl">
            <AdminCreateBlogBox />
            <div className="text-center mt-4">
              <Button onClick={() => setShowCreate(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}