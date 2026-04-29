'use client'

import { useState } from 'react'
import { ProfileHeader } from './ProfileHeader'
import { ProfileTabs } from './ProfileTabs'
import { ProfileAbout } from './ProfileAbout'
import { ProfileExperience } from './ProfileExperience'
import { ProfileEducation } from './ProfileEducation'
import { ProfileGallery } from './ProfileGallery'
import { ProfileSidebar } from './ProfileSidebar'
import { useFollow } from '@/hooks/useFollow'

export function ProfileLayout({
  profile,
  userId,
  isOwnProfile
}: {
  profile: any
  userId?: string
  isOwnProfile?: boolean
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
            {activeTab === 'about' && <ProfileAbout profile={profile} />}
            {activeTab === 'experience' && <ProfileExperience />}
            {activeTab === 'education' && <ProfileEducation />}
            {activeTab === 'gallery' && <ProfileGallery />}
          </div>

          <ProfileSidebar profile={profile} />

        </div>
      </div>
    </div>
  )
}