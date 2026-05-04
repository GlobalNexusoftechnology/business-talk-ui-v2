'use client'

import MainFeed from '@/components/user/MainFeed'
import { RightSidebar } from '@/components/user/RightSidebar'

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen w-full gap-0 lg:gap-6 overflow-x-hidden" style={{ backgroundColor: '#F8F9FA' }}>
      
      {/* MAIN FEED */}
      <div className="flex-1 min-w-0 p-0 sm:p-6">
        <MainFeed />
      </div>

      {/* RIGHT SIDEBAR - Desktop only */}
      <div className="hidden xl:block sticky p-6">
        <RightSidebar />
      </div>
    </div>
  )
}