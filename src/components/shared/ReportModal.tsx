'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import apiClient from '@/lib/api-client'

interface Props {
  isOpen: boolean
  onClose: () => void
  contentId: string
  contentType: 'post' | 'blog' | 'question' | 'story'
}

export function ReportModal({ isOpen, onClose, contentId, contentType }: Props) {
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async () => {
    if (!reason.trim()) return

    try {
      setLoading(true)

      await apiClient.post('/reports', {
        content_type: contentType,
        content_id: contentId,
        reason,
      })

      setReason('')
      onClose()
    } catch (err) {
      console.error('Report failed', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-md rounded-lg p-5 relative">

        <button
          onClick={onClose}
          className="absolute right-3 top-3"
        >
          <X />
        </button>

        <h2 className="text-lg font-semibold mb-3">Report Content</h2>

        <textarea
          className="w-full border rounded p-2 mb-4"
          placeholder="Enter reason..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />

        <div className="flex justify-end gap-2">
          <button onClick={onClose}>Cancel</button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-red-600 text-white px-4 py-1 rounded"
          >
            {loading ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  )
}