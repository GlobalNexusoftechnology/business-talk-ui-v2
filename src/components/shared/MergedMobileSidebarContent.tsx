'use client'

import React from 'react'
import { userSidebarSections } from '@/components/shared/UserSidebar'
import { TrendingItem, UserCard, GroupCard } from '@/components/user/RightSidebar'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useRedux'
import { logout } from '@/redux/slices/authSlice'
import { FileCheck, Info, LogOut, MessageSquare, Shield, Users } from 'lucide-react'
import Link from 'next/link'

interface Props {
  people: any[]
  stories: any[]
  questions: any[]
  groups: any[]
  loading: boolean
  onProfileClick: (p: any) => void
  onFollow: (id: string) => void
  onSeeAllPeople: () => void
  onSeeAllGroups: () => void
  onTrendingClick: (q: any) => void
  onStoryClick: (s: any) => void
}

export const MergedMobileSidebarContent = ({
  people = [],
  stories = [],
  questions = [],
  groups = [],
  // loading = false,
  onProfileClick,
  onFollow,
  // onSeeAllPeople,
  // onSeeAllGroups,
  onTrendingClick,
  onStoryClick,
}: Props) => {
  const pathname = usePathname()
  const { dispatch } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await dispatch(logout())   // wait for logout to complete
    router.push('/login')      // redirect to login page
  }
  
  return (
    <div className="p-4 space-y-6">
      
      {userSidebarSections.map((section, idx) => (
        <React.Fragment key={section.title}>
          
          {/* LEFT SIDEBAR SECTION */}
          <div>
            <div className="mb-2 font-semibold text-xs text-gray-500 uppercase tracking-wide pl-2">
              {section.title}
            </div>

            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href

                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg"
                    style={{
                      backgroundColor: isActive ? '#F8F9FA' : 'transparent',
                      color: '#212529',
                    }}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </a>
                )
              })}
            </div>
          </div>

          {/* ========================= */}
          {/* RIGHT SIDEBAR INSERTIONS */}
          {/* ========================= */}

          {/* 👉 AFTER FIRST SECTION → GROUPS */}
          {idx === 2 && (
            <>
            {/* Trending Questions */}
              <div>
                <h3 className="font-semibold mb-2 text-sm">Trending Questions</h3>
                <div className="space-y-2">
                  {questions.map((q) => (
                    <TrendingItem
                      key={q.id}
                      item={q}
                      type="questions"
                      onClick={onTrendingClick}
                    />
                  ))}
                </div>
              </div>

              {/* Stories */}
              <div>
                <h3 className="font-semibold mb-2 text-sm">Stories</h3>
                <div className="space-y-2">
                  {stories.map((s) => (
                    <TrendingItem
                      key={s.id}
                      item={s}
                      type="stories"
                      onClick={onStoryClick}
                    />
                  ))}
                </div>
              </div>

              {/* Users */}
              <div>
              <h3 className="font-semibold mb-2 text-sm">Suggested People</h3>
              <div className="space-y-3">
                {people.slice(0, 5).map((person) => (
                  <UserCard
                    key={person.id}
                    person={person}
                    onProfileClick={onProfileClick}
                    connectState="connect"
                    onConnectClick={() => onFollow(person.id)}
                  />
                ))}
              </div>
            </div>

            {/* Groups */}
            <div>
              <h3 className="font-semibold mb-2 text-sm">Groups</h3>
              <div className="space-y-3">
                {groups.slice(0, 5).map((group) => (
                  <GroupCard
                    key={group.id}
                    group={group}
                    onClick={() => router.push(`/groups/${group.id}`)}
                    joinState="join"
                    onJoinClick={() => {}}
                  />
                ))}
              </div>
            </div>
            </>
          )}
        </React.Fragment>
      ))}

      {/* ========================= */}
      {/* FOOTER */}
      {/* ========================= */}

      <div className="py-2">
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
      </div>
    </div>
  )
}