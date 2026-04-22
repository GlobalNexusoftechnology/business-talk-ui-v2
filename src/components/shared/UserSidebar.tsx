'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  User,
  MessageSquare,
  Users,
  UsersRound,
  BookOpen,
  Bell,
  Settings,
  LogOut,
  Shield,
  FileCheck,
  Info,
} from 'lucide-react'
import { useAuth } from '@/hooks/useRedux'
import { logout } from '@/redux/slices/authSlice'

const sidebarItems = [
  { label: 'Home', href: '/dashboard', icon: Home },
  { label: 'My Profile', href: '/profile', icon: User },
  { label: 'Messages', href: '/messages', icon: MessageSquare },
  { label: 'People', href: '/people', icon: Users },
  { label: 'Groups', href: '/groups', icon: UsersRound },
  { label: 'Blogs', href: '/blogs', icon: BookOpen },
  { label: 'Notifications', href: '/notifications', icon: Bell },
  { label: 'Settings', href: '/settings', icon: Settings },
]

export const UserSidebar = () => {
  const pathname = usePathname()
  const { dispatch } = useAuth()

  const handleLogout = () => {
    dispatch(logout())
  }

  return (
    <aside className="hidden lg:fixed lg:left-0 lg:top-0 lg:h-screen lg:w-64 lg:flex lg:flex-col bg-white border-r" style={{ borderColor: '#E8E8E8' }}>
      
      {/* Logo */}
      <div className="px-6 py-6 border-b" style={{ borderColor: '#E8E8E8' }}>
        <img 
          src="/assets/logos/BUSINESSTALK24_LOGO_png.png" 
          alt="BusinessTalk24 Logo" 
          width={160}
          height={100}
          className="mb-2"
        />
        <p className="text-xs mt-1" style={{ color: '#5F6368' }}>Professional Network</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {sidebarItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all"
              style={{
                backgroundColor: isActive ? '#F8F9FA' : 'transparent',
                color: '#212529',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = '#F8F9FA'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }
              }}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}

        {/* Divider */}
        <div className="py-2">
          <div className="border-t" style={{ borderColor: '#E8E8E8' }}></div>
        </div>

        {/* Secondary Navigation */}
        <Link
          href="/privacy-policy"
          className="w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all text-sm"
          style={{ color: '#5F6368' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8F9FA')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <Shield className="w-5 h-5" />
          <span>Privacy Policy</span>
        </Link>

        <Link
          href="/user-agreement"
          className="w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all text-sm"
          style={{ color: '#5F6368' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8F9FA')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <FileCheck className="w-5 h-5" />
          <span>User Agreement</span>
        </Link>

        <button
          className="w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all text-sm"
          style={{ color: '#5F6368' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8F9FA')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <Info className="w-5 h-5" />
          <span>About</span>
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all text-sm"
          style={{ color: '#DC3545' }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8F9FA')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </nav>
    </aside>
  )
}