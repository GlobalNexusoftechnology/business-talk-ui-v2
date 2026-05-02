'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
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
  FileEdit,
} from 'lucide-react'
import { useAuth } from '@/hooks/useRedux'
import { logout } from '@/redux/slices/authSlice'


// Data-driven sidebar sections for reuse
export const userSidebarSections = [
  {
    title: 'Main',
    items: [
      { label: 'Home', href: '/dashboard', icon: Home },
      { label: 'My Profile', href: '/profile', icon: User },
      { label: 'Messages', href: '/messages', icon: MessageSquare },
    ],
  },
  {
    title: 'Community',
    items: [
      { label: 'People', href: '/people', icon: Users },
      { label: 'Groups', href: '/groups', icon: UsersRound },
      { label: 'Blogs', href: '/blogs', icon: BookOpen },
      // { label: 'Drafts', href: '/drafts', icon: FileEdit },
    ],
  },
  {
    title: 'Other',
    items: [
      { label: 'Drafts', href: '/drafts', icon: FileEdit },
      { label: 'Notifications', href: '/notifications', icon: Bell },
      { label: 'Settings', href: '/settings', icon: Settings },
    ],
  },
]


export const UserSidebar = () => {
  const pathname = usePathname()
  const { dispatch } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await dispatch(logout())   // wait for logout to complete
    router.push('/login')      // redirect to login page
  }

  return (
    <aside className="hidden lg:fixed lg:left-0 lg:top-0 lg:h-screen lg:w-64 lg:flex lg:flex-col bg-white border-r overflow-y-auto" style={{ borderColor: '#E8E8E8' }}>
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
      <nav className="flex-1 p-4 space-y-4">
        {userSidebarSections.map((section) => (
          <div key={section.title}>
            <div className="mb-2 font-semibold text-xs text-gray-500 uppercase tracking-wide pl-2">{section.title}</div>
            <div className="space-y-1">
              {section.items.map((item) => {
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
            </div>
          </div>
        ))}

        {/* Divider */}
        <div className="py-2">
          <div className="border-t" style={{ borderColor: '#E8E8E8' }}></div>
        </div>


        {/* Sectioned Legal/Platform/Support Navigation */}
        <div className="mt-6 space-y-4">
          {/* Company */}
          <div>
            <div className="mb-2 font-semibold text-xs text-gray-500 uppercase tracking-wide pl-2">Company</div>
            <Link
              href="/about"
              className="w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all text-sm"
              style={{ color: '#5F6368' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8F9FA')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <Info className="w-5 h-5" />
              <span>About</span>
            </Link>
          </div>

          {/* Legal */}
          <div>
            <div className="mb-2 font-semibold text-xs text-gray-500 uppercase tracking-wide pl-2">Legal</div>
            <div className="space-y-1">
              <Link
                href="/terms-of-service"
                className="w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all text-sm"
                style={{ color: '#5F6368' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8F9FA')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <FileCheck className="w-5 h-5" />
                <span>Terms of Service</span>
              </Link>
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
                href="/disclaimer"
                className="w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all text-sm"
                style={{ color: '#5F6368' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8F9FA')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <Info className="w-5 h-5" />
                <span>Disclaimer</span>
              </Link>
            </div>
          </div>

          {/* Platform */}
          <div>
            <div className="mb-2 font-semibold text-xs text-gray-500 uppercase tracking-wide pl-2">Platform</div>
            <Link
              href="/community-guidelines"
              className="w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all text-sm"
              style={{ color: '#5F6368' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8F9FA')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <Users className="w-5 h-5" />
              <span>Community Guidelines</span>
            </Link>
          </div>

          {/* Support */}
          <div>
            <div className="mb-2 font-semibold text-xs text-gray-500 uppercase tracking-wide pl-2">Support</div>
            <Link
              href="/feedback-support"
              className="w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all text-sm"
              style={{ color: '#5F6368' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8F9FA')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <MessageSquare className="w-5 h-5" />
              <span>Feedback & Support</span>
            </Link>
          </div>
        </div>

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