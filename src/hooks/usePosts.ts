import { useQuery } from '@tanstack/react-query';
import apiClient from '../lib/api-client';

// Fetches posts for the main feed (Home tab)
export function usePosts(page?: number, limit?: number) {
  return useQuery({
    queryKey: ['posts', page, limit],
    queryFn: async () => {
      const res = await apiClient.getPosts(page, limit);
      return res.data;
    },
    keepPreviousData: true,
  });
}
