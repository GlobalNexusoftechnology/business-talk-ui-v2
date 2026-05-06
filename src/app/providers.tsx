'use client'

import { Provider } from 'react-redux'
import { store } from '@/redux/store'
import { ContentViewerProvider } from '@/providers/ContentViewerProvider'
import { WebSocketProvider } from '@/providers/WebSocketProvider'
import { PushNotificationProvider } from '@/providers/PushNotificationProvider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fetchCurrentUser } from '@/redux/slices/authSlice'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import apiClient from '@/lib/api-client'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  const [sessionChecked, setSessionChecked] = useState(false)
  const [forbiddenToast, setForbiddenToast] = useState(false)
  const [restrictedToast, setRestrictedToast] = useState(false)
  const router = useRouter()

  // Listen for regular 403 "Action not allowed" events
  useEffect(() => {
    const handler = () => {
      setForbiddenToast(true)
      setTimeout(() => setForbiddenToast(false), 3000)
    }
    window.addEventListener('action-forbidden', handler)
    return () => window.removeEventListener('action-forbidden', handler)
  }, [])

  // Listen for account-restriction events (dispatched by the API interceptor)
  useEffect(() => {
    const handler = () => {
      setRestrictedToast(true)
      setTimeout(() => setRestrictedToast(false), 4000)
    }
    window.addEventListener('account-restricted', handler)
    return () => window.removeEventListener('account-restricted', handler)
  }, [])

  // On mount: refresh the access-token then sync user state
  useEffect(() => {
    ;(async () => {
      try {
        await apiClient.refreshToken()
      } catch {
        // Refresh failed - no valid session
        if (typeof window !== 'undefined') {
          localStorage.removeItem('user')
        }
        setSessionChecked(true)
        return
      }

      try {
        // fetchCurrentUser returns { user, isRestricted }
        const result = await (store.dispatch(fetchCurrentUser()) as any).unwrap()
        if (result?.isRestricted) {
          // Restricted users see the restricted page but keep their user data
          router.replace('/account-restricted')
        }
      } catch {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('user')
        }
      } finally {
        setSessionChecked(true)
      }
    })()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!sessionChecked) {
    return (
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        </QueryClientProvider>
      </Provider>
    )
  }

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <WebSocketProvider>
          <PushNotificationProvider>
            <ContentViewerProvider>
              {children}
            </ContentViewerProvider>
          </PushNotificationProvider>
        </WebSocketProvider>

        {/* Toast: regular 403 permission errors */}
        {forbiddenToast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-5 py-3 rounded-full shadow-xl">
            Action not allowed
          </div>
        )}

        {/* Toast: account restricted */}
        {restrictedToast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-red-600 text-white text-sm font-medium px-5 py-3 rounded-full shadow-xl">
            Your account is restricted. Please contact support.
          </div>
        )}
      </QueryClientProvider>
    </Provider>
  )
}
