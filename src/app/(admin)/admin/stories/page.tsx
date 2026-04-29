'use client'

import { useState } from 'react'
import { Button } from '@/components/shared/Button'
import { Card } from '@/components/shared/Card'
import { AdminCreateStoryBox } from '@/components/admin/AdminCreateStoryBox'
import { useAdminStories, useDeleteStory } from '@/hooks/useAdminStories'
import apiClient from '@/lib/api-client'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const filters = ['All', 'Latest', 'Trending', 'Reported']

export default function AdminStoriesPage() {
  const [activeFilter, setActiveFilter] = useState('All')
  const [showCreate, setShowCreate] = useState(false)

  const queryClient = useQueryClient()
  const { data: stories = [], isLoading } = useAdminStories(activeFilter)
  const deleteStory = useDeleteStory()
  const createStory = useMutation({
    mutationFn: async (content: string) => {
      // Story API expects FormData
      const formData = new FormData()
      formData.append('content', content)
      // Stories are created via createBlog with type STORY
      formData.append('type', 'STORY')
      return apiClient.createBlog(formData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-stories'] })
      setShowCreate(false)
    },
  })

  return (
    <div>
      <h1 className="text-3xl font-bold text-secondary-900 mb-6">Stories Management</h1>
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
          Create Story
        </Button>
      </div>
      <Card>
        <div className="divide-y">
          {isLoading ? (
            <div className="py-8 text-center text-secondary-500">Loading...</div>
          ) : stories.length === 0 ? (
            <div className="py-8 text-center text-secondary-500">No stories found.</div>
          ) : stories.map((story: any) => (
            <div key={story.id} className="flex items-center justify-between py-4">
              <div>
                <div className="font-semibold">{story.title || story.content}</div>
                <div className="text-xs text-secondary-500">by {story.user?.username || story.author?.name || 'User'} • {story.time || story.created_on}</div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="danger" isLoading={deleteStory.status === 'pending'} onClick={() => deleteStory.mutate(story.id)}>Delete</Button>
                <Button size="sm" variant="secondary">Warn User</Button>
                <Button size="sm" variant="secondary">Ban User</Button>
              </div>
            </div>
          ))}
        </div>
      </Card>
      {showCreate && (
        <AdminCreateStoryBox
          onClose={() => setShowCreate(false)}
          onCreate={(content: string) => createStory.mutate(content)}
          isLoading={createStory.status === 'pending'}
        />
      )}
    </div>
  )
}
