import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/api-client'

export function useAdminPosts(filter: string) {
  return useQuery({
    queryKey: ['admin-posts', filter],
    queryFn: async () => {
      // Replace with real API and filter logic
      const res = await apiClient.getForYouFeed()
      // Filter on backend if possible, else filter here
      if (filter === 'All') return res.data
      if (filter === 'Trending') return (res.data || []).filter((p: any) => p.type === 'trending')
      if (filter === 'Reported') return (res.data || []).filter((p: any) => p.type === 'reported')
      if (filter === 'Latest') return (res.data || []).sort((a: any, b: any) => Number(b.created_on) - Number(a.created_on))
      return res.data
    },
  })
}

export function useDeletePost() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (postId: string) => {
      return apiClient.client.delete(`/posts/${postId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-posts'] })
    },
  })
}
