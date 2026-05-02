'use client'

import { MapPin, Briefcase } from 'lucide-react'
import { useRouter } from 'next/navigation'
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

  const handleMessage = async () => {
    try {
      const res = await apiClient.startConversation([userId]) // Start conversation with the profile user

      const conversation = res.data

      router.push(`/messages?conversationId=${conversation.id}`)

    } catch (err) {
      console.error('Start chat error', err)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6 border">

      {/* COVER */}
      <div className="relative">
        <img
          src={profileData.cover_image || 'https://images.unsplash.com/photo-1497366216548-37526070297c'}
          alt="Cover"
          className="w-full h-48 object-cover"
        />
      </div>

      <div className="px-6 pb-6">

        <div className="flex items-end gap-6 -mt-16">

          {/* AVATAR */}
          <img
            src={profileData.avatar || `https://ui-avatars.com/api/name=${encodeURIComponent(profileData.name || 'User')}`}
            alt="Avatar"
            className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover z-10 bg-white"
          />

          <div className="flex-1 mt-16">
            <h1 className="text-2xl font-semibold">{profileData.name}</h1>
            <p className="text-gray-500">{profileData.title}</p>

            <div className="flex gap-4 text-sm text-gray-400 mt-2">
              <span className="flex gap-1 items-center">
                <MapPin className="w-4 h-4" />
                {profileData.location || 'N/A'}
              </span>

              <span className="flex gap-1 items-center">
                <Briefcase className="w-4 h-4" />
                {profileData.company || 'N/A'}
              </span>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          {!isOwnProfile && (
            <div className="flex gap-3 mt-4">

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
                className="px-4 py-2 text-sm font-medium rounded-lg border border-[#212529] text-[#212529] transition-all duration-200 active:scale-95"
                style={{ backgroundColor: 'transparent' }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F8F9FA')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                Message
              </button>

            </div>
          )}

        </div>
      </div>
    </div>
  )
}