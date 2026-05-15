 'use client'

import { X, Copy } from 'lucide-react'
import { useEffect, useState } from 'react'
import { FaWhatsapp, FaTelegram, FaLinkedin, FaFacebook } from 'react-icons/fa'
import apiClient from '@/lib/api-client'

const FRONTEND_URL = process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://businesstalk24.com'


interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  postContent?: string
  contentType?: 'blogs' | 'questions' | 'stories' | 'posts' | 'groups'
  contentId?: string
}

export function ShareModal({
  isOpen,
  onClose,
  title = 'Share with Friends',
  postContent = 'Check this out on Businesstalk24!',
  contentType = 'posts',
  contentId = '12345',
}: ShareModalProps) {
  // Helper: normalize various search API response shapes to an array of users
  const extractUsersFromSearch = (res: any): any[] => {
    if (!res) return []
    // If the response itself is the array
    if (Array.isArray(res)) return res
    // axios-style: res.data is the body
    const body = res.data ?? res
    if (!body) return []
    // Common shapes:
    // { data: { users: [...] }, meta: ... }
    if (Array.isArray(body.users)) return body.users
    if (Array.isArray(body.data)) return body.data
    if (body.data && Array.isArray(body.data.users)) return body.data.users
    // some endpoints return { users: [...] } directly in body
    if (Array.isArray(body.users)) return body.users
    return []
  }

  const [copied, setCopied] = useState(false)
  const [shareToChatOpen, setShareToChatOpen] = useState(false)
  const [recipientInput, setRecipientInput] = useState('')
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [chatLoading, setChatLoading] = useState(false)
  const [chatMessage, setChatMessage] = useState<string | null>(null)

  const postUrl = `${FRONTEND_URL}/${contentType}/${contentId}`

  const [shareUrl, setShareUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return

    // Determine which backend share endpoint to call based on contentType
    const loadShare = async () => {
      try {
        // Use backend share endpoints when available; they return canonical frontend share URLs
        if (contentType === 'questions' || contentType === 'posts') {
          const res = await apiClient.sharePost(contentId!)
          setShareUrl(res?.data?.url || null)
          return
        }

        if (contentType === 'stories' || contentType === 'blogs') {
          const res = await apiClient.shareBlog(contentId!)
          setShareUrl(res?.data?.url || null)
          return
        }

        // default: construct frontend path
        setShareUrl(`${FRONTEND_URL}/${contentType}/${contentId}`)
      } catch (e) {
        // fallback to frontend path
        setShareUrl(`${FRONTEND_URL}/${contentType}/${contentId}`)
      }
    }

    void loadShare()
  }, [isOpen, contentType, contentId])

  // Debounced search for users only
  useEffect(() => {
    if (!shareToChatOpen) return
    const q = recipientInput.trim()
    if (!q) {
      setSearchResults([])
      setShowDropdown(false)
      setSelectedUserId(null)
      return
    }

    let cancelled = false
    setSearchLoading(true)
    setShowDropdown(true)

    const t = setTimeout(async () => {
      try {
        // apiClient.searchAll should accept (query, type) and return { data: { users: [...] } } or array
        const res = await apiClient.searchAll(q, 'users')
        // normalize results: support different shapes
        const users = extractUsersFromSearch(res)
        if (!cancelled) setSearchResults(users)
      } catch (err) {
        if (!cancelled) setSearchResults([])
      } finally {
        if (!cancelled) setSearchLoading(false)
      }
    }, 300)

    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [recipientInput, shareToChatOpen])

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl ?? postUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (e) {
      alert('Failed to copy link')
    }
  }

  const handleSocialShare = (platform: string) => {
    const text = encodeURIComponent(postContent)
    const encodedUrl = encodeURIComponent(shareUrl ?? postUrl)

    const urls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      x: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${text}`,
      whatsapp: `https://wa.me/?text=${text}%20${encodedUrl}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${text}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    }

    const url = urls[platform.toLowerCase()]
    if (url) window.open(url, '_blank', 'width=600,height=400')
  }

  const handleShareToChat = async () => {
    if (!recipientInput || !recipientInput.trim()) {
      setChatMessage('Please enter recipient full name')
      return
    }

    setChatLoading(true)
    setChatMessage(null)

    try {
      // Resolve recipient input (full_name) to user id via backend search
      let targetUserId: string | null = null

      // If the user selected a suggestion, use that id directly
      if (selectedUserId) {
        targetUserId = selectedUserId
      } else {
        // Try searching users by name; fall back to treating input as id if search fails
        try {
          const searchRes = await apiClient.searchAll(recipientInput.trim(), 'users')
          const users = extractUsersFromSearch(searchRes)
          // Prefer exact full_name match (case-insensitive), else pick first result
          const match = users.find((u: any) => (u.full_name || u.username || '').toLowerCase() === recipientInput.trim().toLowerCase()) || users[0]
          if (match) targetUserId = String(match.id || match.user_id || match.uid || match._id)
        } catch (e) {
          // ignore and attempt to use raw input as id below
        }
      }

      if (!targetUserId) {
        // If input looks like an id, try directly
        if (/^\d+$/.test(recipientInput.trim()) || /^[0-9a-fA-F-]{8,}$/.test(recipientInput.trim())) {
          targetUserId = recipientInput.trim()
        }
      }

      if (!targetUserId) {
        setChatMessage('Recipient not found')
        setChatLoading(false)
        return
      }

      const conv = await apiClient.getOrCreateConversation(targetUserId)
      const conversationId = conv?.id
      if (!conversationId) throw new Error('Failed to get or create conversation')

      const payload: any = {}
      if (contentType === 'posts' || contentType === 'questions') {
        payload.messageType = 'post'
        payload.postId = contentId
      } else if (contentType === 'blogs' || contentType === 'stories') {
        payload.messageType = 'blog'
        payload.blogId = contentId
      } else {
        payload.messageType = 'text'
        payload.content = `${postContent} ${shareUrl ?? postUrl}`
      }

      await apiClient.sendRichMessage(conversationId, payload)

      setChatMessage('Shared to chat successfully')
      // Dispatch global app toast for success
      try {
        window.dispatchEvent(new CustomEvent('app-toast', { detail: { message: 'Shared to chat successfully', type: 'success' } }))
      } catch (e) {
        // ignore in non-browser environments
      }
      setRecipientInput('')
      setShareToChatOpen(false)
    } catch (err: any) {
      console.error('share-to-chat failed', err)
      setChatMessage(err?.response?.data?.message || String(err?.message || 'Failed to share'))
    } finally {
      setChatLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity" onClick={onClose} />

      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6" onClick={(e) => e.stopPropagation()}>
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center shadow-lg">🔗</div>

          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition">
            <X size={20} />
          </button>

          <div className="text-center mt-8 mb-6">
            <h2 className="text-xl font-semibold text-[#212529]">{title}</h2>
            <p className="text-sm text-gray-500 mt-1">Connect with friends and grow your network!</p>
          </div>

          <div className="mb-6">
            <p className="text-sm font-medium text-[#212529] mb-2">Share your link</p>
            <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2 gap-2">
              <input value={shareUrl ?? postUrl} readOnly className="flex-1 bg-transparent text-sm outline-none text-gray-700" />
              <button onClick={handleCopyLink} className="p-2 hover:bg-gray-200 rounded-md transition" title="Copy link">
                {copied ? '✓' : <Copy />}
              </button>
            </div>
            {copied && <p className="text-xs text-green-600 mt-1">Link copied to clipboard!</p>}
          </div>

          <div>
            <p className="text-sm font-medium text-[#212529] mb-3">Share to</p>

            <div className="flex flex-wrap justify-center gap-3">
              {[
                { name: 'Facebook', key: 'facebook', color: '#1877F2' },
                { name: 'X', key: 'x', color: '#000' },
                { name: 'WhatsApp', key: 'whatsapp', color: '#25D366' },
                { name: 'Telegram', key: 'telegram', color: '#0088cc' },
                { name: 'LinkedIn', key: 'linkedin', color: '#0A66C2' },
              ].map((social) => (
                <button key={social.key} onClick={() => handleSocialShare(social.key)} className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-100 transition" title={`Share on ${social.name}`}>
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white hover:shadow-lg transition" style={{ backgroundColor: social.color }}>
                    {social.name === 'Facebook' && <FaFacebook />}
                    {social.name === 'X' && '𝕏'}
                    {social.name === 'WhatsApp' && <FaWhatsapp />}
                    {social.name === 'Telegram' && <FaTelegram />}
                    {social.name === 'LinkedIn' && <FaLinkedin />}
                  </div>
                  <span className="text-xs text-gray-700 font-medium text-center">{social.name}</span>
                </button>
              ))}
            </div>

            <div className="mt-4">
              <p className="text-sm font-medium text-[#212529] mb-2">Share via Chat</p>

              <div className="flex gap-2 justify-center">
                <button onClick={() => setShareToChatOpen((s) => !s)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">{shareToChatOpen ? 'Cancel' : 'Share to Chat'}</button>
              </div>

              {shareToChatOpen && (
                <div className="mt-3">
                  <div className="relative">
                    <p className="text-xs text-gray-500 mb-2">Enter recipient full name (select from suggestions)</p>
                    <div className="flex gap-2">
                      <input
                        value={recipientInput}
                        onChange={(e) => {
                          setRecipientInput(e.target.value)
                          setSelectedUserId(null)
                        }}
                        onFocus={() => { if (searchResults.length) setShowDropdown(true) }}
                        placeholder="Recipient full name (e.g., Jane Doe)"
                        className="flex-1 px-3 py-2 border rounded-md"
                        aria-autocomplete="list"
                        aria-expanded={showDropdown}
                      />
                      <button onClick={handleShareToChat} disabled={chatLoading} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition disabled:opacity-60">{chatLoading ? 'Sending...' : 'Send'}</button>
                    </div>

                    {showDropdown && (
                      <div className="absolute z-40 left-0 right-0 mt-1 bg-white border rounded-md shadow-lg max-h-56 overflow-auto">
                        {searchLoading ? (
                          <div className="p-3 text-sm text-gray-500">Searching users...</div>
                        ) : searchResults.length === 0 ? (
                          <div className="p-3 text-sm text-gray-500">No users found</div>
                        ) : (
                          searchResults.map((u: any) => {
                            const name = u.full_name || u.name || u.username || u.displayName || `${u.firstName || ''} ${u.lastName || ''}`.trim()
                            const id = u.id || u.user_id || u.uid || u._id
                            return (
                              <button
                                key={String(id)}
                                onClick={() => {
                                  setRecipientInput(name)
                                  setSelectedUserId(String(id))
                                  setShowDropdown(false)
                                }}
                                className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <img src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`} alt={name} className="w-8 h-8 rounded-full object-cover" />
                                <div className="flex-1">
                                  <div className="text-sm font-medium text-gray-800">{name}</div>
                                  {u.username && <div className="text-xs text-gray-500">@{u.username}</div>}
                                </div>
                              </button>
                            )
                          })
                        )}
                      </div>
                    )}
                  </div>

                  {chatMessage && <p className="text-sm text-gray-700 mt-2">{chatMessage}</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
