import { useQuery } from '@tanstack/react-query'
import apiClient from '../lib/api-client'

export function useConversations() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const res = await apiClient.getConversations()
      return res.data
    },
  })
}