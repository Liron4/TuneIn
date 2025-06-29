import { createContext, useContext, useState, useEffect } from 'react';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children, newSocket, roomId, roomCreator}) => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
  if (newSocket) {
    // Send user ID to socket for proper tracking
    const userId = localStorage.getItem('userId');
    if (userId) {
      newSocket.emit('setUserId', userId);
      console.log('[SOCKET CONTEXT] Set user ID:', userId);
    }
  }
}, [newSocket]);

  // Monitor the socket connection status
  useEffect(() => {
    if (!newSocket) {
      setIsConnected(false);
      return;
    }

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    newSocket.on('connect', handleConnect);
    newSocket.on('disconnect', handleDisconnect);

    // Set initial state
    setIsConnected(newSocket.connected);

    return () => {
      newSocket.off('connect', handleConnect);
      newSocket.off('disconnect', handleDisconnect);
    };
  }, [newSocket]);

  const value = {
    newSocket,        // The actual socket instance
    isConnected,   // Connection status
    roomId,         // Room ID for convenience
    roomCreator    // Room creator for additional context
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};