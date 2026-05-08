export const ROLES = {
  ADMIN: '3f926e0c-7cf1-4dfa-bd80-a26582dcf8be',
  SUPER_ADMIN: '63765d88-d6de-4fd3-8528-a9de0107ba4d',
  ADMIN_LIVE: '261af5ac-b7e1-40a9-b36a-efb23b837871',
  SUPER_ADMIN_LIVE: '133af800-4c6f-4006-9f0c-6ccb8ad35376',
}

export const isAdmin = (roleId?: string) => {
  return (
    roleId === ROLES.ADMIN ||
    roleId === ROLES.SUPER_ADMIN ||
    roleId === ROLES.ADMIN_LIVE ||
    roleId === ROLES.SUPER_ADMIN_LIVE
  )
}