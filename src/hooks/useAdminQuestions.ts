import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/api-client'
import adminApi from '@/lib/admin-api'

export function useAdminQuestions(filter: string) {
  return useQuery({
    queryKey: ['admin-questions', filter],
    queryFn: async () => {
      const res = await apiClient.getForYouFeed()

      let questions = (res.data || []).filter(
        (p: any) => (p.post_type || p.type)?.toUpperCase() === 'QUESTION'
      )

      if (filter === 'Latest') {
        return questions.sort((a: any, b: any) => Number(b.created_on) - Number(a.created_on))
      }

      if (filter === 'Reported') {
        return questions.filter((q: any) => q.report_count > 0)
      }

      return questions
    },
  })
}

export const useDeleteQuestion = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => adminApi.deletePost(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-questions'] }),
  })
}