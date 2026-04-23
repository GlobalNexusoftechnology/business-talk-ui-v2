import { useQuery } from '@tanstack/react-query'
import apiClient from '../lib/api-client'

export function usePosts() {
  return useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const res = await apiClient.getForYouFeed()
      return res.data
    },
  })
}