'use client'

import { MapPin, Briefcase } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import apiClient from '@/lib/api-client'

export interface ProfileHeaderProps {
  profileData: any;
  connectState: 'connect' | 'pending' | 'connected';
  loading: boolean;
  onConnect: () => void;

  userId: string;
  isOwnProfile: boolean;
}

export function ProfileHeader({
  profileData,
  connectState,
  loading,
  onConnect,
  userId,
  isOwnProfile
}: ProfileHeaderProps) {

  const router = useRouter()
  const [messagingLoading, setMessagingLoading] = useState(false)

  const handleMessage = async () => {
    if (messagingLoading) return
    try {
      setMessagingLoading(true)
      const conv = await apiClient.getOrCreateConversation(userId)
      router.push(`/messages?conversationId=${conv.id}`)
    } catch (err) {
      console.error('Open chat error', err)
    } finally {
      setMessagingLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6 border">

      {/* COVER */}
      <div className="relative">
        <img
          src={profileData.cover_image || `https://ui-avatars.com/api/name=${encodeURIComponent(profileData.name || profileData.username || 'User')}`}
          alt="Cover"
          className="w-full h-28 sm:h-40 md:h-48 object-cover"
        />
      </div>

      <div className="px-4 sm:px-6 pb-5 sm:pb-6">

        <div className="flex flex-wrap items-end gap-3 sm:gap-6 -mt-10 sm:-mt-14 md:-mt-16">

          {/* AVATAR */}
          <img
            src={profileData.avatar || `https://ui-avatars.com/api/name=${encodeURIComponent(profileData.name || profileData.username || 'User')}`}
            alt="Avatar"
            className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full border-4 border-white shadow-lg object-cover z-10 bg-white"
          />

          <div className="flex-1 min-w-0 mt-10 sm:mt-12 md:mt-16">
            <h1 className="text-xl sm:text-2xl font-semibold truncate">{profileData.name}</h1>
            <p className="text-gray-500 text-sm sm:text-base truncate">{profileData.title}</p>

            <div className="flex flex-wrap gap-3 text-xs sm:text-sm text-gray-400 mt-2">
              <span className="flex gap-1 items-center">
                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                {profileData.location || 'N/A'}
              </span>

              <span className="flex gap-1 items-center">
                <Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                {profileData.company || 'N/A'}
              </span>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          {!isOwnProfile && (
            <div className="flex gap-2 sm:gap-3 mt-3 sm:mt-4 w-full sm:w-auto">

              {/* CONNECT */}
              <button
                onClick={onConnect}
                disabled={connectState !== 'connect' || loading}
                className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all duration-200 active:scale-95
                  ${connectState === 'connected'
                    ? 'border-green-500 text-green-700 cursor-default'
                    : connectState === 'pending'
                    ? 'border-yellow-400 text-yellow-700 cursor-default'
                    : loading
                    ? 'border-[#212529] bg-[#212529] text-white opacity-70 cursor-not-allowed'
                    : 'border-[#212529] text-[#212529]'
                  }`}
                style={{
                  backgroundColor:
                    connectState === 'connected' ? '#F0FDF4'
                    : connectState === 'pending' ? '#FEFCE8'
                    : loading ? '#212529'
                    : 'transparent',
                }}
                onMouseEnter={(e) => {
                  if (connectState === 'connect' && !loading) {
                    e.currentTarget.style.backgroundColor = '#F8F9FA'
                  }
                }}
                onMouseLeave={(e) => {
                  if (connectState === 'connect' && !loading) {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }
                }}
              >
                {loading && connectState === 'connect' ? 'Connecting...' : null}
                {!loading && connectState === 'connect' ? 'Connect' : null}
                {connectState === 'pending' ? 'Pending' : null}
                {connectState === 'connected' ? 'Connected' : null}
              </button>

              {/* MESSAGE */}
              <button
                onClick={handleMessage}
                disabled={messagingLoading}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-[#212529] text-[#212529] transition-all duration-200 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ backgroundColor: 'transparent' }}
                onMouseEnter={(e) => { if (!messagingLoading) e.currentTarget.style.backgroundColor = '#F8F9FA' }}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                {messagingLoading ? 'Opening chat...' : 'Message'}
              </button>

            </div>
          )}

        </div>
      </div>
    </div>
  )
}