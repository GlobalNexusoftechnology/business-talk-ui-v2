'use client'

import { Provider } from 'react-redux'
import { store } from '@/redux/store'
import { ContentViewerProvider } from '@/providers/ContentViewerProvider'
import { WebSocketProvider } from '@/providers/WebSocketProvider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fetchCurrentUser } from '@/redux/slices/authSlice'
import { useEffect, useState } from 'react'


export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  useEffect(() => {
    store.dispatch(fetchCurrentUser())
  }, [])
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
