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
  async (credentials: LoginRequest, { rejectWithValue }: any) => {
    try {
      const response = await apiClient.login(
        credentials.email,
        credentials.password
      )

      const { user } = response.data

      // ✅ Store only user
      localStorage.setItem('user', JSON.stringify(user))

      return { user }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Login failed')
    }
  }
)

export const signup = createAsyncThunk(
  'auth/signup',
  async (data: SignupRequest, { rejectWithValue }: any) => {
    try {
      const response = await apiClient.signup(
        data.email,
        data.username,
        data.password,
        data.phone_number
      )

      const user = response.data

      localStorage.setItem('user', JSON.stringify(user))

      return { user }
    } catch (error: any) {
      return rejectWithValue(error.message || 'Signup failed')
    }
  }
)

export const completeProfile = createAsyncThunk(
  'auth/completeProfile',
  async (data: CompleteProfileRequest, { rejectWithValue }: any) => {
    try {
      const response = await apiClient.completeProfile(data)
      const user = response.data

      localStorage.setItem('user', JSON.stringify(user))

      return user
    } catch (error: any) {
      return rejectWithValue(error.message || 'Profile completion failed')
    }
  }
)

export const logout = createAsyncThunk(
  'auth/logout',
  async (_: void, { rejectWithValue }: any) => {
    try {
      await apiClient.logout() // ✅ clears cookies via backend

      localStorage.removeItem('user')

      return null
    } catch (error: any) {
      return rejectWithValue(error.message)
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
  },
})

export const { setUser, clearError } = authSlice.actions
export default authSlice.reducer