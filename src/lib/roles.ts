import apiClient from './api-client'

export const ROLES = {
  // Deprecated: Use dynamic role lookup below
  ADMIN: '3f926e0c-7cf1-4dfa-bd80-a26582dcf8be',
  SUPER_ADMIN: '63765d88-d6de-4fd3-8528-a9de0107ba4d',
  ADMIN_LIVE: '261af5ac-b7e1-40a9-b36a-efb23b837871',
  SUPER_ADMIN_LIVE: '133af800-4c6f-4006-9f0c-6ccb8ad35376',
  ADMIN_ENV: process.env.NEXT_PUBLIC_ROLE_ADMIN || '',
  SUPER_ADMIN_ENV: process.env.NEXT_PUBLIC_ROLE_SUPER_ADMIN || '',
  ADMIN_LIVE_ENV: process.env.NEXT_PUBLIC_ROLE_ADMIN_LIVE || '',
  SUPER_ADMIN_LIVE_ENV: process.env.NEXT_PUBLIC_ROLE_SUPER_ADMIN_LIVE || '',
}

/**
 * Checks if the given roleId belongs to an admin or super_admin role by fetching roles from the backend.
 * This is async and returns a Promise<boolean>.
 */
export const isAdmin = async (roleId?: string): Promise<boolean> => {
  if (!roleId) return false
  const roles = await apiClient.fetchRoles()
  // Acceptable admin role names (case-insensitive)
  const adminNames = ['admin', 'super_admin', 'admin_live', 'super_admin_live']
  const adminRoleIds = roles
    .filter((r: any) => typeof r.name === 'string' && adminNames.includes(r.name.toLowerCase()))
    .map((r: any) => r.id)
  return adminRoleIds.includes(roleId)
}