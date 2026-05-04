'use client'

import { Bell, Search, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useRedux'
import { useNotifications } from '@/hooks/useNotifications'
import { useState, useEffect } from 'react'
import { MobileSidebar } from './MobileSidebar'

interface UserNavbarProps {
  onMenuClick?: () => void
  children?: React.ReactNode
}

export const UserNavbar = ({ onMenuClick, children }: UserNavbarProps) => {
  const { user, isAuthenticated } = useAuth()
  const { unreadCount } = useNotifications()

  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [avatarLoadFailed, setAvatarLoadFailed] = useState(false)

  // ✅ Fix hydration mismatch
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    setAvatarLoadFailed(false)
  }, [user?.id])

  const getInitials = (value?: string) => {
    const normalized = (value || '').trim()
    if (!normalized) return 'U'

    const parts = normalized.split(/\s+/).filter(Boolean)
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }

    return normalized.slice(0, 2).toUpperCase()
  }

  const profilePhoto = (user as any)?.profile_photo || user?.avatar
  const initials = getInitials((user as any)?.full_name || user?.username || user?.name)

  const handleMenuClick = () => {
    setIsSidebarOpen((open) => !open)
    onMenuClick?.()
  }

  return (
    <>
      <nav
        className="fixed top-0 left-0 w-full z-40 bg-white border-b border-gray-200 lg:pl-64"
        style={{ height: '64px' }}
      >
        <div className="px-4 lg:px-6 h-full flex items-center justify-between">
          
          {/* Mobile Menu Button */}
          <button
            onClick={handleMenuClick}
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
          >
            {isSidebarOpen ? (
              <X className="h-6 w-6 text-gray-600" />
            ) : (
              <Menu className="h-6 w-6 text-gray-600" />
            )}
          </button>

          {/* Logo for mobile */}
          <div className="lg:hidden flex-shrink-0">
            <h1 className="text-lg font-semibold text-[#212529]">
              BusinessTalk<span>24</span>
            </h1>
          </div>

          {/* Search */}
          <div className="hidden md:flex items-center bg-gray-100 rounded-full px-4 py-2 flex-1 mx-4 max-w-[400px]">
            <Search className="h-4 w-4 text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Search for Q&A, Post, Stories, People..."
              className="bg-transparent outline-none text-sm w-full"
            />
          </div>

          {/* Right */}
          <div className="flex items-center gap-4">
            
            {/* Notification */}
            <Link href="/notifications">
              <button className="relative p-2 hover:bg-gray-100 rounded-lg">
                <Bell className="h-6 w-6 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
                )}
              </button>
            </Link>

            {/* ✅ Avatar (hydration safe) */}
            {mounted && isAuthenticated && user && (
              <Link href="/profile">
                {profilePhoto && !avatarLoadFailed ? (
                  <img
                    src={profilePhoto || `https://ui-avatars.com/api/name=${encodeURIComponent(initials)}`}
                    alt={(user as any)?.full_name || user?.username || user?.name || 'User'}
                    className="h-9 w-9 rounded-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    onError={() => setAvatarLoadFailed(true)}
                  />
                ) : (
                  <div className="h-9 w-9 rounded-full bg-[#212529] text-white flex items-center justify-center text-sm font-medium cursor-pointer hover:opacity-90 transition-opacity">
                    {initials}
                  </div>
                )}
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      >
        {children}
      </MobileSidebar>
    </>
  )
}