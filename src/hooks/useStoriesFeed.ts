import { useQuery } from '@tanstack/react-query'
import apiClient from '../lib/api-client'

export function useStoriesFeed() {
  return useQuery({
    queryKey: ['stories-feed'],
    queryFn: async () => {
      const res = await apiClient.getStories()

      return (res.data || []).map((story: any) => ({
        id: story.id,
        author: {
          name: story.user?.full_name || story.user?.username || 'Unknown',
          avatar: story.user?.profile_photo || '/avatar.png',
          title: story.user?.profession || 'User',
        },
        storyTitle: story.title,
        excerpt: story.content,
        coverImage: story.cover_image,
        timestamp: new Date(Number(story.created_on)).toLocaleString(),
        views: story.views ?? 0,
        likes: story.likes ?? 0,
        comments: story.commentsCount ?? 0,
        readTime: '5 min read',
        category: Array.isArray(story.tags) ? (story.tags[0]?.name || 'Story') : (story.tags?.name || 'Story'),
      }))
    },
  })
}