import { useQuery } from '@tanstack/react-query';
import apiClient from '../lib/api-client';

export function useFeedPosts(postType: 'NORMAL' | 'QUESTION') {
  return useQuery({
    queryKey: ['feed', 'combined', postType],
    queryFn: async () => {
      // 🔥 Fetch BOTH feeds in parallel
      const [forYouRes, followingRes] = await Promise.all([
        apiClient.getFeedPosts('/posts/feed/for-you'),
        apiClient.getFeedPosts('/posts/feed/following'),
      ]);

      const forYou = forYouRes.data || [];
      const following = followingRes.data || [];

      // 🔥 Merge feeds
      const combined = [...forYou, ...following];

      // 🔥 Remove duplicates (same post id)
      const uniquePosts = Array.from(
        new Map(combined.map((post: any) => [post.id, post])).values()
      );

      // 🔥 Normalize data (VERY IMPORTANT)
      const normalized = uniquePosts.map((post: any) => {
        const firstImage = post.media?.find((m: any) => m.type === 'image');
        const firstVideo = post.media?.find((m: any) => m.type === 'video');

        // 🔥 TAG FIX
        const tags = (post.tags || [])
          .map((t: any) => t.name)
          .filter((name: string) => name && name !== '[]'); // remove garbage

        return {
          id: post.id,
          content: post.content,
          timestamp: new Date(Number(post.created_on)).toLocaleString(),

          image: firstImage?.url || null,
          video: firstVideo?.url || null,

          // 🔥 TAGS ADDED
          tags,

          author: {
            name: post.user?.full_name || post.user?.username || 'Unknown',
            avatar:
              post.user?.profile_photo ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                post.user?.username || 'User'
              )}`,
            title: post.user?.profession || '',
          },

          likes: post.upvotes || 0,
          dislikes: post.downvotes || 0,
          comments: 0,
          sends: 0,

          personalized_rank: post.personalized_rank,
          type: post.type,
        };
      });

      // 🔥 Filter by type
      const filtered = normalized.filter(
        (post: any) => post.type === postType
      );

      // 🔥 Sort (LinkedIn-like feed)
      filtered.sort((a: any, b: any) => {
        // Option 1: Personalized rank (best)
        if (a.personalized_rank && b.personalized_rank) {
          return b.personalized_rank - a.personalized_rank;
        }

        // Option 2: fallback to latest
        return Number(b.created_on) - Number(a.created_on);
      });

      return filtered;
    },

    placeholderData: (prev) => prev,
  });
}