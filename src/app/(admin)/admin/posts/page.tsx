'use client'


import { useState } from 'react'
import { Card } from '@/components/shared/Card'
import { Button } from '@/components/shared/Button'
import { AdminCreatePostBox } from '@/components/admin/AdminCreatePostBox'
import { useAdminPosts, useDeletePost } from '@/hooks/useAdminPosts'
import apiClient from '@/lib/api-client'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const filters = ['All', 'Latest', 'Trending', 'Reported']

export default function AdminPostsPage() {
  const [activeFilter, setActiveFilter] = useState('All')
  const [showCreate, setShowCreate] = useState(false)
  const queryClient = useQueryClient()
  const { data: posts = [], isLoading } = useAdminPosts(activeFilter)
  const deletePost = useDeletePost()
  const createPost = useMutation({
    mutationFn: async (content: string) => {
      return apiClient.createPost({ content })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] })
      setShowCreate(false)
    },
  })

  return (
    <div>
      <h1 className="text-3xl font-bold text-secondary-900 mb-6">Posts Management</h1>
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
          Create Post
        </Button>
      </div>
      <Card>
        <div className="divide-y">
          {isLoading ? (
            <div className="py-8 text-center text-secondary-500">Loading...</div>
          ) : posts.length === 0 ? (
            <div className="py-8 text-center text-secondary-500">No posts found.</div>
          ) : posts.map((post: any) => (
            <div key={post.id} className="flex items-center justify-between py-4">
              <div>
                <div className="font-semibold">{post.title || post.content}</div>
                <div className="text-xs text-secondary-500">by {post.user?.username || post.author?.name || 'User'} • {post.time || post.created_on}</div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="danger" isLoading={deletePost.status === 'pending'} onClick={() => deletePost.mutate(post.id)}>Delete</Button>
                <Button size="sm" variant="secondary">Warn User</Button>
                <Button size="sm" variant="secondary">Ban User</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
      {showCreate && (
        <AdminCreatePostBox
          onClose={() => setShowCreate(false)}
          onCreate={(content: string) => createPost.mutate(content)}
          isLoading={createPost.status === 'pending'}
        />
      )}
    </div>
  )
}
