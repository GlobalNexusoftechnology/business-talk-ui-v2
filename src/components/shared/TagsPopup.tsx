'use client'

import { X, Plus } from 'lucide-react'
import { useState } from 'react'

interface TagsPopupProps {
  isOpen: boolean
  onClose: () => void
  onTagsChange: (tags: string[]) => void
  selectedTags: string[]
}

const PRESET_TAGS = [
  // Question/Knowledge Tags
  'career-advice',
  'business-strategy',
  'marketing',
  'finance',
  'technology',
  'startup',
  'leadership',
  'sales',
  'entrepreneurship',
  'product-management',
  // Story Tags
  'lessons-learned',
  'success-story',
  'case-study',
  'industry-insights',
  'personal-growth',
  'innovation',
  'team-building',
  'customer-success',
  'scaling',
  'best-practices',
  'trends',
  'analysis',
]

export function TagsPopup({
  isOpen,
  onClose,
  onTagsChange,
  selectedTags,
}: TagsPopupProps) {
  const [customTag, setCustomTag] = useState('')
  const [displayedTags, setDisplayedTags] = useState(selectedTags)

  if (!isOpen) return null

  const handleToggleTag = (tag: string) => {
    const newTags = displayedTags.includes(tag)
      ? displayedTags.filter(t => t !== tag)
      : [...displayedTags, tag]
    setDisplayedTags(newTags)
  }

  const handleAddCustomTag = () => {
    if (customTag.trim() && !displayedTags.includes(customTag.toLowerCase())) {
      const newTags = [...displayedTags, customTag.toLowerCase()]
      setDisplayedTags(newTags)
      setCustomTag('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setDisplayedTags(displayedTags.filter(t => t !== tag))
  }

  const handleSave = () => {
    onTagsChange(displayedTags)
    onClose()
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Popup Card */}
      <div className="fixed inset-0 flex items-end sm:items-center justify-center z-50 p-4">
        <div
          className="relative w-full max-w-2xl sm:max-w-md md:max-w-2xl bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 overflow-visible"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="max-h-[82vh] overflow-y-auto pt-2">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition"
          >
            <X size={20} />
          </button>

          {/* Title */}
          <h2 className="text-2xl font-bold mb-6" style={{ color: '#212529' }}>
            Add Tags
          </h2>

          {/* Selected Tags Display */}
          {displayedTags.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-medium mb-3" style={{ color: '#5F6368' }}>
                Selected Tags ({displayedTags.length})
              </p>
              <div className="flex gap-2 flex-nowrap overflow-x-auto mt-2 pb-1">
                {displayedTags.map((tag) => (
                  <div
                    key={tag}
                    className="flex items-center gap-2 px-3 py-2 rounded-full transition-all"
                    style={{ backgroundColor: '#212529' }}
                  >
                    <span className="text-sm text-white items-center whitespace-nowrap">{tag}</span>
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="text-white hover:text-gray-300 transition"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Custom Tag Input */}
          <div className="mb-6">
            <p className="text-sm font-medium mb-3" style={{ color: '#5F6368' }}>
              Create Custom Tag
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddCustomTag()}
                placeholder="Type a custom tag..."
                className="flex-1 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 transition-all"
                style={{
                  borderColor: '#E8E8E8',
                  color: '#212529',
                }}
              />
              <button
                onClick={handleAddCustomTag}
                className="px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
                style={{ backgroundColor: '#212529', color: '#FFFFFF' }}
              >
                <Plus size={18} />
                Add
              </button>
            </div>
          </div>

          {/* Preset Tags Grid */}
          <div>
            <p className="text-sm font-medium mb-3" style={{ color: '#5F6368' }}>
              Popular Tags
            </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-2 max-h-64 overflow-y-auto">
              {PRESET_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleToggleTag(tag)}
                  className="px-4 py-2 rounded-lg font-medium transition-all border-2 text-sm min-w-0 break-words whitespace-normal text-center"
                  style={{
                    backgroundColor: displayedTags.includes(tag)
                      ? '#212529'
                      : '#F8F9FA',
                    color: displayedTags.includes(tag)
                      ? '#FFFFFF'
                      : '#212529',
                    borderColor: displayedTags.includes(tag)
                      ? '#212529'
                      : '#E8E8E8',
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t" style={{ borderColor: '#E8E8E8' }}>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg font-medium transition-all"
              style={{
                backgroundColor: '#F8F9FA',
                color: '#212529',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 rounded-lg font-medium transition-all"
              style={{
                backgroundColor: '#212529',
                color: '#FFFFFF',
              }}
            >
              Save Tags
            </button>
          </div>
          </div>
        </div>
      </div>
    </>
  )
}
