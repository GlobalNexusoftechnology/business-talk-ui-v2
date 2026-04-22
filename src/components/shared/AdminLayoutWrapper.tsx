'use client'

import { useState } from 'react'
import { AdminSidebar } from '@/components/shared/AdminSidebar'
import { AdminNavbar } from '@/components/shared/AdminNavbar'

interface AdminLayoutWrapperProps {
  children: React.ReactNode
}

export const AdminLayoutWrapper = ({ children }: AdminLayoutWrapperProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-secondary-50">
      <AdminSidebar />
      <AdminNavbar onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} />

      {/* Main Content */}[]
      <main className="lg:ml-64">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">{children}</div>
      </main>
    </div>
  )
}
