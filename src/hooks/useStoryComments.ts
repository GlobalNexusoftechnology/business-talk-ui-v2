import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/api-client'

export const useStoryComments = (storyId: string) => {
  const queryClient = useQueryClient()

  // =========================
  // GET COMMENTS
  // =========================
  const { data } = useQuery({
    queryKey: ['story-comments', storyId],
    queryFn: async () => {
      return await apiClient.getBlogComments(storyId)
    },
    enabled: !!storyId,
  })

  // =========================
  // ADD COMMENT / REPLY
  // =========================
  const addCommentMutation = useMutation({
    mutationFn: async (payload: { content: string; parent_id?: string }) => {
      return await apiClient.addBlogComment(
        storyId,
        payload.content,
        payload.parent_id
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['story-comments', storyId],
      })
    },
  })

  // =========================
  // LIKE COMMENT
  // =========================
  const likeCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      return await apiClient.voteBlogComment(storyId, commentId, 'up')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['story-comments', storyId],
      })
    },
  })

  // =========================
  // DELETE COMMENT
  // =========================
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      return await apiClient.deleteBlogComment(commentId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['story-comments', storyId],
      })
    },
  })

  return {
    comments: data || [],
    addComment: addCommentMutation.mutate,
    likeComment: likeCommentMutation.mutate,
    deleteComment: deleteCommentMutation.mutate,
  }
}