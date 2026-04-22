import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction, ActionReducerMapBuilder } from '@reduxjs/toolkit'
import { Post } from '@/types'
import apiClient from '@/lib/api-client'

interface PostsState {
  posts: Post[]
  isLoading: boolean
  error: string | null
  total: number
  page: number
}

const initialState: PostsState = {
  posts: [],
  isLoading: false,
  error: null,
  total: 0,
  page: 1,
}

export const getPosts = createAsyncThunk('posts/getPosts', async (page: number = 1, { rejectWithValue }: any) => {
  try {
    const response = await apiClient.getPosts(page, 10)
    return response.data
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch posts')
  }
})

export const createPost = createAsyncThunk('posts/createPost', async (data: any, { rejectWithValue }: any) => {
  try {
    const response = await apiClient.createPost(data)
    return response.data
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to create post')
  }
})

export const likePost = createAsyncThunk('posts/likePost', async (id: string, { rejectWithValue }: any) => {
  try {
    const response = await apiClient.likePost(id)
    return response.data
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || 'Failed to like post')
  }
})

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {},
  extraReducers: (builder: ActionReducerMapBuilder<PostsState>) => {
    builder
      .addCase(getPosts.pending, (state: PostsState) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getPosts.fulfilled, (state: PostsState, action: PayloadAction<any>) => {
        state.isLoading = false
        state.posts = action.payload.posts
        state.total = action.payload.total
        state.page = action.payload.page
      })
      .addCase(getPosts.rejected, (state: PostsState, action: PayloadAction<any>) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      .addCase(createPost.pending, (state: PostsState) => {
        state.isLoading = true
      })
      .addCase(createPost.fulfilled, (state: PostsState, action: PayloadAction<any>) => {
        state.isLoading = false
        state.posts.unshift(action.payload)
      })
      .addCase(createPost.rejected, (state: PostsState, action: PayloadAction<any>) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      .addCase(likePost.fulfilled, (state: PostsState, action: PayloadAction<any>) => {
        const post = state.posts.find((p: Post) => p.id === action.payload.id)
        if (post) {
          post.liked = action.payload.liked
          post.likes_count = action.payload.likes_count
        }
      })
  },
})

export default postsSlice.reducer
