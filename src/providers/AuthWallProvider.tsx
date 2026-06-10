'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import LoginRequiredModal from '@/components/auth/LoginRequiredModal'

interface AuthWallContextType {
  showLoginModal: () => void
  hideLoginModal: () => void
  requireAuth: () => boolean
}

const AuthWallContext =
  createContext<AuthWallContextType | null>(null)

export function AuthWallProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  const showLoginModal = useCallback(() => {
    setOpen(true)
  }, [])

  const hideLoginModal = useCallback(() => {
    setOpen(false)
  }, [])

  const requireAuth = useCallback(() => {
    if (typeof window === 'undefined') return false

    const user =
      localStorage.getItem('user')

    if (!user) {
      setOpen(true)
      return false
    }

    return true
  }, [])

  const value = useMemo(
    () => ({
      showLoginModal,
      hideLoginModal,
      requireAuth,
    }),
    [
      showLoginModal,
      hideLoginModal,
      requireAuth,
    ]
  )

  useEffect(() => {
    const handler = () => {
        setOpen(true)
    }

    window.addEventListener(
        'show-login-modal',
        handler
    )

    return () =>
        window.removeEventListener(
        'show-login-modal',
        handler
        )
    }, [])

    useEffect(() => {
    const closeHandler = () => {
        setOpen(false)
    }

    window.addEventListener(
        'hide-login-modal',
        closeHandler
    )

    return () =>
        window.removeEventListener(
            'hide-login-modal',
            closeHandler
        )
    }, [])

  return (
    <AuthWallContext.Provider value={value}>
      {children}

      <LoginRequiredModal
        open={open}
        onClose={hideLoginModal}
      />
    </AuthWallContext.Provider>
  )
}

export function useAuthWall() {
  const ctx =
    useContext(AuthWallContext)

  if (!ctx) {
    throw new Error(
      'useAuthWall must be used inside AuthWallProvider'
    )
  }

  return ctx
}