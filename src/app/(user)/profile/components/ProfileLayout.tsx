'use client'

import { useState } from 'react'
import { ProfileHeader } from './ProfileHeader'
import { ProfileTabs } from './ProfileTabs'
import { ProfileAbout } from './ProfileAbout'
import { ProfileExperience } from './ProfileExperience'
import { ProfileEducation } from './ProfileEducation'
import { ProfileGallery } from './ProfileGallery'
import { ProfileSidebar } from './ProfileSidebar'
import { ProfileRecentActivity } from './ProfileRecentActivity'
import { useFollow } from '@/hooks/useFollow'

export function ProfileLayout({
  profile,
  userId,
  isOwnProfile,
  stats,
  activity,
}: {
  profile: any
  userId?: string
  isOwnProfile?: boolean
  stats?: any
  activity?: any
}) {

  const [activeTab, setActiveTab] = useState<'about' | 'experience' | 'education' | 'gallery'>('about')

  const {
    state: followState,
    loading: followLoading,
    follow,
    unfollow,
  } = useFollow(userId || '')

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="max-w-6xl mx-auto">

        <ProfileHeader
          profileData={profile}
          connectState={followState}
          loading={followLoading}
          onConnect={() => {
            if (followState === 'connected') {
              unfollow()
            } else {
              follow()
            }
          }}
          userId={userId || ''}
          isOwnProfile={!!isOwnProfile}
        />

        <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        <div className="grid grid-cols-3 gap-6 mt-6">

          <div className="col-span-2 space-y-6">
            {activeTab === 'about' && (
              <>
                <ProfileAbout profile={profile} />
                {userId && <ProfileRecentActivity userId={userId} activity={activity} />}
              </>
            )}
            {activeTab === 'experience' && <ProfileExperience experiences={profile?.experience} />}
            {activeTab === 'education' && <ProfileEducation educations={profile?.education} />}
            {activeTab === 'gallery' && <ProfileGallery />}
          </div>

          <ProfileSidebar profile={profile} userId={userId} statsProp={stats} />

        </div>
      </div>
    </div>
  )
}