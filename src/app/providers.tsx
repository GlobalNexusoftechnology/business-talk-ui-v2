'use client'

import { Provider } from 'react-redux'
import { store } from '@/redux/store'
import { ContentViewerProvider } from '@/providers/ContentViewerProvider'
import { WebSocketProvider } from '@/providers/WebSocketProvider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fetchCurrentUser } from '@/redux/slices/authSlice'
import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'


export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())
  const router = useRouter()
  const pathname = usePathname()

  const isRestrictedUser = (user: any) =>
    Boolean(user?.is_banned || user?.isBanned || user?.is_shadow_banned || user?.isShadowBanned)

  useEffect(() => {
    ;(async () => {
      try {
        const user = await (store.dispatch(fetchCurrentUser()) as any).unwrap()
        if (isRestrictedUser(user)) {
          localStorage.removeItem('user')
          if (pathname !== '/account-restricted') {
            router.replace('/account-restricted')
          }
        }
      } catch {
        // no-op
      }
    })()
  }, [pathname, router])

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <WebSocketProvider>
          <ContentViewerProvider>
            {children}
          </ContentViewerProvider>
        </WebSocketProvider>
      </QueryClientProvider>
    </Provider>
  );
}
