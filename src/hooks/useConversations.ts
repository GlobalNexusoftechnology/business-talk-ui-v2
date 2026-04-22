import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../lib/api-client';

export function useConversations() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: async () => apiFetch('/chat/my/conversations'),
  });
}
