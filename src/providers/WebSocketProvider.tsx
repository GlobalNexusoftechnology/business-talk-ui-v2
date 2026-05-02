import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import WebSocketManager from '@/lib/websocket';

interface WebSocketContextValue {
  wsManager: WebSocketManager | null;
  isConnected: boolean;
}

const WebSocketContext = createContext<WebSocketContextValue>({ wsManager: null, isConnected: false });

export const useWebSocket = () => useContext(WebSocketContext);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const wsManagerRef = useRef<WebSocketManager | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return

    let userStr: string | null = null
    try {
      userStr = localStorage.getItem('user')
    } catch {
      return
    }

    if (!userStr) return

    let user: any
    try {
      user = JSON.parse(userStr)
    } catch {
      return
    }

    const userId = user?.id
    if (!userId) {
      console.warn('WebSocketProvider: no userId found in localStorage user — skipping connection')
      return
    }

    const ws = new WebSocketManager()

    // Track real socket connection state
    ws.on('connect', () => setIsConnected(true))
    ws.on('disconnect', () => setIsConnected(false))

    // Delay connection slightly so auth cookies/session are fully established
    const timer = setTimeout(() => {
      ws.connect(userId)
    }, 1500)
    wsManagerRef.current = ws

    return () => {
      clearTimeout(timer)
      ws.disconnect()
      setIsConnected(false)
    }
  }, [])

  return (
    <WebSocketContext.Provider value={{ wsManager: wsManagerRef.current, isConnected }}>
      {children}
    </WebSocketContext.Provider>
  );
};
