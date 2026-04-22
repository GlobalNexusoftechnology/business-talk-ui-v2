'use client'

import MainFeed from '@/components/user/MainFeed'
import { RightSidebar } from '@/components/user/RightSidebar'

export default function DashboardPage() {
  return (
    <div className="flex gap-6 min-h-screen" style={{ backgroundColor: '#F8F9FA' }}>
      
      {/* MAIN FEED */}
      <div className="flex-1 p-6 ">
        <MainFeed />
      </div>

      {/* RIGHT SIDEBAR - Desktop only */}
      <div className="hidden xl:block sticky p-6">
        <RightSidebar />
      </div>
    </div>
  )
}