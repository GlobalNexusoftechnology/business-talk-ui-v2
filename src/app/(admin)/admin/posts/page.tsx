'use client'

import { useState } from 'react'
import { Card } from '@/components/shared/Card'
import { Button } from '@/components/shared/Button'
import { AdminCreatePostBox } from '@/components/admin/AdminCreatePostBox'
import {
  useAdminPosts,
  useDeletePost,
  useWarnUser,
  useBanUser,
} from '@/hooks/useAdminPosts'

const filters = ['All', 'Latest', 'Trending', 'Reported']

export default function AdminPostsPage() {
  const [filter, setFilter] = useState('All')
  const [showCreate, setShowCreate] = useState(false)

  const { data: posts = [] } = useAdminPosts(filter)
  const deletePost = useDeletePost()
  const warnUser = useWarnUser()
  const banUser = useBanUser()

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Posts</h1>

      <div className="flex gap-2 mb-4">
        {filters.map((f) => (
          <Button key={f} onClick={() => setFilter(f)}>
            {f}
          </Button>
        ))}
        <Button className="ml-auto" onClick={() => setShowCreate(true)}>
          Create Post
        </Button>
      </div>

      <Card>
        {posts.map((p: any) => (
          <div key={p.id} className="flex justify-between py-4 border-b">
            <div>
              <p>{p.content}</p>
              <p className="text-sm text-gray-500">
                {p.user?.username}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => warnUser.mutate(p.user?.id)}
              >
                Warn
              </Button>

              <Button
                size="sm"
                variant="secondary"
                onClick={() => banUser.mutate(p.user?.id)}
              >
                Ban
              </Button>

              <Button
                size="sm"
                variant="danger"
                onClick={() => deletePost.mutate(p.id)}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </Card>

      {showCreate && <AdminCreatePostBox />}
    </div>
  )
}