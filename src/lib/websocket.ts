import { io, Socket } from 'socket.io-client';
import { CHAT_EVENTS } from '@/lib/chat/events';

type MessageHandler = (data: unknown) => void;

const CANONICAL_TO_BACKEND_EMIT: Record<string, string> = {
  [CHAT_EVENTS.MESSAGE_SEND]: CHAT_EVENTS.MESSAGE_SEND,
  [CHAT_EVENTS.TYPING_START]: CHAT_EVENTS.TYPING_START,
  [CHAT_EVENTS.TYPING_STOP]: CHAT_EVENTS.TYPING_STOP,
  [CHAT_EVENTS.MESSAGE_UPDATE]: 'message:update',
  [CHAT_EVENTS.MESSAGE_DELETE]: 'message:delete',
};

const getSocketOrigin = (): string => {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';
  try {
    return new URL(base).origin;
  } catch {
    return 'http://localhost:3000';
  }
};

class WebSocketManager {
  private socket: Socket | null = null;
  private handlers: Record<string, Set<MessageHandler>> = {};

  connect() {
    if (this.socket) return;

    if (process.env.NODE_ENV === 'development') {
      console.log('[chat-realtime] socket connect init', {
        origin: `${getSocketOrigin()}/v1/chat`,
        transports: ['websocket', 'polling'],
        withCredentials: true,
      });
    }

    this.socket = io(`${getSocketOrigin()}/v1/chat`, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 50,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 15000,
      randomizationFactor: 0.5,
      timeout: 20000,
    });

    this.socket.on('connect', () => {
      this.dispatch('connect', {});
    });

    this.socket.on('disconnect', (reason) => {
      this.dispatch('disconnect', { reason });
    });

    this.socket.on('connect_error', (err) => {
      this.dispatch('connect_error', { message: err.message });
    });

    this.socket.io.on('reconnect_attempt', (attempt) => {
      this.dispatch('reconnect_attempt', { attempt, namespace: '/v1/chat' });
    });

    this.socket.io.on('reconnect', (attempt) => {
      this.dispatch('reconnect', { attempt, namespace: '/v1/chat' });
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