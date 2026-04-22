import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import type { PayloadAction, ActionReducerMapBuilder } from '@reduxjs/toolkit'
import { Conversation, Message } from '@/types'
import apiClient from '@/lib/api-client'

interface MessagesState {
  conversations: Conversation[]
  currentConversation: {
    id: string | null
    messages: Message[]
    isLoading: boolean
  }
  isLoading: boolean
  error: string | null
}

const initialState: MessagesState = {
  conversations: [],
  currentConversation: {
    id: null,
    messages: [],
    isLoading: false,
  },
  isLoading: false,
  error: null,
}

export const getConversations = createAsyncThunk(
  'messages/getConversations',
  async (_: void, { rejectWithValue }: any) => {
    try {
      const response = await apiClient.getConversations()
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch conversations')
    }
  }
)

export const getMessages = createAsyncThunk(
  'messages/getMessages',
  async ({ conversationId, page }: { conversationId: string; page?: number }, { rejectWithValue }: any) => {
    try {
      const response = await apiClient.getMessages(conversationId, page)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch messages')
    }
  }
)

export const sendMessage = createAsyncThunk(
  'messages/sendMessage',
  async ({ conversationId, content }: { conversationId: string; content: string }, { rejectWithValue }: any) => {
    try {
      const response = await apiClient.sendMessage(conversationId, content)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send message')
    }
  }
)

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    addMessage: (state: MessagesState, action: PayloadAction<Message>) => {
      state.currentConversation.messages.push(action.payload)
    },
  },
  extraReducers: (builder: ActionReducerMapBuilder<MessagesState>) => {
    builder
      .addCase(getConversations.pending, (state: MessagesState) => {
        state.isLoading = true
      })
      .addCase(getConversations.fulfilled, (state: MessagesState, action: PayloadAction<any>) => {
        state.isLoading = false
        state.conversations = action.payload
      })
      .addCase(getConversations.rejected, (state: MessagesState, action: PayloadAction<any>) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      .addCase(getMessages.pending, (state: MessagesState) => {
        state.currentConversation.isLoading = true
      })
      .addCase(getMessages.fulfilled, (state: MessagesState, action: PayloadAction<any>) => {
        state.currentConversation.isLoading = false
        state.currentConversation.id = action.payload.conversation_id
        state.currentConversation.messages = action.payload.messages
      })
      .addCase(getMessages.rejected, (state: MessagesState, action: PayloadAction<any>) => {
        state.currentConversation.isLoading = false
        state.error = action.payload as string
      })

      .addCase(sendMessage.fulfilled, (state: MessagesState, action: PayloadAction<Message>) => {
        state.currentConversation.messages.push(action.payload)
      })
  },
})

export const { addMessage } = messagesSlice.actions
export default messagesSlice.reducer
