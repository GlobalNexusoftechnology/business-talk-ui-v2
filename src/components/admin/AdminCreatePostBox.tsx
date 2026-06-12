'use client'

import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { ImageIcon, Video, X } from 'lucide-react'
import apiClient from '@/lib/api-client'
import { validateMediaFile, validateFileBeforeUpload } from '@/lib/utils'
// import BasicEditor from '../editor/BasicEditor'

export function AdminCreatePostBox({ onCreated }: { onCreated?: () => void }) {
  const [content, setContent] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const queryClient = useQueryClient()

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const incoming = Array.from(e.target.files)
      const errors = incoming.map(validateMediaFile).filter(Boolean) as string[]
      if (errors.length) { alert(errors.join('\n')); return }
      setFiles((prev) => [...prev, ...incoming])
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleCreate = async () => {
    if (!content.trim()) return

    try {
      setLoading(true)

      // Validate files before uploading
      if (files.length > 0) {
        const validations = await Promise.all(files.map((f) => validateFileBeforeUpload(f)))
        const errors = validations.filter(Boolean) as string[]
        if (errors.length) { alert(errors.join('\n')); setLoading(false); return }
      }

      const formData = new FormData()
      formData.append('type', 'NORMAL')
      formData.append('content', content)

      files.forEach((file) => formData.append('media', file))

      await apiClient.createPostWithMedia(formData)

      setContent('')
      setFiles([])
      await queryClient.invalidateQueries({ queryKey: ['admin-posts'] })
      await queryClient.invalidateQueries({ queryKey: ['feed'] })
      await queryClient.invalidateQueries({ queryKey: ['posts'] })
      onCreated?.()
    } catch (err) {
      console.error(err)
      const status = (err as any)?.response?.status
      if (status === 413) {
        alert('Upload failed: File is too large. Please upload a smaller file.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl p-6 border mb-6">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Create an admin post..."
        className="w-full p-4 rounded-xl bg-gray-50 border hover:border-gray-400 focus-within:border-gray-400 transition-colors selected:border-gray-700"
      />
      {/* 
      <BasicEditor
        value={content}
        onChange={setContent}
        placeholder="Create an admin post..."
        className="w-full p-4 rounded-xl bg-gray-50 border hover:border-gray-400 focus-within:border-gray-400 transition-colors selected:border-gray-700"
      />
      */}

      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {files.map((file, index) => (
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
        <input type="file" multiple hidden id="post-media" onChange={handleFileSelect} />
        <label htmlFor="post-media" className="flex gap-2 cursor-pointer">
          <ImageIcon /> <Video />
        </label>

        <button
          type="button"
          onClick={handleCreate}
          disabled={loading || !content.trim()}
          className="bg-black text-white px-6 py-2 rounded-lg"
        >
          {loading ? 'Posting...' : 'Create Post'}
        </button>
      </div>
    </div>
  )
}