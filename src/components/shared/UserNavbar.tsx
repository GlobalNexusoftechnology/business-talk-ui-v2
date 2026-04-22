'use client'

import { Bell, Search, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useRedux'
import { useState } from 'react'
import { UserSidebar } from './UserSidebar'

interface UserNavbarProps {
  onMenuClick?: () => void
}

export const UserNavbar = ({ onMenuClick }: UserNavbarProps) => {
  const { user, isAuthenticated } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleMenuClick = () => {
    setMobileMenuOpen(!mobileMenuOpen)
    onMenuClick?.()
  }

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-40 bg-white border-b border-gray-200 lg:pl-64" style={{ height: '64px' }}>
        <div className="px-4 lg:px-6 h-full flex items-center justify-between">
          
          {/* Mobile Menu Button */}
          <button onClick={handleMenuClick} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
            {mobileMenuOpen ? <X className="h-6 w-6 text-gray-600" /> : <Menu className="h-6 w-6 text-gray-600" />}
          </button>

          {/* Logo for mobile */}
          <div className="lg:hidden flex-shrink-0">
            <h1 className="text-lg font-semibold text-[#212529]">
              BusinessTalk<span className="text-[#212529]">24</span>
            </h1>
          </div>

          {/* Search - Hidden on mobile */}
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
            <button className="relative p-2 hover:bg-gray-100 rounded-lg">
              <Bell className="h-6 w-6 text-gray-600" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
            </button>

            {/* Avatar */}
            {isAuthenticated && user && (
              <Link href="/profile">
                <div className="h-9 w-9 rounded-full bg-[#212529] text-white flex items-center justify-center text-sm font-medium cursor-pointer hover:opacity-90 transition-opacity">
                  {user.name?.charAt(0) || user.username?.charAt(0) || 'U'}
                </div>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed left-0 top-16 h-[calc(100vh-64px)] bg-white z-30 overflow-y-auto lg:hidden w-64 border-r border-gray-200">
            <UserSidebar />
          </div>
        </>
      )}
    </>
  )
}