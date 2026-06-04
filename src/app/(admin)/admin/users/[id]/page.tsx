'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AlertTriangle, Ban, EyeOff, ShieldCheck, Trash2, UserRoundCheck, ArrowLeft } from 'lucide-react'
import adminApi from '@/lib/admin-api'
import apiClient from '@/lib/api-client'
import { ProfileLayout } from '@/app/(user)/profile/components/ProfileLayout'
import { useAppSelector } from '@/hooks/useRedux'
import AdminUserActionBar from '@/components/admin/AdminUserActionBar'

type UserProfile = {
  id: string
  full_name?: string
  username?: string
  email?: string
  profession?: string
  company?: string
  location?: string
  bio?: string
  about?: string
  short_bio?: string
  phone_number?: string
  experience?: any
  education?: any
  profile_photo?: string
  cover_image?: string
  warning_count?: number
  is_banned?: boolean
  is_shadow_banned?: boolean
  isShadowBanned?: boolean
}

const isUserBanned = (u: UserProfile | null) => Boolean(u?.is_banned)

const isUserShadowBanned = (u: UserProfile | null) =>
  Boolean(u?.is_shadow_banned || u?.isShadowBanned)

export default function AdminUserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const userId = String(params?.id || '')

  const [user, setUser] = useState<UserProfile | null>(null)
  // const [stats, setStats] = useState<any>(null)
  // const [activity, setActivity] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const currentUserId = useAppSelector((state) => String(state.auth?.user?.id || ''))
  const isOwnProfile = currentUserId !== '' && currentUserId === String(userId)

  const loadUser = async () => {
    if (!userId) return

    try {
      setError(null)
      setLoading(true)
      const [profileRes ] =
      await Promise.allSettled([
        apiClient.getUserById(userId),
        // apiClient.getUserStats(userId),
        // apiClient.getUserActivity(),
        // apiClient.getUserActivity(userId),
      ])

      const profileData =
        profileRes.status === 'fulfilled'
          ? profileRes.value?.data
          : null

      // const statsData =
      //   statsRes.status === 'fulfilled'
      //     ? statsRes.value?.data
      //     : null

      // const activityData =
      //   activityRes.status === 'fulfilled'
      //     ? activityRes.value?.data
      //     : null

      // setStats(statsData)
      // setActivity(activityData)

      if (!profileData) {
        setError('Unable to load user profile.')
        setUser(null)
        return
      }

      setUser({
        ...profileData,
        warning_count: Number(
          profileData.warning_count ?? 0
        ),
        is_banned: Boolean(profileData.is_banned),
        is_shadow_banned: Boolean(
          profileData.is_shadow_banned ??
            profileData.isShadowBanned
        ),
      })
    } catch {
      setError('Unable to load user profile.')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  // const displayName = useMemo(() => {
  //   if (!user) return 'Unknown User'
  //   return user.full_name || user.username || 'Unknown User'
  // }, [user])

  const runAction = async (key: string, task: () => Promise<any>) => {
    try {
      setActionLoading(key)
      await task()
      await loadUser()
    } catch {
      setError('Action failed. Please try again.')
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return <div className="p-6">Loading user module...</div>
  }

  if (!user) {
    return (
      <div className="space-y-4 p-6">
        <button
          onClick={() => router.push('/admin/users')}
          className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-lg border"
        >
          <ArrowLeft className="w-4 h-4" /> Back to users
        </button>
        <div className="rounded-xl border p-4 bg-red-50 text-red-700">{error || 'User not found.'}</div>
      </div>
    )
  }

  const profileData = {
    ...user,

    name:
      user.full_name ||
      user.username,

    avatar:
      user.profile_photo,

    title:
      user.profession,

    about:
      user.about ||
      user.short_bio ||
      user.bio,

    phone_number:
      user.phone_number,

    experience:
      user.experience,

    education:
      user.education,
  }

  const banned = isUserBanned(user)
  const shadowBanned = isUserShadowBanned(user)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push('/admin/users')}
          className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-lg border bg-white"
        >
          <ArrowLeft className="w-4 h-4" /> Back to users
        </button>
      </div>

      {error && (
        <div className="rounded-xl border p-3 bg-red-50 text-red-700">
          {error}
        </div>
      )}

      <AdminUserActionBar
        user={user}
        actionLoading={actionLoading}
        onWarn={() =>
          runAction('warn', () =>
            adminApi.warnUser(user.id)
          )
        }
        onBanToggle={() =>
          runAction(
            'ban-toggle',
            () =>
              banned
                ? adminApi.unbanUser(user.id)
                : adminApi.banUser(user.id)
          )
        }
        onShadowBanToggle={() =>
          runAction(
            'shadow-toggle',
            () =>
              shadowBanned
                ? adminApi.unshadowBanUser(user.id)
                : adminApi.shadowBanUser(user.id)
          )
        }
        onDelete={() =>
          runAction('delete', async () => {
            if (
              !window.confirm(
                'Delete this user permanently?'
              )
            )
              return

            await apiClient.deleteUserById(
              user.id
            )

            router.push('/admin/users')
          })
        }
      />

      <ProfileLayout
        profile={profileData}
        userId={userId}
        isOwnProfile={isOwnProfile}
        // stats={stats}
        // activity={activity}
      />

      {error && (
        <div className="rounded-xl border p-3 bg-red-50 text-red-700">{error}</div>
      )}

      <div className="bg-white rounded-2xl border shadow-sm p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Moderation Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => runAction('warn', () => adminApi.warnUser(user.id))}
            disabled={actionLoading !== null}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-yellow-500 text-yellow-700 disabled:opacity-60"
          >
            <AlertTriangle className="w-4 h-4" />
            Warn User
          </button>

          <button
            onClick={() =>
              runAction('ban-toggle', () =>
                banned ? adminApi.unbanUser(user.id) : adminApi.banUser(user.id)
              )
            }
            disabled={actionLoading !== null}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-red-600 text-red-700 disabled:opacity-60"
          >
            {banned ? <UserRoundCheck className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
            {banned ? 'Unban User' : 'Ban User'}
          </button>

          <button
            onClick={() =>
              runAction('shadow-toggle', () =>
                shadowBanned
                  ? adminApi.unshadowBanUser(user.id)
                  : adminApi.shadowBanUser(user.id)
              )
            }
            disabled={actionLoading !== null}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-700 text-gray-700 disabled:opacity-60"
          >
            {shadowBanned ? <ShieldCheck className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            {shadowBanned ? 'Unshadow Ban' : 'Shadow Ban'}
          </button>

          <button
            onClick={() =>
              runAction('delete', async () => {
                if (!window.confirm('Delete this user permanently?')) return
                await apiClient.deleteUserById(user.id)
                router.push('/admin/users')
              })
            }
            disabled={actionLoading !== null}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-red-700 text-red-800 disabled:opacity-60"
          >
            <Trash2 className="w-4 h-4" /> Delete User
          </button>
        </div>
      </div>
    </div>
  )
}
