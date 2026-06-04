'use client'

import {
  AlertTriangle,
  Ban,
  EyeOff,
  ShieldCheck,
  Trash2,
  Loader2,
} from 'lucide-react'

type Props = {
  user: any
  actionLoading: string | null

  onWarn: () => void
  onBanToggle: () => void
  onShadowBanToggle: () => void
  onVerifyToggle?: () => void
  onDelete: () => void
}

export default function AdminUserActionBar({
  user,
  actionLoading,
  onWarn,
  onBanToggle,
  onShadowBanToggle,
  onVerifyToggle,
  onDelete,
}: Props) {
  const banned = !!user?.is_banned
  const shadowBanned =
    !!user?.is_shadow_banned || !!user?.isShadowBanned

  return (
    <div className="bg-white rounded-2xl border shadow-sm p-6">
      {/* Header */}
      <div className="flex flex-col gap-4">

        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Moderation Actions
          </h2>
          <p className="text-sm text-gray-500">
            Manage user account visibility and platform access
          </p>
        </div>

        {/* Status Pills */}
        <div className="flex flex-wrap gap-2">

          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              banned
                ? 'bg-red-100 text-red-700'
                : 'bg-green-100 text-green-700'
            }`}
          >
            {banned ? 'Banned' : 'Active'}
          </span>

          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              shadowBanned
                ? 'bg-amber-100 text-amber-700'
                : 'bg-blue-100 text-blue-700'
            }`}
          >
            {shadowBanned ? 'Shadow Banned' : 'Visible'}
          </span>

          <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
            Warnings: {Number(user?.warning_count || 0)}
          </span>

          {user?.is_verified && (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
              Verified
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 pt-2">

          <button
            onClick={onWarn}
            disabled={actionLoading === 'warn'}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border bg-yellow-50 text-yellow-700 hover:bg-yellow-100 transition"
          >
            {actionLoading === 'warn' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <AlertTriangle className="w-4 h-4" />
            )}
            Warn User
          </button>

          <button
            onClick={onBanToggle}
            disabled={actionLoading === 'ban'}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition ${
              banned
                ? 'bg-green-50 text-green-700 hover:bg-green-100'
                : 'bg-red-50 text-red-700 hover:bg-red-100'
            }`}
          >
            {actionLoading === 'ban' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Ban className="w-4 h-4" />
            )}

            {banned ? 'Unban User' : 'Ban User'}
          </button>

          <button
            onClick={onShadowBanToggle}
            disabled={actionLoading === 'shadow'}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border transition ${
              shadowBanned
                ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            {actionLoading === 'shadow' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <EyeOff className="w-4 h-4" />
            )}

            {shadowBanned
              ? 'Remove Shadow Ban'
              : 'Shadow Ban'}
          </button>

          {onVerifyToggle && (
            <button
              onClick={onVerifyToggle}
              disabled={actionLoading === 'verify'}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition"
            >
              {actionLoading === 'verify' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ShieldCheck className="w-4 h-4" />
              )}

              {user?.is_verified
                ? 'Remove Verification'
                : 'Verify User'}
            </button>
          )}

          <button
            onClick={onDelete}
            disabled={actionLoading === 'delete'}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border bg-red-600 text-white hover:bg-red-700 transition"
          >
            {actionLoading === 'delete' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}

            Delete User
          </button>

        </div>
      </div>
    </div>
  )
}