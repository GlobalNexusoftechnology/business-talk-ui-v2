'use client'

import { useCallback } from 'react'
import { useContentViewerContext } from '@/providers/ContentViewerProvider'

export interface UseOpenContentReturn {
  openPost: (data: any) => void
  openBlog: (data: any) => void
  openQuestion: (data: any) => void
  openStory: (data: any) => void
}

export function useOpenContent(): UseOpenContentReturn {
  const { open } = useContentViewerContext()

  const openPost = useCallback((data: any) => {
    open('post', data)
  }, [open])

  const openBlog = useCallback((data: any) => {
    open('blog', data)
  }, [open])

  const openQuestion = useCallback((data: any) => {
    open('question', data)
  }, [open])

  const openStory = useCallback((data: any) => {
    open('story', data)
  }, [open])

  return {
    openPost,
    openBlog,
    openQuestion,
    openStory
  }
}
