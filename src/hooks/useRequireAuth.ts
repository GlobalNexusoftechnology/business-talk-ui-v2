'use client'

import { useAuthWall } from '@/providers/AuthWallProvider'

export function useRequireAuth() {
  const { requireAuth } =
    useAuthWall()

  return requireAuth
}