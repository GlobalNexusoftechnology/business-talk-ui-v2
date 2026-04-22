'use client'

import { X, Copy } from 'lucide-react'
import { useState } from 'react'
import { FaWhatsapp, FaTelegram , FaLinkedin, FaFacebook } from 'react-icons/fa';


interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  postContent?: string
  contentType?: 'blog' | 'question' | 'story' | 'post' | 'group'
  contentId?: string
}

export function ShareModal({ 
  isOpen, 
  onClose, 
  title = 'Share with Friends',
  postContent = 'Check this out on Business Talk 24!',
  contentType = 'post',
  contentId = '12345'
}: ShareModalProps) {
  const [copied, setCopied] = useState(false)

  // Construct the post URL dynamically based on content type
  const postUrl = `https://businesstalk24.com/${contentType}/${contentId}`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(postUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }).catch(() => {
      alert('Failed to copy link')
    })
  }

  const handleSocialShare = (platform: string) => {
    const text = encodeURIComponent(postContent)
    const encodedUrl = encodeURIComponent(postUrl)
    
    const urls: { [key: string]: string } = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      x: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${text}`,
      whatsapp: `https://wa.me/?text=${text}%20${encodedUrl}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${text}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    }
    
    const url = urls[platform.toLowerCase()]
    if (url) {
      window.open(url, '_blank', 'width=600,height=400')
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div
          className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Floating Icon */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center shadow-lg">
            🔗
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition"
          >
            <X size={20} />
          </button>

          {/* Title */}
          <div className="text-center mt-8 mb-6">
            <h2 className="text-xl font-semibold text-[#212529]">
              {title}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Connect with friends and grow your network!
            </p>
          </div>

          {/* Copy Link Section */}
          <div className="mb-6">
            <p className="text-sm font-medium text-[#212529] mb-2">Share your link</p>
            <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2 gap-2">
              <input
                value={postUrl}
                readOnly
                className="flex-1 bg-transparent text-sm outline-none text-gray-700"
              />
              <button
                onClick={handleCopyLink}
                className="p-2 hover:bg-gray-200 rounded-md transition"
                title="Copy link"
              >
                {copied ? '✓' : <Copy />}
              </button>
            </div>
            {copied && (
              <p className="text-xs text-green-600 mt-1">Link copied to clipboard!</p>
            )}
          </div>

          {/* Social Share Section */}
          <div>
            <p className="text-sm font-medium text-[#212529] mb-3">Share to</p>
            <div className="flex justify-between gap-2">
              {[
                { name: 'Facebook', key: 'facebook', color: '#1877F2' },
                { name: 'X', key: 'x', color: '#000' },
                { name: 'WhatsApp', key: 'whatsapp', color: '#25D366' },
                { name: 'Telegram', key: 'telegram', color: '#0088cc' },
                { name: 'LinkedIn', key: 'linkedin', color: '#0A66C2' },
              ].map((social) => (
                <button
                  key={social.key}
                  onClick={() => handleSocialShare(social.key)}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg hover:bg-gray-100 transition"
                  title={`Share on ${social.name}`}
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white hover:shadow-lg transition"
                    style={{ backgroundColor: social.color }}
                  >
                    {social.name === 'Facebook' && <FaFacebook />}
                    {social.name === 'X' && '𝕏'}
                    {social.name === 'WhatsApp' && <FaWhatsapp />}
                    {social.name === 'Telegram' && <FaTelegram />}
                    {social.name === 'LinkedIn' && <FaLinkedin />}
                  </div>
                  <span className="text-xs text-gray-700 font-medium text-center">
                    {social.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
