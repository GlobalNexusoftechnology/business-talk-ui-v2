'use client'

import { useState } from 'react'
import { Card } from '@/components/shared/Card'
import { Button } from '@/components/shared/Button'
import { AdminCreateStoryBox } from '@/components/admin/AdminCreateStoryBox'
import { useAdminStories, useDeleteStory } from '@/hooks/useAdminStories'
import { useBanUser, useWarnUser } from '@/hooks/useAdminPosts'

const filters = ['All', 'Latest', 'Trending', 'Reported']

export default function AdminStoriesPage() {
  const [activeFilter, setActiveFilter] = useState('All')
  const [showCreate, setShowCreate] = useState(false)

  const { data: stories = [], isLoading } = useAdminStories(activeFilter)
  const deleteStory = useDeleteStory()
  const warnUser = useWarnUser()
  const banUser = useBanUser()

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Stories Management</h1>

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
          Create Story
        </Button>
      </div>

      <Card>
        <div className="divide-y">
          {isLoading ? (
            <div className="py-8 text-center">Loading...</div>
          ) : stories.map((s: any) => {
              const userId = s.user?.id

              return (
                <div key={s.id} className="flex justify-between py-4">
                  <div>
                    <p>{s.content}</p>
                    <p className="text-xs text-gray-500">{s.user?.username}</p>
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
                      onClick={() => deleteStory.mutate(s.id)}
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