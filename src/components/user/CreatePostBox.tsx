'use client'

import { ImageIcon, Video, X } from 'lucide-react'
import { useState } from 'react'
import apiClient from '@/lib/api-client'
import { useAccountStatus } from '@/hooks/useRedux'
import { validateMediaFile } from '@/lib/utils'

export function CreatePostBox() {
  const { isBanned } = useAccountStatus()
  const [postContent, setPostContent] = useState('')
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [savingDraft, setSavingDraft] = useState(false)
  const [draftToast, setDraftToast] = useState<string | null>(null)

  const showDraftToast = (msg: string) => {
    setDraftToast(msg)
    setTimeout(() => setDraftToast(null), 3000)
  }

  const handleSaveDraft = async () => {
    if (!postContent.trim()) return
    try {
      setSavingDraft(true)
      await apiClient.saveDraft({
        type: 'post',
        autoSaved: false,
        content: { content: postContent, tags: [] },
      })
      setPostContent('')
      setSelectedFiles([])
      showDraftToast('Post saved to drafts!')
    } catch (err) {
      console.error('Save draft failed:', err)
      showDraftToast('Failed to save draft.')
    } finally {
      setSavingDraft(false)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const incoming = Array.from(event.target.files)
      const errors = incoming.map(validateMediaFile).filter(Boolean) as string[]
      if (errors.length) { alert(errors.join('\n')); return }
      setSelectedFiles((prev) => [...prev, ...incoming])
    }
  }

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleCreatePost = async () => {
    if (!postContent.trim()) return

    try {
      setLoading(true)

      const formData = new FormData()
      formData.append('type', 'NORMAL')
      formData.append('content', postContent)

      selectedFiles.forEach((file) => {
        formData.append('media', file)
      })

      await apiClient.createPostWithMedia(formData)

      setPostContent('')
      setSelectedFiles([])

      window.location.reload()
    } catch (err) {
      console.error('Create post failed:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
    <div className="bg-white rounded-2xl shadow-sm p-3 sm:p-6 mb-6 border">
      {isBanned && (
        <p className="text-xs text-red-500 mb-3 text-center bg-red-50 p-2 rounded-lg">
          Your account is restricted. You cannot create posts.
        </p>
      )}
      <textarea
        value={postContent}
        onChange={(e) => setPostContent(e.target.value)}
        placeholder={isBanned ? 'Your account is restricted' : 'Ask, Share, Contribute…'}
        disabled={isBanned}
        className="w-full min-h-[120px] p-4 rounded-xl resize-none bg-gray-50 border disabled:cursor-not-allowed disabled:opacity-60"
      />

      {selectedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {selectedFiles.map((file, index) => (
            <div key={index} className="relative">
              {file.type.startsWith('image/') ? (
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="w-20 h-20 object-cover rounded-xl border border-gray-200"
                />
              ) : (
                <div className="w-20 h-20 flex flex-col items-center justify-center bg-gray-100 rounded-xl border border-gray-200 text-xs text-gray-500 p-1 gap-1">
                  <Video className="w-5 h-5 flex-shrink-0" />
                  <span className="truncate w-full text-center">{file.name}</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="absolute -top-1.5 -right-1.5 bg-gray-900 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-500 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap justify-between gap-2 mt-4">
        <input
          type="file"
          id="media-upload"
          accept="image/*,video/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        <label htmlFor="media-upload" className="cursor-pointer flex gap-2">
          <ImageIcon /> <Video />
        </label>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveDraft}
            disabled={savingDraft || loading || !postContent.trim() || isBanned}
            className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {savingDraft ? 'Saving...' : 'Save Draft'}
          </button>
          <button
            onClick={handleCreatePost}
            disabled={loading || !postContent.trim() || isBanned}
            className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-400 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Posting...' : 'Create Post'}
          </button>
        </div>
      </div>
    </div>

    {draftToast && (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-sm font-medium px-5 py-3 rounded-full shadow-xl">
        {draftToast}
      </div>
    )}
  </>
  )
}