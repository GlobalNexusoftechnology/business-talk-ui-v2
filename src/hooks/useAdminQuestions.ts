import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/api-client'
import adminApi from '@/lib/admin-api'

export function useAdminQuestions(filter: string) {
  return useQuery({
    queryKey: ['admin-questions', filter],
    queryFn: async () => {
      // Replace with real API and filter logic
      const res = await apiClient.getForYouFeed()
      // Filter for questions
      let questions = (res.data || []).filter((p: any) => (p.post_type || p.type)?.toUpperCase() === 'QUESTION')
      if (filter === 'All') return questions
      if (filter === 'Trending') return questions.filter((q: any) => q.type === 'trending')
      if (filter === 'Reported') return questions.filter((q: any) => q.type === 'reported')
      if (filter === 'Latest') return questions.sort((a: any, b: any) => Number(b.created_on) - Number(a.created_on))
      return questions
    },
  })
}

export function useDeleteQuestion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (questionId: string) => {
      return adminApi.deletePost(questionId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-questions'] })
    },
  })
}
