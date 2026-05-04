import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/api-client'

export function useAdminBlogs(filter: string) {
  return useQuery({
    queryKey: ['admin-blogs', filter],
    queryFn: async () => {
      const res = await apiClient.getBlogs()
      let blogs = res.data || []

      if (filter === 'Latest') {
        return blogs.sort((a: any, b: any) => Number(b.created_on) - Number(a.created_on))
      }

      if (filter === 'Trending') {
        const trendingRes = await apiClient.getTrendingBlogs()
        const trendingBlogs = trendingRes.data || []
        const trendingIds = new Set(trendingBlogs.map((b: any) => b.id))
        return blogs.filter((b: any) => trendingIds.has(b.id))
      }

      if (filter === 'Reported') {
        return blogs.filter((b: any) => b.report_count > 0)
      }

      return blogs
    },
  })
}

export function useDeleteBlog() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiClient.deleteBlog(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-blogs'] }),
  })
}

export function useUpdateBlog() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: FormData | Record<string, unknown>
    }) => apiClient.updateBlog(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-blogs'] }),
  })
}