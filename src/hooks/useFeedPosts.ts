import { useInfiniteQuery } from '@tanstack/react-query'
import apiClient from '../lib/api-client'
import { extractPaginatedData } from '@/lib/api-client'

export function useFeedPosts(
  postType: 'NORMAL' | 'QUESTION'
) {
  return useInfiniteQuery({
    queryKey: ['feed', postType],

    initialPageParam: 1,

    queryFn: async ({ pageParam }) => {
      const [forYouRes, followingRes] = await Promise.all([
        apiClient.getForYouFeed(pageParam, 50),
        apiClient.getFollowingFeed(pageParam, 50),
      ])

      const forYou = extractPaginatedData(forYouRes)
      const following = extractPaginatedData(followingRes)

      const combined = [
        ...forYou.data,
        ...following.data,
      ]

      const unique = Array.from(
        new Map(
          combined.map((p: any) => [p.id, p])
        ).values()
      )

      const normalized = unique.map((post: any) => {
        const firstImage = post.media?.find(
          (m: any) => m.type === 'image'
        )

        const firstVideo = post.media?.find(
          (m: any) => m.type === 'video'
        )

        return {
          id: post.id,
          authorId: String(post.user?.id || ''),
          content: post.content,
          timestamp: new Date(
            Number(post.created_on)
          ).toLocaleString(),

          image: firstImage?.url || null,
          video: firstVideo?.url || null,

          media: (post.media || []).map((m: any) => ({
            url: m.url,
            type: m.type,
          })),

          tags: (post.tags || []).map(
            (t: any) => t.name
          ),

          author: {
            name:
              post.user?.full_name ||
              post.user?.username ||
              'Unknown',

            avatar:
              post.user?.profile_photo ||
              `https://ui-avatars.com/api/name=${encodeURIComponent(
                post.user?.full_name ||
                post.user?.username
              )}`,

            title:
              post.user?.profession || '',
          },

          groupId: post.group?.id
            ? String(post.group.id)
            : null,

          group: post.group
            ? { name: post.group.name }
            : null,

          likes: post.upvotes || 0,
          liked: Boolean(
            post.liked ??
            post.is_liked ??
            (post.myVote === 'up')
          ),

          dislikes: post.downvotes || 0,

          views:
            post.views ||
            post.view_count ||
            0,

          comments:
            post.commentsCount || 0,

          personalized_rank:
            post.personalized_rank,

          type:
            (
              post.post_type ||
              post.type
            )?.toUpperCase(),

          created_on:
            post.created_on,
        }
      })

      const filtered = normalized.filter(
        (p: any) =>
          p.type === postType
      )

      return {
        data: filtered,
        hasMore:
          forYou.hasMore ||
          following.hasMore,
        nextPage: pageParam + 1,
      }
    },

    getNextPageParam: (
      lastPage
    ) =>
      lastPage.hasMore
        ? lastPage.nextPage
        : undefined,
  })
}