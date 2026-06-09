import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient, { extractPaginatedData } from '@/lib/api-client'

export function useAdminStories(filter: string, page = 1, limit = 50) {
  return useQuery({
    queryKey: ['admin-stories', filter, page, limit],
    queryFn: async () => {
      const res = await apiClient.getStories(page, limit)
      const {
        data: storiesData
      } = extractPaginatedData(res)

      let stories = storiesData || []

      if (filter === 'Latest') {
        return stories.sort((a: { created_on: string }, b: { created_on: string }) => Number(b.created_on) - Number(a.created_on))
      }

      if (filter === 'Trending') {
        const trendingRes = await apiClient.getTrendingStories()
        const trendingStories = trendingRes.data || []
        const trendingIds = new Set(trendingStories.map((s: any) => s.id))
        return stories.filter((s: any) => trendingIds.has(s.id))
      }

      if (filter === 'Reported') {
        return stories.filter((s: any) => s.report_count > 0)
      }

      return stories
    },
  })
}

export function useDeleteStory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiClient.deleteBlog(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-stories'] }),
  })
}