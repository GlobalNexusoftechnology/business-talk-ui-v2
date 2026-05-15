import { createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '@/lib/api-client';

/**
 * Mark a conversation as read on the server. This thunk does not revert
 * the optimistic local unread clear; it reports failures for diagnostics
 * and can trigger a refresh to reconcile state if desired.
 */
export const markConversationReadServer = createAsyncThunk(
  'chat/markConversationRead',
  async (conversationId: string, { rejectWithValue }) => {
    try {
      const res = await apiClient.markConversationRead(conversationId);
      // return server response for further reconciliation (may contain messageId/null and updatedAt)
      return {
        conversationId,
        messageId: res?.data?.messageId ?? null,
        updatedAt: typeof res?.data?.updatedAt === 'number' ? res.data.updatedAt : undefined,
      };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message ?? err.message ?? 'Failed to mark conversation read');
    }
  },
);
