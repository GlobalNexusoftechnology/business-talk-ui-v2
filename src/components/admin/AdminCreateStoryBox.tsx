import { useState } from 'react'
import { Card } from '@/components/shared/Card'
import { Button } from '@/components/shared/Button'

export function AdminCreateStoryBox({ onClose, onCreate, isLoading }: { onClose: () => void, onCreate?: (content: string) => void, isLoading?: boolean }) {
  const [story, setStory] = useState('')
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <Card className="w-full max-w-lg p-6">
        <h2 className="text-xl font-bold mb-4">Share Story</h2>
        <textarea
          className="w-full border rounded p-2 mb-4"
          rows={4}
          placeholder="Share a story..."
          value={story}
          onChange={e => setStory(e.target.value)}
        />
        <div className="flex gap-2 justify-end">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button variant="primary" isLoading={isLoading} onClick={() => onCreate?.(story)} disabled={!story.trim() || isLoading}>Create</Button>
        </div>
      </Card>
    </div>
  )
}
