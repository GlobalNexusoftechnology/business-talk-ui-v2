export const ROLES = {
  ADMIN: '261af5ac-b7e1-40a9-b36a-efb23b837871', // bc6cd1f9-44b6-4688-b78c-94abbe97ae4a
  SUPER_ADMIN: '133af800-4c6f-4006-9f0c-6ccb8ad35376', // 🔥 replace with real one
}

export const isAdmin = (roleId?: string) => {
  return roleId === ROLES.ADMIN || roleId === ROLES.SUPER_ADMIN
}