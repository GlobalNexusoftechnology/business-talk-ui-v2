'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'
import {
  LayoutGrid,
  Users,
  FileText,
  Shield,
  ImageIcon,
  BookOpen,
  BarChart3,
  Mail,
  Bell,
  Megaphone,
  TrendingUp,
  DollarSign,
  Lock,
  Settings,
  LogOut,
} from 'lucide-react'
import { useAuth } from '@/hooks/useRedux'
import { logout } from '@/redux/slices/authSlice'

const adminSidebarItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutGrid },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Posts', href: '/admin/posts', icon: FileText },
  { label: 'Moderation', href: '/admin/moderation', icon: Shield },
  { label: 'Stories', href: '/admin/stories', icon: ImageIcon },
  { label: 'Blogs', href: '/admin/blogs', icon: BookOpen },
  { label: 'Reports', href: '/admin/reports', icon: BarChart3 },
  { label: 'Email Marketing', href: '/admin/email-marketing', icon: Mail },
  { label: 'Notifications', href: '/admin/notifications', icon: Bell },
  { label: 'Advertisements', href: '/admin/advertisements', icon: Megaphone },
  { label: 'Analytics', href: '/admin/analytics', icon: TrendingUp },
  { label: 'Revenue', href: '/admin/revenue', icon: DollarSign },
  { label: 'Roles', href: '/admin/roles', icon: Lock },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
]

export const AdminSidebar = () => {
  const pathname = usePathname()
  const { dispatch } = useAuth()

  const handleLogout = () => {
    dispatch(logout())
  }

  return (
    <aside className="hidden lg:fixed lg:left-0 lg:top-0 lg:h-screen lg:w-64 lg:flex lg:flex-col lg:bg-secondary-900 lg:overflow-y-auto">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-secondary-700">
        <h1 className="text-2xl font-bold text-white">AdminHub</h1>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-1">
          {adminSidebarItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={clsx(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 text-sm',
                    isActive
                      ? 'bg-primary-600 text-white font-medium'
                      : 'text-secondary-300 hover:bg-secondary-800'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-secondary-700">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-secondary-800 transition-colors duration-200 text-sm"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}
