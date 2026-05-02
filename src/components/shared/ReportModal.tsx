'use client'

import { useState } from 'react'
import { X, CheckCircle2 } from 'lucide-react'
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
  const [submitted, setSubmitted] = useState(false)

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
      setSubmitted(true)
      setTimeout(() => {
        setSubmitted(false)
        onClose()
      }, 2000)
    } catch (err) {
      console.error('Report failed', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={submitted ? undefined : onClose}
    >
      <div
        className="bg-white w-full max-w-md rounded-lg p-5 relative overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {submitted ? (
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#FEF2F2', animation: 'scaleIn 0.3s ease-out' }}
            >
              <CheckCircle2 className="w-9 h-9" style={{ color: '#DC2626' }} />
            </div>
            <p className="text-base font-semibold" style={{ color: '#212529' }}>Report Submitted</p>
            <p className="text-sm text-center" style={{ color: '#5F6368' }}>
              Thanks for letting us know. We&apos;ll review it shortly.
            </p>
          </div>
        ) : (
          <>
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
          </>
        )}

        <style>{`
          @keyframes scaleIn {
            from { transform: scale(0.5); opacity: 0; }
            to   { transform: scale(1);   opacity: 1; }
          }
        `}</style>
      </div>
    </div>
  )
}