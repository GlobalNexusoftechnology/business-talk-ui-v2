'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import apiClient from '@/lib/api-client'

import { ProfileHeader } from './ProfileHeader'
import { ProfileStats } from './ProfileStats'
import { ProfileTabs } from './ProfileTabs'
import { ProfileActivityFeed } from './ProfileActivityFeed'
import { UserSidebar } from '@/components/shared/UserSidebar'

import { useFollow } from '@/hooks/useFollow'

const TABS = [
  { key: 'posts', label: 'Posts' },
  { key: 'about', label: 'About' },
]

export default function ProfilePage() {
  const { id } = useParams()

  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('posts')

  // ✅ FOLLOW HOOK
  const {
    state: followState,
    loading: followLoading,
    follow,
    unfollow,
  } = useFollow(id as string)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await apiClient.getUserById(id as string)
        setProfile(res.data)
      } catch (err) {
        console.error('Profile fetch error:', err)
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchUser()
  }, [id])

  if (loading) return <div className="p-6">Loading...</div>
  if (!profile) return <div className="p-6">User not found</div>

  // ✅ NORMALIZE DATA (VERY IMPORTANT)
  const normalizedProfile = {
    name: profile.full_name || profile.username || 'User',
    avatar: profile.profile_photo || '/avatar.png',
    title: profile.profession || 'Professional',
    company: profile.company || '',
    location: profile.location || '',
    joinedDate: profile.created_on || '',
  }

  return (
    <div className="bg-[#F8F9FA] min-h-screen">

      <div className="flex max-w-7xl mx-auto">

        {/* LEFT SIDEBAR */}
        <div className="hidden lg:block lg:w-64 flex-shrink-0">
          <UserSidebar />
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 min-w-0">

          <div className="max-w-5xl mx-auto">

            {/* HEADER */}
            <ProfileHeader
              profileData={normalizedProfile}
              connectState={followState}
              loading={followLoading}
              onConnect={() => {
                if (followState === 'connected') {
                  unfollow()
                } else {
                  follow()
                }
              }}
            />

            {/* STATS */}
            <ProfileStats
              stats={{
                connections: 0,
                followers: 0,
                posts: 0,
                groups: 0,
              }}
            />

            {/* TABS */}
            <ProfileTabs
              tabs={TABS}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />

            {/* CONTENT */}
            <div className="p-6">
              <ProfileActivityFeed
                activeTab={activeTab}
                posts={[]}
                qna={[]}
                blogs={[]}
                aboutContent={
                  <div className="bg-white p-6 rounded-xl border">
                    <h2 className="font-semibold mb-2">About</h2>
                    <p>
                      {profile.about ||
                        profile.short_bio ||
                        'No bio available'}
                    </p>
                  </div>
                }
              />
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}