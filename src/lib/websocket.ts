import { io, Socket } from 'socket.io-client';
import { CHAT_EVENTS } from '@/lib/chat/events';

type MessageHandler = (data: unknown) => void;

type WebSocketNamespace = '/v1/chat' | '/v1/notifications' | string;

export const CHAT_NAMESPACE = '/v1/chat';
export const NOTIFICATIONS_NAMESPACE = '/v1/notifications';

const DEFAULT_CHAT_NAMESPACE = CHAT_NAMESPACE;

const CANONICAL_TO_BACKEND_EMIT: Record<string, string> = {
  [CHAT_EVENTS.MESSAGE_SEND]: CHAT_EVENTS.MESSAGE_SEND,
  [CHAT_EVENTS.TYPING_START]: CHAT_EVENTS.TYPING_START,
  [CHAT_EVENTS.TYPING_STOP]: CHAT_EVENTS.TYPING_STOP,
  [CHAT_EVENTS.MESSAGE_UPDATE]: 'message:update',
  [CHAT_EVENTS.MESSAGE_DELETE]: 'message:delete',
};

const getSocketOrigin = (): string => {
  // Prefer a WS-specific URL if provided, then fall back to the API base.
  // Use a backend-friendly dev default on localhost:3000.
  const candidate =
    process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

  try {
    return new URL(candidate).origin;
  } catch {
    // Fallback to a safe localhost origin if parsing fails
    try {
      return new URL(process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000').origin;
    } catch {
      return 'http://localhost:4000';
    }
  }
};

class WebSocketManager {
  private socket: Socket | null = null;
  private handlers: Record<string, Set<MessageHandler>> = {};

  constructor(private namespace: WebSocketNamespace = DEFAULT_CHAT_NAMESPACE) {}

  connect(authToken?: string) {
    if (this.socket) return;

    const socketOrigin = getSocketOrigin();
    const url = `${socketOrigin}${this.namespace}`;

    if (process.env.NODE_ENV === 'development') {
      console.log('[WS] Initiating connection', {
        url,
        namespace: this.namespace,
        origin: socketOrigin,
        authMethod: authToken ? 'token' : 'withCredentials (cookie)',
        transports: ['websocket', 'polling'],
      });
    }

    this.socket = io(url, {
      transports: ['websocket', 'polling'],
      withCredentials: true, // ✅ CRITICAL for cross-origin cookie transport
      ...(authToken && { auth: { token: authToken } }), // ✅ Pass JWT token if provided
      reconnection: true,
      reconnectionAttempts: 50,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 15000,
      randomizationFactor: 0.5,
      timeout: 20000,
    });

    this.socket.on('connect', () => {
      if (process.env.NODE_ENV === 'development') {
        const transport = this.socket?.io?.engine?.transport?.name || 'unknown';
        console.log('[WS] CONNECTED', {
          socketId: this.socket?.id,
          transport,
          namespace: this.namespace,
        });
      }
      this.dispatch('connect', {});
    });

    this.socket.on('error', (data) => {
      console.error('[WS SERVER ERROR EVENT]', data);
    });


    this.socket.on('disconnect', (reason) => {
      if (process.env.NODE_ENV === 'development') {
        // "io server disconnect" typically means backend rejected during handshake
        if (reason === 'io server disconnect') {
          console.warn('[WS] Server disconnected socket', {
            namespace: this.namespace,
            socketId: this.socket?.id,
          });
        } else {
          console.log('[WS] DISCONNECTED', {
            reason,
            namespace: this.namespace,
            socketId: this.socket?.id,
          });
        }
      }
      this.dispatch('disconnect', { reason });
    });

    this.socket.on('connect_error', (err) => {
      if (process.env.NODE_ENV === 'development') {
        const errorData = {
          message: err.message,
          code: (err as any)?.code,
          type: (err as any)?.type,
          namespace: this.namespace,
          url,
          timestamp: new Date().toISOString(),
        };

        // Categorize common auth/CORS failures
        if (err.message?.includes('UNAUTHORIZED')) {
          console.error('[WS] AUTH FAILED: UNAUTHORIZED', errorData);
          console.error('[WS] Diagnostics:', {
            note: 'Check: 1) JWT token expired? 2) Token not in cookie? 3) Backend JWT_SECRET_KEY mismatch?',
            hint: 'Verify access_token cookie exists and is valid',
          });
        } else if (err.message?.includes('TOKEN_EXPIRED')) {
          console.error('[WS] AUTH FAILED: TOKEN_EXPIRED', errorData);
        } else if (err.message?.includes('BANNED')) {
          console.error('[WS] AUTH FAILED: BANNED', errorData);
        } else if (err.message?.includes('CORS') || err.message?.includes('403')) {
          console.error('[WS] CORS or HANDSHAKE FAILURE', errorData);
        } else {
          console.error('[WS] CONNECT ERROR', errorData);
        }
        console.error(err);
      }
      this.dispatch('connect_error', { message: err.message });
    });

    // Engine-level connection errors (lower-level transport issues)
    if (this.socket?.io?.engine) {
      (this.socket.io.engine as any).on('connection_error', (err: Error) => {
        if (process.env.NODE_ENV === 'development') {
          console.warn('[WS] ENGINE CONNECTION ERROR (transport-level)', {
            message: err.message,
            type: (err as any)?.type,
            namespace: this.namespace,
          });
        }
      });
    }

    this.socket.io.on('reconnect_attempt', (attempt) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[WS] RECONNECT ATTEMPT', { attempt, namespace: this.namespace });
      }
      this.dispatch('reconnect_attempt', { attempt, namespace: this.namespace });
    });

    this.socket.io.on('reconnect', (attempt) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[WS] RECONNECTED', { attempt, namespace: this.namespace });
      }
      this.dispatch('reconnect', { attempt, namespace: this.namespace });
    });

    this.socket.onAny((event, data) => {
      this.dispatch(event, data);
    });
  }

  disconnect() {
    this.socket?.removeAllListeners();
    this.socket?.disconnect();
    this.socket = null;
  }

  on(event: string, handler: MessageHandler) {
    if (!this.handlers[event]) {
      this.handlers[event] = new Set<MessageHandler>();
    }
    this.handlers[event].add(handler);

    return () => {
      this.handlers[event]?.delete(handler);
    };
  }

  emit(event: string, data: unknown) {
    const backendEvent = CANONICAL_TO_BACKEND_EMIT[event] ?? event;
    this.socket?.emit(backendEvent, data);
  }

  private dispatch(event: string, payload: unknown) {
    this.handlers[event]?.forEach((handler) => handler(payload));
  }
}

export default WebSocketManager;