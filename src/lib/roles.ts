export const ROLES = {
  ADMIN: '63765d88-d6de-4fd3-8528-a9de0107ba4d',
  SUPER_ADMIN: 'SUPER_ADMIN_ID_HERE', // 🔥 replace with real one
}

export const isAdmin = (roleId?: string) => {
  return roleId === ROLES.ADMIN || roleId === ROLES.SUPER_ADMIN
}