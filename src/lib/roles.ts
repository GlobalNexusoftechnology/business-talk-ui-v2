export const ROLES = {
  ADMIN: 'bc6cd1f9-44b6-4688-b78c-94abbe97ae4a', // bc6cd1f9-44b6-4688-b78c-94abbe97ae4a
  SUPER_ADMIN: '63765d88-d6de-4fd3-8528-a9de0107ba4d', // 🔥 replace with real one
}

export const isAdmin = (roleId?: string) => {
  return roleId === ROLES.ADMIN || roleId === ROLES.SUPER_ADMIN
}