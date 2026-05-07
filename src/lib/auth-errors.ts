/**
 * Centralized auth error handler.
 *
 * Maps backend/API error responses into safe, user-friendly strings.
 * Raw backend stack traces, field names, and internal codes never reach the UI.
 */

// Known backend error strings → friendly UI messages
const BACKEND_ERROR_MAP: Record<string, string> = {
  // Login
  'invalid credentials': 'Incorrect email or password. Please try again.',
  'invalid credential': 'Incorrect email or password. Please try again.',
  'user not found': 'No account found with that email address.',
  'password incorrect': 'Incorrect email or password. Please try again.',
  'invalid password': 'Incorrect email or password. Please try again.',
  'account not found': 'No account found with that email address.',
  'invalid email or password': 'Incorrect email or password. Please try again.',
  'unauthorized': 'Incorrect email or password. Please try again.',

  // Signup
  'user already exists': 'An account with this email already exists.',
  'email already in use': 'This email address is already registered.',
  'username already taken': 'This username is already taken. Please choose another.',
  'username already exists': 'This username is already taken. Please choose another.',
  'duplicate username': 'This username is already taken. Please choose another.',
  'users_username_key': 'This username is already taken. Please choose another.',
  'duplicate key value violates unique constraint': 'This username is already taken. Please choose another.',
  'already exists': 'This username is already taken. Please choose another.',
  'email already exists': 'An account with this email already exists.',
  'userexist': 'An account with this email already exists.',

  // Tokens / session
  'token expired': 'Your session has expired. Please sign in again.',
  'invalid token': 'This link is invalid or has expired. Please request a new one.',
  'token invalid': 'This link is invalid or has expired. Please request a new one.',
  'expired token': 'Your reset link has expired. Please request a new one.',
  'jwt expired': 'Your session has expired. Please sign in again.',
  'jwt malformed': 'Invalid session. Please sign in again.',

  // Account status
  'account is banned': 'Your account has been suspended. Please contact support.',
  'account banned': 'Your account has been suspended. Please contact support.',
  'account restricted': 'Your account is restricted. Please contact support.',
  'account not verified': 'Please verify your email before signing in.',
  'email not verified': 'Please verify your email before signing in.',

  // Password reset
  'reset token expired': 'Your password reset link has expired. Please request a new one.',
  'reset token invalid': 'This reset link is invalid. Please request a new one.',

  // Rate limiting
  'too many requests': 'Too many attempts. Please wait a few minutes and try again.',
  'rate limit exceeded': 'Too many attempts. Please wait a few minutes and try again.',

  // Network / server
  'network error': 'Connection failed. Please check your internet connection.',
  'internal server error': 'Something went wrong. Please try again.',
  'service unavailable': 'The service is temporarily unavailable. Please try again shortly.',
}

// HTTP status code fallbacks
const STATUS_MESSAGE_MAP: Record<number, string> = {
  400: 'The request was invalid. Please check your details and try again.',
  401: 'Incorrect email or password. Please try again.',
  403: 'You do not have permission to perform this action.',
  404: 'No account found with that email address.',
  409: 'An account with this information already exists.',
  422: 'Please check your details and try again.',
  423: 'Your account has been suspended. Please contact support.',
  429: 'Too many attempts. Please wait a few minutes and try again.',
  500: 'Something went wrong on our end. Please try again.',
  502: 'Service temporarily unavailable. Please try again shortly.',
  503: 'Service temporarily unavailable. Please try again shortly.',
}

type ExtractedAuthError = {
  status?: number
  message: string
  code?: string
}

const toSafeLower = (value: unknown): string =>
  String(value ?? '').toLowerCase().trim()

const parseStatusFromText = (text: string): number | undefined => {
  const match = text.match(/\b(\d{3})\b/)
  if (!match) return undefined
  const code = Number(match[1])
  return Number.isFinite(code) ? code : undefined
}

const extractAuthError = (err: unknown): ExtractedAuthError => {
  if (!err) return { message: '' }

  // String payloads from rejectWithValue(...)
  if (typeof err === 'string') {
    return {
      status: parseStatusFromText(err),
      message: toSafeLower(err),
    }
  }

  const e = err as any

  // Axios-style first
  const responseStatus =
    e?.response?.status ??
    e?.response?.data?.statusCode ??
    e?.status ??
    e?.statusCode

  const rawMessage =
    e?.response?.data?.message ??
    e?.response?.data?.error ??
    e?.response?.data?.detail ??
    e?.message ??
    e?.error ??
    ''

  // message can itself be object/array sometimes
  const normalizedMessage =
    typeof rawMessage === 'string'
      ? rawMessage
      : JSON.stringify(rawMessage)

  return {
    status: Number.isFinite(Number(responseStatus)) ? Number(responseStatus) : parseStatusFromText(String(normalizedMessage)),
    message: toSafeLower(normalizedMessage),
    code: toSafeLower(e?.code),
  }
}

/**
 * Converts any error (Axios, native Error, string) into a
 * safe, user-friendly message. Never exposes raw stack traces or
 * internal backend messages.
 *
 * @param err     The caught error value
 * @param context Optional context label for specific fallback copy
 * @returns       User-safe string
 */
export function mapAuthError(
  err: unknown,
  context: 'login' | 'signup' | 'forgot-password' | 'reset-password' | 'google' | 'general' = 'general',
): string {
  const fallbacks: Record<typeof context, string> = {
    login: 'Sign in failed. Please check your details and try again.',
    signup: 'Sign up failed. Please check your details and try again.',
    'forgot-password': 'Failed to send reset email. Please try again.',
    'reset-password': 'Failed to reset password. The link may have expired — please request a new one.',
    google: 'Google sign-in failed. Please try again.',
    general: 'Something went wrong. Please try again.',
  }

  if (!err) return fallbacks[context]

  const { status, message: backendMsg, code } = extractAuthError(err)

  // Signup-specific DB constraint normalization.
  // Covers postgres-style unique/constraint messages where backend doesn't provide clean text.
  if (context === 'signup' && backendMsg) {
    const looksLikeUsernameConstraint =
      (backendMsg.includes('username') &&
        (backendMsg.includes('constraint') ||
          backendMsg.includes('duplicate') ||
          backendMsg.includes('already exists') ||
          backendMsg.includes('already taken'))) ||
      backendMsg.includes('users_username_key')

    if (looksLikeUsernameConstraint) {
      return 'This username is already taken. Please choose another.'
    }

    // Some environments return only a raw DB constraint string without the
    // field name. Keep this signup-only to avoid mis-mapping other contexts.
    const looksLikeRawUsersConstraint =
      backendMsg.includes('insert or update on table') &&
      backendMsg.includes('users') &&
      backendMsg.includes('violates') &&
      backendMsg.includes('constraint')

    if (looksLikeRawUsersConstraint) {
      return 'This username is already taken. Please choose another.'
    }
  }

  // Try exact match first, then prefix/substring match
  if (backendMsg) {
    for (const [key, friendly] of Object.entries(BACKEND_ERROR_MAP)) {
      if (backendMsg.includes(key)) return friendly
    }
  }

  // HTTP status fallback
  if (status && STATUS_MESSAGE_MAP[status]) {
    return STATUS_MESSAGE_MAP[status]
  }

  // Native network error (no response at all)
  if (code === 'err_network' || code === 'econnrefused') {
    return 'Connection failed. Please check your internet connection.'
  }

  if (backendMsg.includes('failed to fetch') || backendMsg.includes('network')) {
    return 'Connection failed. Please check your internet connection.'
  }

  return fallbacks[context]
}
