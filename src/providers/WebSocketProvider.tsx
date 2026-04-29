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
    const userStr = localStorage.getItem('user')

    if (!userStr) return

    const user = JSON.parse(userStr)

    const ws = new WebSocketManager()
    ws.connect(user.id) // 🔥 CRITICAL

    wsManagerRef.current = ws
    setIsConnected(true)

    return () => {
      ws.disconnect()
    }
  }, [])

  return (
    <WebSocketContext.Provider value={{ wsManager: wsManagerRef.current, isConnected }}>
      {children}
    </WebSocketContext.Provider>
  );
};
