'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import clsx from 'clsx'
import {
  LayoutGrid,
  Users,
  FileText,
  Shield,
  ImageIcon,
  BookOpen,
  // Mail,
  Bell,
  // Megaphone,
  BarChart3,
  // DollarSign,
  // Lock,
  Settings,
  ShieldAlert,
  LogOut,
  MessageSquare,
  X,
} from 'lucide-react'
import { useAuth } from '@/hooks/useRedux'
import { logout } from '@/redux/slices/authSlice'

const adminSidebarItems = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutGrid },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Posts', href: '/admin/posts', icon: FileText },
  { label: 'Questions', href: '/admin/questions', icon: Shield },
  // { label: 'Moderation', href: '/admin/moderation', icon: Shield },
  { label: 'Stories', href: '/admin/stories', icon: ImageIcon },
  { label: 'Blogs', href: '/admin/blogs', icon: BookOpen },
  { label: 'Reports', href: '/admin/reports', icon: ShieldAlert },
  // { label: 'Email Marketing', href: '/admin/email-marketing', icon: Mail },
  { label: 'Notifications', href: '/admin/notifications', icon: Bell },
  // { label: 'Advertisements', href: '/admin/advertisements', icon: Megaphone },
  { label: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  { label: 'Feedback', href: '/admin/feedback', icon: MessageSquare },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
  // { label: 'Revenue', href: '/admin/revenue', icon: DollarSign },
  // { label: 'Roles', href: '/admin/roles', icon: Lock },
  // { label: 'Settings', href: '/admin/settings', icon: Settings },
]

interface AdminSidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export const AdminSidebar = ({
  isOpen = false,
  onClose,
}: AdminSidebarProps) => {
  const pathname = usePathname()
  const { dispatch } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await dispatch(logout())   // wait for logout to complete
    onClose?.()
    router.push('/login')      // redirect to login page
  }

  return (
    <>
      {/* Mobile and tablet overlay drawer */}
      <div
        className={clsx(
          'fixed inset-0 z-50 bg-black/40 transition-opacity lg:hidden',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
        aria-hidden={!isOpen}
      />

      <aside
        className={clsx(
          'fixed left-0 top-0 z-[60] h-screen w-64 bg-secondary-900 overflow-y-auto transition-transform duration-300',
          'lg:z-40 lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="px-6 py-6 border-b border-secondary-700 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">AdminHub</h1>
          <button
            onClick={onClose}
            className="lg:hidden text-secondary-200 hover:text-white p-1 rounded"
            aria-label="Close admin menu"
          >
            <X className="h-5 w-5" />
          </button>
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
                    onClick={onClose}
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
    </>
  )
}
