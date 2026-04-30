'use client'

import { useState } from 'react'
import { Card } from '@/components/shared/Card'
import { Button } from '@/components/shared/Button'
import { AdminCreateBlogBox } from '@/components/admin/AdminCreateBlogBox'
import { useAdminBlogs, useDeleteBlog } from '@/hooks/useAdminBlogs'
import { useBanUser, useWarnUser } from '@/hooks/useAdminPosts'

const filters = ['All', 'Latest', 'Trending', 'Reported']

export default function AdminBlogsPage() {
  const [activeFilter, setActiveFilter] = useState('All')
  const [showCreate, setShowCreate] = useState(false)

  const { data: blogs = [], isLoading } = useAdminBlogs(activeFilter)
  const deleteBlog = useDeleteBlog()
  const warnUser = useWarnUser()
  const banUser = useBanUser()

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Blogs Management</h1>

      <div className="mb-4 flex gap-2 items-center">
        {filters.map((f) => (
          <Button
            key={f}
            variant={activeFilter === f ? 'primary' : 'outline'}
            onClick={() => setActiveFilter(f)}
          >
            {f}
          </Button>
        ))}

        <Button className="ml-auto" onClick={() => setShowCreate(true)}>
          Create Blog
        </Button>
      </div>

      <Card>
        <div className="divide-y">
          {isLoading ? (
            <div className="py-8 text-center">Loading...</div>
          ) : blogs.map((b: any) => {
              const userId = b.user?.id

              return (
                <div key={b.id} className="flex justify-between py-4">
                  <div>
                    <p>{b.content}</p>
                    <p className="text-xs text-gray-500">{b.user?.username}</p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => userId && warnUser.mutate(userId)}
                      disabled={!userId}
                    >
                      Warn
                    </Button>

                    <Button
                      onClick={() => userId && banUser.mutate(userId)}
                      disabled={!userId}
                      variant="secondary"
                    >
                      Ban
                    </Button>

                    <Button
                      variant="danger"
                      onClick={() => deleteBlog.mutate(b.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              )
            })}
        </div>
      </Card>

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