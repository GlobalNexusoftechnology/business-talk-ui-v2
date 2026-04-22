import { useQuery } from '@tanstack/react-query'
import apiClient from '../lib/api-client'

export function useStoriesFeed() {
  return useQuery({
    queryKey: ['stories-feed'],
    queryFn: async () => {
      const res = await apiClient.getBlogs()

      return (res.data || [])
        .filter((item: any) => item.type === 'STORY')
        .map((story: any) => ({
          id: story.id,

          // ✅ AUTHOR MAPPING (MOST IMPORTANT FIX)
          author: {
            name:
              story.user?.full_name ||
              story.user?.username ||
              'Unknown',

            avatar:
              story.user?.profile_photo ||
              '/avatar.png',

            title:
              story.user?.profession ||
              'User',
          },

          // ✅ CONTENT MAPPING
          storyTitle: story.title,
          excerpt: story.content,
          coverImage: story.cover_image,

          // ✅ META
          timestamp: new Date(
            Number(story.created_on)
          ).toLocaleString(),

          views: story.views ?? 0,
          likes: story.likes ?? 0,
          comments: 0, // until backend provides
          readTime: '5 min read', // optional calc later
          category: 'General', // optional
        }))
    },
  })
}