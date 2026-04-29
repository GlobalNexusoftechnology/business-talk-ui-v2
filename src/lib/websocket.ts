import { io, Socket } from "socket.io-client"

type MessageHandler = (data: any) => void

class WebSocketManager {
  private socket: Socket | null = null
  private handlers: { [key: string]: MessageHandler[] } = {}

  connect(userId: string) {
    if (this.socket) return

    this.socket = io(
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000",
      {
        transports: ["websocket"],
        withCredentials: true,
        query: { userId }, // 🔥 REQUIRED
      }
    )

    this.socket.on("connect", () => {
      console.log("✅ Socket.IO connected")
    })

    this.socket.on("disconnect", () => {
      console.log("❌ Socket.IO disconnected")
    })

    this.socket.on("connect_error", (err) => {
      console.error("Socket.IO error:", err.message)
    })

    // 🔥 Generic event handler
    this.socket.onAny((event, data) => {
      if (this.handlers[event]) {
        this.handlers[event].forEach((h) => h(data))
      }
    })
  }

  disconnect() {
    this.socket?.disconnect()
    this.socket = null
  }

  on(event: string, handler: MessageHandler) {
    if (!this.handlers[event]) {
      this.handlers[event] = []
    }
    this.handlers[event].push(handler)

    return () => {
      this.handlers[event] = this.handlers[event].filter((h) => h !== handler)
    }
  }

  emit(event: string, data: any) {
    this.socket?.emit(event, data)
  }
}

export default WebSocketManager