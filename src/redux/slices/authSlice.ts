import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction, ActionReducerMapBuilder } from '@reduxjs/toolkit'
import {
  AuthState,
  User,
  LoginRequest,
  SignupRequest,
  CompleteProfileRequest,
} from '@/types'
import apiClient from '@/lib/api-client'

// Only truly banned users are blocked from auth.
// Shadow-banned users can still use the app — the backend just hides their content from others.
const isRestrictedUser = (user: any) =>
  Boolean(user?.is_banned || user?.isBanned)

const initialState: AuthState = {
  user: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
  isRestricted: false,
}

// Optional UI cache preload only. Authenticated state is determined by
// successful login/signup response or fetchCurrentUser.
if (typeof window !== 'undefined') {
  try {
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      const u = JSON.parse(storedUser)
      initialState.user = u
      initialState.isRestricted = isRestrictedUser(u)
      initialState.isAuthenticated = false
    }
  } catch {
    // Ignore malformed cache and keep defaults.
  }
}

// =========================
// 🔐 AUTH THUNKS
// =========================

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      // Login response is canonical user source for Safari-safe cookie flow.
      const loginRes = await apiClient.login(credentials.email, credentials.password)
      const loginPayload = loginRes?.data
      const user =
        loginPayload?.user ||
        loginPayload?.data?.user ||
        loginPayload?.data ||
        loginPayload?.profile ||
        null

      if (!user || typeof user !== 'object') {
        throw new Error('Login succeeded but user payload was missing')
      }

      const isBanned = Boolean((user as any)?.is_banned || (user as any)?.isBanned)

      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(user))
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('[auth] login completed', {
          hasUser: Boolean(user),
          isRestricted: isBanned,
        })
      }

      return { user, isRestricted: isBanned }
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error.message)
    }
  }
)

export const signup = createAsyncThunk(
  'auth/signup',
  async (data: SignupRequest, { rejectWithValue }) => {
    try {
      await apiClient.signup(
        data.email,
        data.username,
        data.password,
        data.phone_number
      )

      // ⚠️ Only fetch profile if backend logs user in
      let user = null

      try {
        const userRes = await apiClient.getMyProfile()
        user = userRes.data

        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(user))
        }
      } catch {
        // backend didn't login automatically → ignore
      }

      return { user }
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error.message)
    }
  }
)

export const completeProfile = createAsyncThunk(
  'auth/completeProfile',
  async (data: CompleteProfileRequest, { rejectWithValue }) => {
    try {
      const response = await apiClient.completeProfile(data)
      const user = response.data

      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(user))
      }

      return user
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error.message)
    }
  }
)

export const logout = createAsyncThunk(
  'auth/logout',
  async (_) => {
    try {
      await apiClient.logout() // clears cookies

      if (typeof window !== 'undefined') {
        localStorage.removeItem('user')
      }

      return null
    } catch (error: any) {
      // even if API fails → force logout UI
      localStorage.removeItem('user')

      return null
    }
  }
)

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }: any) => {
    try {
      const res = await apiClient.getMyProfile()

      const isBanned = Boolean(res.data?.is_banned || res.data?.isBanned)

      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(res.data))
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('[auth] hydration succeeded', {
          hasUser: Boolean(res.data),
          isRestricted: isBanned,
        })
      }

      // Return both user data and restriction status
      return { user: res.data, isRestricted: isBanned }
    } catch (err) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user')
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('[auth] hydration failed')
      }

      return rejectWithValue('Session expired')
    }
  }
)

// =========================
// 🧠 SLICE
// =========================

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state: AuthState, action: PayloadAction<User>) => {
      const u = action.payload as any
      const banned = Boolean(u?.is_banned || u?.isBanned)
      state.user = action.payload
      state.isRestricted = banned
      state.isAuthenticated = Boolean(action.payload) && !banned
    },
    clearError: (state: AuthState) => {
      state.error = null
    },
  },
  extraReducers: (builder: ActionReducerMapBuilder<AuthState>) => {
    builder
      // 🔐 Login
      .addCase(login.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<any>) => {
        state.isLoading = false
        state.user = action.payload.user
        state.isRestricted = action.payload.isRestricted ?? false
        // Restricted users can login but are NOT treated as authenticated
        state.isAuthenticated = !(action.payload.isRestricted ?? false)
      })
      .addCase(login.rejected, (state, action: PayloadAction<any>) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      // 🆕 Signup
      .addCase(signup.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(signup.fulfilled, (state, action: PayloadAction<any>) => {
        state.isLoading = false
        state.user = action.payload.user
        // Only mark authenticated if the backend actually returned a user
        state.isAuthenticated = Boolean(action.payload.user)
      })
      .addCase(signup.rejected, (state, action: PayloadAction<any>) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      // 👤 Complete Profile
      .addCase(completeProfile.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(completeProfile.fulfilled, (state, action: PayloadAction<any>) => {
        state.isLoading = false
        state.user = action.payload
      })
      .addCase(completeProfile.rejected, (state, action: PayloadAction<any>) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      // 🚪 Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null
        state.isAuthenticated = false
        state.isRestricted = false
      })

      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.isRestricted = action.payload.isRestricted ?? false
        state.isAuthenticated = !(action.payload.isRestricted ?? false) && Boolean(action.payload.user)
      })

      // The interceptor already retried the request after a token refresh.
      // If we still reach .rejected, the session is truly invalid.
      .addCase(fetchCurrentUser.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.isLoading = false
        state.user = null
        state.isAuthenticated = false
      })
  },
})

export const { setUser, clearError } = authSlice.actions
export default authSlice.reducer