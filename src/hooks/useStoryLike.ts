import { useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/api-client'

export const useStoryLike = (storyId: string) => {
  const queryClient = useQueryClient()

  const likeMutation = useMutation({
    mutationFn: async () => {
      return await apiClient.likeBlog(storyId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['feed'],
      })
    },
  })

  return {
    likeStory: likeMutation.mutate,
  }
}