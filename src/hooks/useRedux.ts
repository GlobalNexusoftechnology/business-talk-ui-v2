import { useEffect } from 'react'
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux'
import type { RootState, AppDispatch } from '@/redux/store'

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

export const useAuth = () => {
  const auth = useAppSelector((state) => state.auth)
  const dispatch = useAppDispatch()

  return {
    ...auth,
    dispatch,
  }
}


export const useNotifications = () => {
  const notifications = useAppSelector((state) => state.notifications)
  const dispatch = useAppDispatch()

  return {
    ...notifications,
    dispatch,
  }
}

export const useAccountStatus = () => {
  const user = useAppSelector((state) => state.auth.user) as any
  // isRestricted is the canonical Redux flag — set on login/session restore
  const isRestricted = useAppSelector((state) => (state.auth as any).isRestricted) as boolean
  // isBanned unifies Redux flag with user field (defence-in-depth)
  const isBanned = isRestricted || Boolean(user?.is_banned || user?.isBanned)
  const isShadowBanned = Boolean(user?.is_shadow_banned || user?.isShadowBanned)

  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && isShadowBanned) {
      console.log('[DEBUG] User is shadow banned')
    }
  }, [isShadowBanned])

  return { isBanned, isShadowBanned, isRestricted }
}

export const useMessages = () => {
  const messages = useAppSelector((state) => state.messages)
  const dispatch = useAppDispatch()

  return {
    ...messages,
    dispatch,
  }
}
