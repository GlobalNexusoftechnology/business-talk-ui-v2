'use client'

/**
 * OPTIONAL: Global Content Viewer Provider
 * 
 * This provider wraps your entire app to make the content viewer
 * available globally, similar to Instagram/LinkedIn behavior.
 * 
 * Usage in app/layout.tsx:
 * 
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <ContentViewerProvider>
 *           {children}
 *         </ContentViewerProvider>
 *       </body>
 *     </html>
 *   )
 * }
 */

import { ReactNode, createContext, useContext, useState, useCallback } from 'react'
import { UniversalContentViewer } from '@/components/shared/UniversalContentViewer'

export type ContentType = 'posts' | 'blogs' | 'questions' | 'stories'

export interface ContentData {
  id: string
  [key: string]: any
}

interface ContentViewerContextType {
  isOpen: boolean
  currentType: ContentType | null
  currentData: ContentData | null
  open: (type: ContentType, data: ContentData) => void
  close: () => void
}

const ContentViewerContext = createContext<ContentViewerContextType | undefined>(undefined)

export function ContentViewerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState({
    isOpen: false,
    currentType: null as ContentType | null,
    currentData: null as ContentData | null,
  })

  const open = useCallback((type: ContentType, data: ContentData) => {
    setState({
      isOpen: true,
      currentType: type,
      currentData: data,
    })
  }, [])

  const close = useCallback(() => {
    setState({
      isOpen: false,
      currentType: null,
      currentData: null,
    })
  }, [])

  const value: ContentViewerContextType = {
    isOpen: state.isOpen,
    currentType: state.currentType,
    currentData: state.currentData,
    open,
    close,
  }

  return (
    <ContentViewerContext.Provider value={value}>
      {children}
      {/* Global Content Viewer Modal */}
      <UniversalContentViewer
        isOpen={state.isOpen}
        type={state.currentType}
        data={state.currentData}
        onClose={close}
      />
    </ContentViewerContext.Provider>
  )
}

export function useContentViewerContext(): ContentViewerContextType {
  const context = useContext(ContentViewerContext)
  if (!context) {
    throw new Error('useContentViewerContext must be used within ContentViewerProvider')
  }
  return context
}
