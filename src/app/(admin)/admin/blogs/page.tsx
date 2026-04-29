'use client'

import { useState } from 'react'
import { Button } from '@/components/shared/Button'
import { Card } from '@/components/shared/Card'
import { AdminCreateBlogBox } from '@/components/admin/AdminCreateBlogBox'
import { useAdminBlogs, useDeleteBlog } from '@/hooks/useAdminBlogs'
import apiClient from '@/lib/api-client'
import adminApi from '@/lib/admin-api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const filters = ['All', 'Latest', 'Trending', 'Reported']

export default function AdminBlogsPage() {
  const [activeFilter, setActiveFilter] = useState('All')
  const [showCreate, setShowCreate] = useState(false)

  const queryClient = useQueryClient()
  const { data: blogs = [], isLoading } = useAdminBlogs(activeFilter)
  const deleteBlog = useDeleteBlog()
  const createBlog = useMutation({
    mutationFn: async (content: string) => {
      // Blog API expects FormData
      const formData = new FormData()
      formData.append('content', content)
      return apiClient.createBlog(formData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blogs'] })
      setShowCreate(false)
    },
  })

  return (
    <div>
      <h1 className="text-3xl font-bold text-secondary-900 mb-6">Blogs Management</h1>
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
          Create Blog
        </Button>
      </div>
      <Card>
        <div className="divide-y">
          {isLoading ? (
            <div className="py-8 text-center text-secondary-500">Loading...</div>
          ) : blogs.length === 0 ? (
            <div className="py-8 text-center text-secondary-500">No blogs found.</div>
          ) : blogs.map((blog: any) => (
            <div key={blog.id} className="flex items-center justify-between py-4">
              <div>
                <div className="font-semibold">{blog.title || blog.content}</div>
                <div className="text-xs text-secondary-500">by {blog.user?.username || blog.author?.name || 'User'} • {blog.time || blog.created_on}</div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="danger" isLoading={deleteBlog.status === 'pending'} onClick={() => deleteBlog.mutate(blog.id)}>Delete</Button>
                <Button size="sm" variant="secondary">Warn User</Button>
                <Button size="sm" variant="secondary">Ban User</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
      {showCreate && (
        <AdminCreateBlogBox
          onClose={() => setShowCreate(false)}
          onCreate={(content: string) => createBlog.mutate(content)}
          isLoading={createBlog.status === 'pending'}
        />
      )}
    </div>
  )
}
