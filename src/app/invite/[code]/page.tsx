'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import apiClient from '@/lib/api-client'

type InviteState = 'joining' | 'success' | 'error'

const getErrorMessage = (error: any) => {
  const status = error?.response?.status
  const message = String(error?.response?.data?.message || '').toLowerCase()

  if (status === 401) return 'Please log in to accept this invite.'
  if (status === 404) return 'This invite link is invalid.'
  if (status === 410) return 'This invite link has expired.'
  if (status === 409 || message.includes('already a member')) {
    return 'You are already a member of this group.'
  }
  if (status === 400 && message.includes('usage limit')) {
    return 'This invite link has reached its usage limit.'
  }

  return error?.response?.data?.message || 'Unable to join via invite link. Please try again.'
}

export default function InviteJoinPage() {
  const router = useRouter()
  const params = useParams()

  const inviteCode = useMemo(() => {
    const value = params?.code
    return Array.isArray(value) ? value[0] : value
  }, [params])

  const [state, setState] = useState<InviteState>('joining')
  const [message, setMessage] = useState('Joining group using invite link...')

  useEffect(() => {
    const joinWithInvite = async () => {
      if (!inviteCode) {
        setState('error')
        setMessage('Invite code is missing from this link.')
        return
      }

      try {
        setState('joining')
        setMessage('Joining group using invite link...')
        await apiClient.joinGroupByInviteCode(inviteCode)
        setState('success')
        setMessage('You joined the group successfully.')
      } catch (error: any) {
        const friendlyMessage = getErrorMessage(error)
        setState('error')
        setMessage(friendlyMessage)
      }
    }

    joinWithInvite()
  }, [inviteCode])

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#F8F9FA' }}>
      <div className="w-full max-w-md bg-white rounded-2xl border p-6" style={{ borderColor: '#E8E8E8' }}>
        <h1 className="text-2xl font-semibold mb-2" style={{ color: '#212529' }}>
          Group Invite
        </h1>

        <p
          className="text-sm mb-6"
          style={{
            color:
              state === 'success'
                ? '#166534'
                : state === 'error'
                ? '#991B1B'
                : '#5F6368',
          }}
        >
          {message}
        </p>

        <div className="flex flex-col gap-3">
          {state === 'success' && (
            <button
              onClick={() => router.push('/groups')}
              className="w-full px-4 py-2.5 rounded-lg font-medium"
              style={{ backgroundColor: '#212529', color: '#FFFFFF' }}
            >
              Go to Groups
            </button>
          )}

          {state === 'error' && (
            <>
              <button
                onClick={() => router.push('/login')}
                className="w-full px-4 py-2.5 rounded-lg font-medium border"
                style={{ borderColor: '#212529', color: '#212529', backgroundColor: '#FFFFFF' }}
              >
                Go to Login
              </button>
              <button
                onClick={() => router.push('/groups')}
                className="w-full px-4 py-2.5 rounded-lg font-medium"
                style={{ backgroundColor: '#F1F3F5', color: '#212529' }}
              >
                Back to Groups
              </button>
            </>
          )}

          {state === 'joining' && (
            <div className="w-full px-4 py-2.5 rounded-lg text-center text-sm" style={{ backgroundColor: '#F1F3F5', color: '#5F6368' }}>
              Please wait...
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
