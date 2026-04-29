'use client'

import React from 'react'
import { userSidebarSections } from '@/components/shared/UserSidebar'
import { TrendingItem, UserCard, GroupCard } from '@/components/user/RightSidebar'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useRedux'
import { logout } from '@/redux/slices/authSlice'

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
  loading = false,
  onProfileClick,
  onFollow,
  onSeeAllPeople,
  onSeeAllGroups,
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
                      type="question"
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
                      type="story"
                      onClick={onStoryClick}
                    />
                  ))}
                </div>
              </div>

              {/* Users */}
              <div>
              <h3 className="font-semibold mb-2 text-sm">Suggested People</h3>
              <div className="space-y-3">
                {people.map((person) => (
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
                {groups.map((group) => (
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
        <div className="border-t mb-2" />

        <a href="/privacy-policy" className="block px-4 py-2 text-sm text-gray-600">
          Privacy Policy
        </a>

        <a href="/user-agreement" className="block px-4 py-2 text-sm text-gray-600">
          User Agreement
        </a>

        <button className="w-full text-left px-4 py-2 text-sm text-gray-600">
          About
        </button>

        <button
          onClick={handleLogout}
          className="w-full text-left px-4 py-2 text-sm text-red-600"
        >
          Logout
        </button>
      </div>
    </div>
  )
}