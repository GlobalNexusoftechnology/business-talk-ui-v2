'use client'

import { useState, useCallback } from 'react'

export type ContentType = 'posts' | 'blogs' | 'questions' | 'stories'

export interface ContentData {
  id: string
  [key: string]: any
}

export interface ContentViewerState {
  isOpen: boolean
  type: ContentType | null
  data: ContentData | null
}

export interface UseContentViewerReturn {
  isOpen: boolean
  currentType: ContentType | null
  currentData: ContentData | null
  open: (type: ContentType, data: ContentData) => void
  close: () => void
  setContent: (type: ContentType, data: ContentData) => void
}

export function useContentViewer(): UseContentViewerReturn {
  const [state, setState] = useState<ContentViewerState>({
    isOpen: false,
    type: null,
    data: null
  })

  const open = useCallback((type: ContentType, data: ContentData) => {
    setState({
      isOpen: true,
      type,
      data
    })
  }, [])

  const close = useCallback(() => {
    setState({
      isOpen: false,
      type: null,
      data: null
    })
  }, [])

  const setContent = useCallback((type: ContentType, data: ContentData) => {
    setState({
      isOpen: true,
      type,
      data
    })
  }, [])

  return {
    isOpen: state.isOpen,
    currentType: state.type,
    currentData: state.data,
    open,
    close,
    setContent
  }
}
