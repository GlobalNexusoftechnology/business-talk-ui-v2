'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { KeyRound, ArrowLeft, CheckCircle, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { Card } from '@/components/shared/Card'
import { Button } from '@/components/shared/Button'
import apiClient from '@/lib/api-client'

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token. Please request a new password reset link.')
    }
  }, [token])

  const passwordStrength = (pw: string) => {
    if (pw.length === 0) return null
    let score = 0
    if (pw.length >= 8) score++
    if (/[A-Z]/.test(pw)) score++
    if (/[0-9]/.test(pw)) score++
    if (/[^A-Za-z0-9]/.test(pw)) score++
    if (score <= 1) return { label: 'Weak', color: 'bg-red-500', width: 'w-1/4' }
    if (score === 2) return { label: 'Fair', color: 'bg-yellow-500', width: 'w-2/4' }
    if (score === 3) return { label: 'Good', color: 'bg-blue-500', width: 'w-3/4' }
    return { label: 'Strong', color: 'bg-green-500', width: 'w-full' }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) { setError('Invalid or missing reset token.'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return }
    if (password !== confirmPassword) { setError('Passwords do not match'); return }

    setLoading(true)
    setError(null)
    try {
      await apiClient.resetPassword(token, password)
      setSuccess(true)
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        err?.message ||
        'Failed to reset password. The link may have expired — please request a new one.'
      )
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Card>
        <div className="text-center py-4">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-secondary-900 mb-2">Password reset!</h1>
          <p className="text-secondary-600 mb-8">
            Your password has been reset successfully. You can now sign in with your new password.
          </p>
          <Button variant="accent" fullWidth onClick={() => router.push('/login')}>
            Sign in
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <div className="mb-8">
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center">
            <KeyRound className="w-7 h-7 text-primary-600" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-secondary-900 mb-2 text-center">Set new password</h1>
        <p className="text-secondary-600 text-center text-sm">
          Must be at least 8 characters long.
        </p>
      </div>

      {!token ? (
        <div className="space-y-5">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>Invalid or missing reset token. Please request a new password reset link.</span>
          </div>
          <Link
            href="/forgot-password"
            className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors"
          >
            Request new link
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* New password */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 pr-10 rounded-lg border border-secondary-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-secondary-900 placeholder-secondary-400 bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {/* Strength indicator */}
            {password && (() => {
              const s = passwordStrength(password)
              if (!s) return null
              return (
                <div className="mt-2">
                  <div className="h-1.5 w-full bg-secondary-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${s.color} ${s.width}`} />
                  </div>
                  <p className={`text-xs mt-1 font-medium ${
                    s.label === 'Weak' ? 'text-red-500' :
                    s.label === 'Fair' ? 'text-yellow-600' :
                    s.label === 'Good' ? 'text-blue-600' : 'text-green-600'
                  }`}>{s.label}</p>
                </div>
              )
            })()}
          </div>

          {/* Confirm password */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 pr-10 rounded-lg border border-secondary-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-secondary-900 placeholder-secondary-400 bg-white"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400 hover:text-secondary-600 transition-colors"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirmPassword && password !== confirmPassword && (
              <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
            )}
            {confirmPassword && password === confirmPassword && confirmPassword.length > 0 && (
              <p className="text-xs text-green-600 mt-1">Passwords match</p>
            )}
          </div>

          <Button type="submit" fullWidth isLoading={loading} variant="accent">
            Reset Password
          </Button>
        </form>
      )}

      <div className="mt-6 text-center">
        <Link
          href="/login"
          className="flex items-center justify-center gap-2 text-sm text-secondary-600 hover:text-secondary-900 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to sign in
        </Link>
      </div>
    </Card>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <Card>
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </Card>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
