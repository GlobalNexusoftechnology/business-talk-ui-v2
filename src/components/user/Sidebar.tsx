'use client'

import {
  Home,
  MessageCircle,
  Users,
  FileText,
  Bell,
  Settings,
} from 'lucide-react'

const menu = [
  { name: 'Home', icon: Home },
  { name: 'Messages', icon: MessageCircle },
  { name: 'People', icon: Users },
  { name: 'Groups', icon: Users },
  { name: 'Blogs', icon: FileText },
  { name: 'Notifications', icon: Bell },
  { name: 'Settings', icon: Settings },
]

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-4">
      <h1 className="text-xl font-bold text-[#212529] mb-6">BT24</h1>

      <nav className="space-y-2">
        {menu.map((item) => {
          const Icon = item.icon
          return (
            <div
              key={item.name}
              className="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-100"
            >
              <Icon className="w-5 h-5 text-[#212529]" />
              <span className="text-sm text-[#212529]">{item.name}</span>
            </div>
          )
        })}
      </nav>

      <div className="mt-10 border-t pt-4 text-sm text-gray-500 space-y-2">
        <p>Privacy Policy</p>
        <p>User Agreement</p>
        <p>About</p>
        <p className="text-red-500 cursor-pointer">Logout</p>
      </div>
    </aside>
  )
}