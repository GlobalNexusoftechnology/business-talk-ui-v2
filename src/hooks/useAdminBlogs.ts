import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/api-client'

export function useAdminBlogs(filter: string) {
  return useQuery({
    queryKey: ['admin-blogs', filter],
    queryFn: async () => {
      const res = await apiClient.getBlogs()
      let blogs = (res.data || []).filter((b: any) => b.type === 'BLOG' || b.type === 'ADMIN_BLOG')
      if (filter === 'All') return blogs
      if (filter === 'Trending') return blogs.filter((b: any) => b.type === 'trending')
      if (filter === 'Reported') return blogs.filter((b: any) => b.type === 'reported')
      if (filter === 'Latest') return blogs.sort((a: any, b: any) => Number(b.created_on) - Number(a.created_on))
      return blogs
    },
  })
}

export function useDeleteBlog() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (blogId: string) => {
      return apiClient.deleteBlog(blogId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blogs'] })
    },
  })
}
