'use client'

import { useState } from 'react'
import { Button } from '@/components/shared/Button'
import { AdminCreateBlogBox } from '@/components/admin/AdminCreateBlogBox'
import { useAdminBlogs, useDeleteBlog, useUpdateBlog } from '@/hooks/useAdminBlogs'
// import { useBanUser, useWarnUser } from '@/hooks/useAdminPosts'
import { AdminContentCard } from '@/components/admin/AdminContentCard'

const filters = ['All', 'Latest', 'Trending', 'Reported']

export default function AdminBlogsPage() {
  const [activeFilter, setActiveFilter] = useState('All')
  const [showCreate, setShowCreate] = useState(false)
  const [editingBlog, setEditingBlog] = useState<any | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [editTags, setEditTags] = useState('')
  const [editCoverUrl, setEditCoverUrl] = useState('')
  const [editCoverFile, setEditCoverFile] = useState<File | null>(null)
  const [editError, setEditError] = useState('')

  const { data: blogs = [], isLoading } = useAdminBlogs(activeFilter)
  const deleteBlog = useDeleteBlog()
  const updateBlog = useUpdateBlog()
  // const warnUser = useWarnUser()
  // const banUser = useBanUser()

  const openEditModal = (blog: any) => {
    setEditingBlog(blog)
    setEditTitle(blog?.title || '')
    setEditContent(blog?.content || '')
    setEditTags(
      Array.isArray(blog?.tags)
        ? blog.tags
            .map((t: any) => (typeof t === 'string' ? t : t?.name))
            .filter(Boolean)
            .join(', ')
        : ''
    )
    setEditCoverUrl(blog?.cover_image || '')
    setEditCoverFile(null)
    setEditError('')
  }

  const closeEditModal = () => {
    setEditingBlog(null)
    setEditTitle('')
    setEditContent('')
    setEditTags('')
    setEditCoverUrl('')
    setEditCoverFile(null)
    setEditError('')
  }

  const handleUpdateBlog = async () => {
    if (!editingBlog?.id) return

    const title = editTitle.trim()
    const content = editContent.trim()
    const tags = editTags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)

    if (!title && !content && !editCoverFile && !editCoverUrl.trim() && tags.length === 0) {
      setEditError('Please update at least one field before saving.')
      return
    }

    try {
      setEditError('')

      if (editCoverFile) {
        const formData = new FormData()
        if (title) formData.append('title', title)
        if (content) formData.append('content', content)
        if (tags.length > 0) formData.append('tags', JSON.stringify(tags))
        formData.append('cover_image', editCoverFile)

        await updateBlog.mutateAsync({ id: editingBlog.id, payload: formData })
      } else {
        const payload: Record<string, unknown> = {}
        if (title) payload.title = title
        if (content) payload.content = content
        if (tags.length > 0) payload.tags = tags
        if (editCoverUrl.trim()) payload.cover_image = editCoverUrl.trim()

        await updateBlog.mutateAsync({ id: editingBlog.id, payload })
      }

      closeEditModal()
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Failed to update blog.'
      setEditError(message)
    }
  }

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
              // onWarn={(uid) => warnUser.mutate(uid)}
              // onBan={(uid) => banUser.mutate(uid)}
              onDelete={(id) => deleteBlog.mutate(id)}
              onEdit={b.type === 'ADMIN_BLOG' ? () => openEditModal(b) : undefined}
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

      {editingBlog && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl border p-6" style={{ borderColor: '#E8E8E8' }}>
            <h2 className="text-xl font-semibold mb-4" style={{ color: '#212529' }}>
              Edit Admin Blog
            </h2>

            <div className="space-y-3">
              <input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Blog title"
                className="w-full p-3 bg-gray-50 border rounded-xl"
              />

              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Blog content"
                className="w-full p-3 bg-gray-50 border rounded-xl min-h-[160px]"
              />

              <input
                value={editTags}
                onChange={(e) => setEditTags(e.target.value)}
                placeholder="Tags (comma separated)"
                className="w-full p-3 bg-gray-50 border rounded-xl"
              />

              <input
                value={editCoverUrl}
                onChange={(e) => setEditCoverUrl(e.target.value)}
                placeholder="Cover image URL (optional)"
                className="w-full p-3 bg-gray-50 border rounded-xl"
              />

              <div>
                <label className="text-sm font-medium" style={{ color: '#5F6368' }}>
                  Upload new cover image (optional)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditCoverFile(e.target.files?.[0] || null)}
                  className="mt-1 w-full p-2 border rounded-xl bg-white"
                />
              </div>

              {editError && (
                <p className="text-sm" style={{ color: '#DC2626' }}>{editError}</p>
              )}
            </div>

            <div className="flex justify-end gap-3 mt-5">
              <Button onClick={closeEditModal}>Cancel</Button>
              <Button onClick={handleUpdateBlog} disabled={updateBlog.isPending}>
                {updateBlog.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}