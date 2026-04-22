'use client'

import { Provider } from 'react-redux'
import { store } from '@/redux/store'
import { ContentViewerProvider } from '@/providers/ContentViewerProvider'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient();
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ContentViewerProvider>
          {children}
        </ContentViewerProvider>
      </QueryClientProvider>
    </Provider>
  );
}
