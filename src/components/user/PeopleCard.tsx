import Link from 'next/link'
import {
  MapPin,
} from 'lucide-react'
import { useFollow } from '@/hooks/useFollow'
import { useAppSelector } from '@/hooks/useRedux'

export default function PeopleCard({ user }: { user: any }) {
  const currentUserId = useAppSelector((state) => String(state.auth?.user?.id || ''))
  const {
    state: followState,
    loading: followLoading,
    follow,
    unfollow,
    isHydrated,
  } = useFollow(String(user.id || ''))

  const isSelf = currentUserId === String(user.id || '')

  const handleConnect = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (isSelf || followLoading || !isHydrated) return

    if (followState === 'connected') {
      await unfollow()
      return
    }

    if (followState === 'connect') {
      await follow()
    }
  }

  const buttonLabel =
    !isHydrated ? 'Loading...' :
    followState === 'connected' ? 'Connected' :
    followState === 'pending' || followLoading ? 'Connecting...' :
    'Connect'

  return (
    <Link
      href={`/profile/${user.id}`}
      className="block group"
    >
      <div className="bg-white rounded-2xl border p-6 transition hover:shadow-md hover:scale-[1.02]">

        {/* Avatar */}
        <div className="flex flex-col items-center text-center mb-4">
          <img
            src={user.profile_photo || `https://ui-avatars.com/api/name=${encodeURIComponent(user.full_name || 'User')}`}
            alt={user.full_name || 'User Avatar'}
            className="w-20 h-20 rounded-full object-cover mb-3 border"
          />

          <h3 className="font-semibold text-lg">
            {user.full_name}
          </h3>

          <p className="text-sm text-gray-500">
            {user.profession || 'Professional'}
          </p>

          {Number(user.mutual_count || 0) > 0 && (
            <div className="mt-2 text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-600">
              {user.mutual_count} mutual connection{user.mutual_count > 1 ? 's' : ''}
            </div>
          )}

          {user.same_industry && (
            <div className="mt-2 text-xs px-2 py-1 rounded-full bg-purple-50 text-purple-600">
              In your industry
            </div>
          )}

          <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
            <MapPin className="w-3 h-3" />
            <span>{user.location || 'India'}</span>
          </div>
        </div>

        {/* Company */}
        {user.company && (
          <div className="text-center text-xs text-gray-500 mb-3">
            {user.company}
          </div>
        )}

        {/* Skills */}
        {user.skills && (
          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {(Array.isArray(user.skills)
              ? user.skills
              : typeof user.skills === 'string'
              ? user.skills.split(',')
              : []
            )
              .slice(0, 3)
              .map((skill: string, i: number) => (
                <span
                  key={i}
                  className="px-3 py-1 text-xs rounded-full bg-[#F8F9FA]"
                >
                  {skill.trim()}
                </span>
              ))}
          </div>
        )}

        {/* Connect Button */}
        <button
          onClick={handleConnect}
          disabled={isSelf || !isHydrated || followLoading || followState === 'pending'}
          className={`w-full px-3 py-2 text-xs font-medium rounded-lg 
            transition-all duration-200 flex-shrink-0 border active:scale-95 
            ${followState === 'connected'
              ? 'border-green-500 text-green-700 bg-green-50 cursor-default'
              : 'border-[#212529] text-[#212529]'
            }
            ${isSelf || !isHydrated || followLoading || followState === 'pending'
              ? 'opacity-70 cursor-not-allowed'
              : ''
            }`}
          onMouseEnter={(e) => {
            if (followState === 'connect' && !followLoading && isHydrated && !isSelf) {
              e.currentTarget.style.backgroundColor = '#F8F9FA'
            }
          }}
          onMouseLeave={(e) => {
            if (followState === 'connect') {
              e.currentTarget.style.backgroundColor = 'transparent'
            }
          }}
        >
          {isSelf ? 'You' : buttonLabel}
        </button>

      </div>
    </Link>
  )
}