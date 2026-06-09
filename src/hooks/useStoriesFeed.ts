import { useInfiniteQuery } from '@tanstack/react-query'
import apiClient, { extractPaginatedData } from '@/lib/api-client'

export function useStoriesFeed() {
  return useInfiniteQuery({
    queryKey: ['stories-feed'],

    initialPageParam: 1,

    queryFn: async ({ pageParam }) => {
      const res = await apiClient.getStories(
        pageParam,
        50
      )

      const {
        data,
        hasMore,
      } = extractPaginatedData(res)

      const stories = data.map((story: any) => ({
        id: story.id,
        authorId: story.user?.id || '',
        author: {
          name:
            story.user?.full_name ||
            story.user?.username ||
            'Unknown',

          avatar:
            story.user?.profile_photo ||
            `https://ui-avatars.com/api/name=${encodeURIComponent(
              story.user?.full_name ||
              story.user?.username
            )}`,

          title:
            story.user?.profession ||
            'User',
        },

        storyTitle: story.title,
        excerpt: story.content,
        coverImage: story.cover_image,

        timestamp: new Date(
          Number(story.created_on)
        ).toLocaleString(),

        views: story.views ?? 0,

        likes:
          story.likes ??
          story.likes_count ??
          0,

        liked: Boolean(
          story.liked ??
          story.is_liked ??
          false
        ),

        comments:
          story.commentsCount ?? 0,

        readTime: '5 min read',

        category:
          Array.isArray(story.tags)
            ? story.tags[0]?.name ||
              'Story'
            : story.tags?.name ||
              'Story',
      }))

      return {
        data: stories,
        hasMore,
        nextPage:
          pageParam + 1,
      }
    },

    getNextPageParam:
      lastPage =>
        lastPage.hasMore
          ? lastPage.nextPage
          : undefined,
  })
}