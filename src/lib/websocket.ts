type MessageHandler = (data: any) => void
type ConnectionHandler = () => void

class WebSocketManager {
  private ws: WebSocket | null = null
  private url: string
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 3000
  private handlers: { [key: string]: MessageHandler[] } = {}
  private connectionHandlers: ConnectionHandler[] = []
  private disconnectionHandlers: ConnectionHandler[] = []

  constructor(url: string = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws') {
    this.url = url
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url)

        this.ws.onopen = () => {
          console.log('WebSocket connected')
          this.reconnectAttempts = 0
          this.connectionHandlers.forEach((handler) => handler())
          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data)
            const { type, data } = message

            if (type && this.handlers[type]) {
              this.handlers[type].forEach((handler) => handler(data))
            }
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error)
          }
        }

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error)
          reject(error)
        }

        this.ws.onclose = () => {
          console.log('WebSocket disconnected')
          this.disconnectionHandlers.forEach((handler) => handler())
          this.attemptReconnect()
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)

      setTimeout(() => {
        this.connect().catch(console.error)
      }, this.reconnectDelay)
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  send(type: string, data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, data }))
    } else {
      console.warn('WebSocket is not connected')
    }
  }

  on(type: string, handler: MessageHandler) {
    if (!this.handlers[type]) {
      this.handlers[type] = []
    }
    this.handlers[type].push(handler)

    // Return unsubscribe function
    return () => {
      this.handlers[type] = this.handlers[type].filter((h) => h !== handler)
    }
  }

  onConnect(handler: ConnectionHandler) {
    this.connectionHandlers.push(handler)
    return () => {
      this.connectionHandlers = this.connectionHandlers.filter((h) => h !== handler)
    }
  }

  onDisconnect(handler: ConnectionHandler) {
    this.disconnectionHandlers.push(handler)
    return () => {
      this.disconnectionHandlers = this.disconnectionHandlers.filter((h) => h !== handler)
    }
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN
  }
}

export default WebSocketManager

// Basic WebSocket client for chat
let socket: WebSocket | null = null;

export function connectChatSocket() {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    socket = new WebSocket('ws://localhost:3000');
    // Add event listeners as needed
    socket.onopen = () => console.log('WebSocket connected');
    socket.onclose = () => console.log('WebSocket disconnected');
    socket.onerror = (e) => console.error('WebSocket error', e);
    socket.onmessage = (msg) => console.log('WebSocket message', msg.data);
  }
  return socket;
}

export function sendChatEvent(event: string, data: any) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ event, data }));
  }
}
