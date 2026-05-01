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

const initialState: AuthState = {
  user: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
}

// ✅ Load user from localStorage (cookie handles auth, not token)
if (typeof window !== 'undefined') {
  const storedUser = localStorage.getItem('user')

  if (storedUser) {
    initialState.user = JSON.parse(storedUser)
    initialState.isAuthenticated = true
  }
}

// =========================
// 🔐 AUTH THUNKS
// =========================

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginRequest, { rejectWithValue }) => {
    try {
      // 1. Login (sets cookies)
      await apiClient.login(credentials.email, credentials.password)

      // 2. Fetch user using cookie session
      const userRes = await apiClient.getMyProfileinfo()

      if (!userRes?.data) {
        throw new Error('Failed to fetch user')
      }

      // 3. Store user (optional but useful)
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(userRes.data))
      }

      return { user: userRes.data }
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
      localStorage.setItem('user', JSON.stringify(res.data))
      return res.data
    } catch (err) {
      localStorage.removeItem('user')
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
      state.user = action.payload
      state.isAuthenticated = true
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
        state.isAuthenticated = true
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
        state.isAuthenticated = true
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
      })

      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload
        state.isAuthenticated = true
      })

      .addCase(fetchCurrentUser.rejected, (state) => {
        state.user = null
        state.isAuthenticated = false
      })
  },
})

export const { setUser, clearError } = authSlice.actions
export default authSlice.reducer