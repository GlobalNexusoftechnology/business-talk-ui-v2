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

export const useMessages = () => {
  const messages = useAppSelector((state) => state.messages)
  const dispatch = useAppDispatch()

  return {
    ...messages,
    dispatch,
  }
}
