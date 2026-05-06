/**
 * WebSocket middleware for Redux.
 *
 * Responsibilities:
 *  - Intercepts `ws/emitTyping` and `ws/emitMessage` virtual actions and
 *    forwards them to the WebSocket layer.
 *  - All *incoming* socket events are handled in WebSocketProvider, which
 *    dispatches the real slice actions (wsMessageReceived, wsTypingReceived …).
 *
 * The wsManager reference is injected via `registerWsManager`, called from
 * WebSocketProvider once the socket connects.  This avoids putting a
 * non-serializable value inside Redux state.
 */

import type { Middleware, MiddlewareAPI, Dispatch, AnyAction } from '@reduxjs/toolkit';
import type WebSocketManager from '@/lib/websocket';

// ─── Module-level manager reference ───────────────────────────────────────────

let _wsManager: WebSocketManager | null = null;

/** Called by WebSocketProvider when the socket connects / disconnects. */
export const registerWsManager = (manager: WebSocketManager | null): void => {
  _wsManager = manager;
};

export const getRegisteredWsManager = (): WebSocketManager | null => _wsManager;

// ─── Virtual action types (never reach reducers) ───────────────────────────────

export const WS_EMIT_TYPING = 'ws/emitTyping' as const;
export const WS_EMIT_MESSAGE = 'ws/emitMessage' as const;

// ─── Action creators for outgoing events ──────────────────────────────────────

export interface EmitTypingPayload {
  conversationId: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EmitMessagePayload = Record<string, any>;

export const emitTypingAction = (
  payload: EmitTypingPayload,
): { type: typeof WS_EMIT_TYPING; payload: EmitTypingPayload } => ({
  type: WS_EMIT_TYPING,
  payload,
});

export const emitMessageAction = (
  payload: EmitMessagePayload,
): { type: typeof WS_EMIT_MESSAGE; payload: EmitMessagePayload } => ({
  type: WS_EMIT_MESSAGE,
  payload,
});

// ─── Middleware ────────────────────────────────────────────────────────────────

export const websocketMiddleware: Middleware =
  (_store: MiddlewareAPI) =>
  (next: Dispatch) =>
  (action: AnyAction) => {
    // Outgoing typing indicator — fire-and-forget, stop here
    if (action.type === WS_EMIT_TYPING) {
      _wsManager?.emit('typing', action.payload);
      return;
    }

    // Outgoing message emit — fire-and-forget, stop here
    if (action.type === WS_EMIT_MESSAGE) {
      _wsManager?.emit('send_message', action.payload);
      return;
    }

    // All other actions pass through to reducers normally
    return next(action);
  };
