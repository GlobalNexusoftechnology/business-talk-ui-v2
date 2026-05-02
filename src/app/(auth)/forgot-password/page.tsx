'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { Card } from '@/components/shared/Card'
import { Button } from '@/components/shared/Button'
import { Input } from '@/components/shared/Input'
import apiClient from '@/lib/api-client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) { setError('Please enter your email address'); return }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) { setError('Please enter a valid email address'); return }

    setLoading(true)
    setError(null)
    try {
      await apiClient.forgotPassword(email.trim())
      setSent(true)
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to send reset email. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <Card>
        <div className="text-center py-4">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-secondary-900 mb-2">Check your email</h1>
          <p className="text-secondary-600 mb-2">
            We&apos;ve sent a password reset link to
          </p>
          <p className="font-semibold text-secondary-900 mb-6">{email}</p>
          <p className="text-sm text-secondary-500 mb-8">
            Didn&apos;t receive the email? Check your spam folder, or{' '}
            <button
              type="button"
              onClick={() => { setSent(false); setError(null) }}
              className="text-primary-600 hover:text-primary-700 font-medium underline"
            >
              try again
            </button>
            .
          </p>
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

  return (
    <Card>
      <div className="mb-8">
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center">
            <Mail className="w-7 h-7 text-primary-600" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-secondary-900 mb-2 text-center">Forgot password?</h1>
        <p className="text-secondary-600 text-center text-sm">
          No worries — enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <Input
          type="email"
          label="Email Address"
          placeholder="your@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <Button type="submit" fullWidth isLoading={loading} variant="accent">
          Send Reset Link
        </Button>
      </form>

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
