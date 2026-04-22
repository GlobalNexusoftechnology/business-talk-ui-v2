'use client'

import { Bell, Search, Menu } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useRedux'

interface AdminNavbarProps {
  onMenuClick?: () => void
}

export const AdminNavbar = ({ onMenuClick }: AdminNavbarProps) => {
  const { user, isAuthenticated } = useAuth()

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-secondary-200 lg:ml-64">
      <div className="px-4 lg:px-6 py-4 flex items-center justify-between">
        {/* Left Side */}
        <div className="flex items-center gap-4">
          <button onClick={onMenuClick} className="lg:hidden p-2 hover:bg-secondary-50 rounded-lg">
            <Menu className="h-6 w-6 text-secondary-600" />
          </button>

          {/* Search Bar */}
          <div className="hidden md:flex items-center gap-2 bg-secondary-50 rounded-lg px-4 py-2 flex-1 max-w-xs">
            <Search className="h-5 w-5 text-secondary-400" />
            <input
              type="text"
              placeholder="Search users, posts..."
              className="bg-transparent outline-none text-sm w-full"
            />
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative p-2 hover:bg-secondary-50 rounded-lg">
            <Bell className="h-6 w-6 text-secondary-600" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Avatar */}
          {isAuthenticated && user && (
            <Link href="/profile">
              <div className="h-10 w-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-sm cursor-pointer hover:bg-primary-700 transition-colors">
                {user.name?.charAt(0) || user.username?.charAt(0) || 'A'}
              </div>
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
