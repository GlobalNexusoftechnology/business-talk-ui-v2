import { useQuery } from '@tanstack/react-query'
import apiClient from '../lib/api-client'

export function useFeedPosts(postType: 'NORMAL' | 'QUESTION') {
  return useQuery({
    queryKey: ['feed', postType],
    queryFn: async () => {
      const [forYouRes, followingRes] = await Promise.all([
        apiClient.getForYouFeed(),
        apiClient.getFollowingFeed(),
      ])

      const combined = [
        ...(forYouRes.data || []),
        ...(followingRes.data || []),
      ]

      // remove duplicates
      const unique = Array.from(
        new Map(combined.map((p: any) => [p.id, p])).values()
      )

      const normalized = unique.map((post: any) => {
        const firstImage = post.media?.find((m: any) => m.type === 'image')
        const firstVideo = post.media?.find((m: any) => m.type === 'video')

        return {
          id: post.id,
          authorId: post.user?.id || '',
          content: post.content,
          timestamp: new Date(Number(post.created_on)).toLocaleString(),

          image: firstImage?.url || null,
          video: firstVideo?.url || null,

          tags: (post.tags || []).map((t: any) => t.name),

          author: {
            name: post.user?.full_name || post.user?.username || 'Unknown',
            avatar:
              post.user?.profile_photo ||
              `https://ui-avatars.com/api/name=${encodeURIComponent(post.user?.full_name || post.user?.username)}`,
            title: post.user?.profession || '',
          },

          likes: post.upvotes || 0,
          liked: Boolean(post.liked ?? post.is_liked ?? (post.userVote === 'up') ?? false),
          dislikes: post.downvotes || 0,

          views: post.views || post.view_count || 0,
          comments: post.commentsCount || 0,

          personalized_rank: post.personalized_rank,
          type: (post.post_type || post.type)?.toUpperCase(),
          created_on: post.created_on,
        }
      })

      const filtered = normalized.filter(
        (p: any) => p.type === postType
      )

      return filtered.sort((a: any, b: any) => {
        if (a.personalized_rank && b.personalized_rank) {
          return b.personalized_rank - a.personalized_rank
        }
        return Number(b.created_on) - Number(a.created_on)
      })
    },
  })
}