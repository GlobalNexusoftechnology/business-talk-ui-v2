import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/api-client'

// GET ALL GROUPS
export const useGroups = () => {
  return useQuery({
    queryKey: ['groups'],
    queryFn: async () => {
      const res = await apiClient.getGroups()
      return res.data
    },
  })
}

// GET GROUP BY ID
export const useGroupById = (groupId: string) => {
  return useQuery({
    queryKey: ['group', groupId],
    queryFn: async () => {
      const res = await apiClient.getGroupById(groupId)
      return res.data
    },
    enabled: !!groupId,
  })
}

// GET GROUP CHAT
export const useGroupChat = (groupId: string) => {
  return useQuery({
    queryKey: ['group-chat', groupId],
    queryFn: async () => {
      const res = await apiClient.getGroupChat(groupId)
      return res.data
    },
    enabled: !!groupId,
  })
}

// GET GROUP FEED (paginated)
export const useGroupFeed = (groupId: string, page = 1, limit = 20) => {
  return useQuery({
    queryKey: ['group-feed', groupId, page],
    queryFn: async () => {
      const res = await apiClient.getGroupFeed(groupId, page, limit)
      return res.data
    },
    enabled: !!groupId,
  })
}

// GET PENDING JOIN REQUESTS (admin only)
export const useGroupJoinRequests = (groupId: string) => {
  return useQuery({
    queryKey: ['group-join-requests', groupId],
    queryFn: async () => {
      const res = await apiClient.getGroupJoinRequests(groupId)
      return res.data
    },
    enabled: !!groupId,
  })
}

// CREATE GROUP
export const useCreateGroup = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: FormData) => {
      return await apiClient.createGroup(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] })
    },
  })
}

// JOIN GROUP (public)
export const useJoinGroup = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (groupId: string) => {
      return await apiClient.joinGroup(groupId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] })
    },
  })
}

// LEAVE GROUP
export const useLeaveGroup = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (groupId: string) => {
      return await apiClient.leaveGroup(groupId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] })
    },
  })
}

// REQUEST TO JOIN (private group)
export const useRequestToJoinGroup = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (groupId: string) => {
      return await apiClient.requestToJoinGroup(groupId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] })
    },
  })
}

// APPROVE JOIN REQUEST (admin)
export const useApproveJoinRequest = (groupId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (requestId: string) => {
      return await apiClient.approveGroupJoinRequest(requestId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-join-requests', groupId] })
      queryClient.invalidateQueries({ queryKey: ['group', groupId] })
    },
  })
}

// REJECT JOIN REQUEST (admin)
export const useRejectJoinRequest = (groupId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (requestId: string) => {
      return await apiClient.rejectGroupJoinRequest(requestId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-join-requests', groupId] })
    },
  })
}

// CREATE POST IN GROUP
export const useCreateGroupPost = (groupId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: { type: string; content?: string; tags?: string | string[] }) => {
      return await apiClient.createGroupPost(groupId, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group-feed', groupId] })
    },
  })
}

// REMOVE GROUP MEMBER (admin)
export const useRemoveGroupMember = (groupId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (userId: string) => {
      return await apiClient.removeGroupMember(groupId, userId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group', groupId] })
    },
  })
}

// TOGGLE MEMBER ROLE ADMIN <-> MEMBER (admin)
export const useToggleGroupMemberRole = (groupId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (userId: string) => {
      return await apiClient.toggleGroupMemberRole(groupId, userId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group', groupId] })
    },
  })
}

// UPDATE GROUP RULES (admin)
export const useUpdateGroupRules = (groupId: string) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (rules: string[]) => {
      return await apiClient.updateGroupRules(groupId, rules)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['group', groupId] })
    },
  })
}

// GENERATE INVITE LINK (admin)
export const useGenerateGroupInvite = (groupId: string) => {
  return useMutation({
    mutationFn: async (data?: { expiresIn?: number; maxUses?: number }) => {
      return await apiClient.generateGroupInvite(groupId, data)
    },
  })
}

// JOIN BY INVITE CODE
export const useJoinGroupByInviteCode = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (code: string) => {
      return await apiClient.joinGroupByInviteCode(code)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] })
    },
  })
}