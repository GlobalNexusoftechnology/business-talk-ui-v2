import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/api-client'
import adminApi from '@/lib/admin-api'

export function useAdminStories(filter: string) {
  return useQuery({
    queryKey: ['admin-stories', filter],
    queryFn: async () => {
      const res = await apiClient.getStories()
      let stories = (res.data || [])
      if (filter === 'All') return stories
      if (filter === 'Trending') return stories.filter((s: any) => s.type === 'trending')
      if (filter === 'Reported') return stories.filter((s: any) => s.type === 'reported')
      if (filter === 'Latest') return stories.sort((a: any, b: any) => Number(b.created_on) - Number(a.created_on))
      return stories
    },
  })
}

export function useDeleteStory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (storyId: string) => {
      return adminApi.deleteBlog(storyId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-stories'] })
    },
  })
}
