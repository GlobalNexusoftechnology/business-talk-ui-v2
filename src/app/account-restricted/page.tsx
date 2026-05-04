'use client'

import { useRouter } from 'next/navigation'
import { ShieldAlert, LogOut } from 'lucide-react'
import apiClient from '@/lib/api-client'

export default function AccountRestrictedPage() {
  const router = useRouter()

  const handleGoToLogin = async () => {
    try {
      await apiClient.logout()
    } catch {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user')
      }
      router.replace('/login')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#F8F9FA' }}>
      <div className="w-full max-w-md rounded-2xl border bg-white shadow-sm p-8 text-center" style={{ borderColor: '#E8E8E8' }}>
        <div className="mx-auto w-14 h-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-4">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-semibold mb-2" style={{ color: '#212529' }}>
          Account Restricted
        </h1>
        <p className="text-sm mb-6" style={{ color: '#5F6368' }}>
          Your account access is restricted. Please contact support if you believe this is a mistake.
        </p>
        <button
          onClick={handleGoToLogin}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg"
          style={{ backgroundColor: '#212529', color: '#FFFFFF' }}
        >
          <LogOut className="w-4 h-4" />
          Go to Login
        </button>
      </div>
    </div>
  )
}
