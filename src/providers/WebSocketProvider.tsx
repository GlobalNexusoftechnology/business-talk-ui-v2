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
    wsManagerRef.current = new WebSocketManager();
    wsManagerRef.current.connect().then(() => setIsConnected(true)).catch(() => setIsConnected(false));
    wsManagerRef.current.onConnect(() => setIsConnected(true));
    wsManagerRef.current.onDisconnect(() => setIsConnected(false));
    return () => {
      wsManagerRef.current?.disconnect();
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ wsManager: wsManagerRef.current, isConnected }}>
      {children}
    </WebSocketContext.Provider>
  );
};
