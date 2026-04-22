'use client'

import { UserSidebar } from '@/components/shared/UserSidebar'

interface UserLayoutWrapperProps {
  children: React.ReactNode
}

export const UserLayoutWrapper = ({ children }: UserLayoutWrapperProps) => {
  return (
    <div className="min-h-screen bg-[#f5f6f7]">
      {/* Sidebar */}
      <UserSidebar />

      {/* Main Content */}
      <main className="lg:ml-64 p-1">
        <div className="w-full max-w-[1400px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}