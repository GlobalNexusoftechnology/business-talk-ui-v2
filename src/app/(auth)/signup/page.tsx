'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { SignupSchema, type SignupInput } from '@/lib/validations'
import { Input, PasswordInput } from '@/components/shared/Input'
import { Button } from '@/components/shared/Button'
import { Card } from '@/components/shared/Card'
import { useAppDispatch } from '@/hooks/useRedux'
import { signup } from '@/redux/slices/authSlice'
import { mapAuthError } from '@/lib/auth-errors'

export default function SignupPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const [error, setError] = useState<string | null>(null)
  const [googleLoading, setGoogleLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({
    resolver: zodResolver(SignupSchema),
  })

  const onSubmit = async (data: SignupInput) => {
    setError(null)
    try {
      const result = await dispatch(signup(data))
      if (signup.fulfilled.match(result)) {
        router.push('/complete-profile')
      } else if (signup.rejected.match(result)) {
        setError(mapAuthError(result.payload, 'signup'))
      }
    } catch (err) {
      setError(mapAuthError(err, 'signup'))
    }
  }

  const handleGoogleSignup = () => {
    if (googleLoading || isSubmitting) return
    setGoogleLoading(true)
    window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'https://localhost:4000'}/auth/google`
  }

  return (
    <div>
      <Card>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">Create Account</h1>
          <p className="text-secondary-600">Join Businesstalk24 today</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          {error && (
            <div role="alert" className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
              <span className="shrink-0 mt-0.5" aria-hidden>⚠</span>
              <span>{error}</span>
            </div>
          )}

          <Input
            {...register('email')}
            type="email"
            placeholder="your@email.com"
            label="Email Address"
            error={errors.email?.message}
            autoComplete="email"
            disabled={isSubmitting}
          />

          <Input
            {...register('username')}
            type="text"
            placeholder="username"
            label="Username"
            error={errors.username?.message}
            helpText="3-20 characters, no spaces"
            autoComplete="username"
            disabled={isSubmitting}
          />

          <PasswordInput
            {...register('password')}
            placeholder="••••••••"
            label="Password"
            error={errors.password?.message}
            helpText="At least 8 characters"
            autoComplete="new-password"
            disabled={isSubmitting}
          />

          <Input
            {...register('phone_number')}
            type="tel"
            placeholder="+1 (555) 000-0000"
            label="Phone Number (Optional)"
            error={errors.phone_number?.message}
            autoComplete="tel"
            disabled={isSubmitting}
          />

          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              {...register('terms')}
              className="mt-1 rounded border-secondary-300"
            />
            <span className="text-sm text-secondary-600">
              I agree to the{' '}
              <Link href="/user-agreement" className="text-primary-600 hover:text-primary-700 font-medium">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy-policy" className="text-primary-600 hover:text-primary-700 font-medium">
                Privacy Policy
              </Link>
            </span>
          </label>
          {errors.terms && <p className="text-sm text-red-600">{errors.terms.message}</p>}

          <Button type="submit" fullWidth isLoading={isSubmitting} variant="accent" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account…' : 'Create Account'}
          </Button>
        </form>

        {/* Google Auth Button */}
        <div className="mt-6">
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-secondary-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-secondary-600">Or sign up with</span>
            </div>
          </div>

          <button
            type="button"
            disabled={googleLoading || isSubmitting}
            onClick={handleGoogleSignup}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-secondary-300 rounded-lg hover:bg-secondary-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {googleLoading ? (
              <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
            ) : (
            <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#EA4335"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#4285F4"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#34A853"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.9 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            )}
            <span className="text-secondary-700 font-medium">
              {googleLoading ? 'Redirecting…' : 'Continue with Google'}
            </span>
          </button>
        </div>

        {/* Login Link */}
        <p className="mt-6 text-center text-secondary-600">
          Already have an account?{' '}
          <Link href="/login" className="text-accent-600 hover:text-accent-700 font-medium">
            Sign In
          </Link>
        </p>
      </Card>
    </div>
  )
}
