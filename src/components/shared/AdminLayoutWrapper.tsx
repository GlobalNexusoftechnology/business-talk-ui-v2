'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AdminSidebar } from '@/components/shared/AdminSidebar'
import { AdminNavbar } from '@/components/shared/AdminNavbar'
import { isAdmin } from '@/lib/roles'

const isRestrictedUser = (user: any) =>
  Boolean(user?.is_banned || user?.isBanned || user?.is_shadow_banned || user?.isShadowBanned)

export const AdminLayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  const router = useRouter()

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user')

      if (!stored) {
        router.replace('/login')
        return
      }

      const user = JSON.parse(stored)

      // ❌ Not logged in
      if (!user?.id) {
        router.replace('/login')
        return
      }

      // ❌ Not admin
      if (!isAdmin(user.role_id)) {
        router.replace('/dashboard') // safer than "/"
        return
      }

      if (isRestrictedUser(user)) {
        localStorage.removeItem('user')
        router.replace('/account-restricted')
        return
      }

      setLoading(false)

    } catch (err) {
      console.error('Auth check failed', err)
      router.replace('/login')
    }
  }, [router])

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Checking admin access...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <AdminSidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
      <AdminNavbar onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} />

      <main className="lg:ml-64">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}