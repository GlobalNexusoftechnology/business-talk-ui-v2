import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient, { extractPaginatedData } from '@/lib/api-client'
import adminApi from '@/lib/admin-api'

export function useAdminPosts(filter: string, page?: number, limit?: number) {
  return useQuery({
    queryKey: ['admin-posts', filter, page, limit],
    queryFn: async () => {
      let posts: any[] = []

      if (filter === 'Trending') {
        const res = await apiClient.getTrendingPosts()
        posts = res.data || []
      } else {
        const res = await apiClient.getAllPosts(page, limit)

        const {
          data: postsData
        } = extractPaginatedData(res)

        posts = postsData || []
      }

      // Posts page should show only NORMAL content, not QUESTION content.
      const normalPosts = posts.filter(
        (p: any) => (p.post_type || p.type || '').toUpperCase() === 'NORMAL',
      )

      if (filter === 'Latest') {
        return normalPosts.sort((a, b) => Number(b.created_on) - Number(a.created_on))
      }

      if (filter === 'Reported') {
        return normalPosts.filter((p: any) => p.report_count > 0)
      }

      return normalPosts
    },
  })
}

export function useDeletePost() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminApi.deletePost(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-posts'] }),
  })
}

export function useWarnUser() {
  return useMutation({
    mutationFn: (id: string) => adminApi.warnUser(id),
  })
}

export function useBanUser() {
  return useMutation({
    mutationFn: (id: string) => adminApi.banUser(id),
  })
}