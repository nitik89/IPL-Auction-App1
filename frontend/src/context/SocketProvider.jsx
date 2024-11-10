import React, { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";

const SocketContext = createContext();

export const useSocketContext = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const ENDPOINT = "http://localhost:8001";
  const [socket, setSocket] = useState(null);
  useEffect(() => {
    // Initialize socket connection
    const socketIo = io(ENDPOINT, {
      transports: ["websocket"], // Ensure WebSocket is used
      withCredentials: true, // Include credentials if needed
    });

    // Set socket
    setSocket(socketIo);

    // Cleanup on component unmount
    return () => {
      if (socketIo) {
        socketIo.disconnect();
      }
    };
  }, [ENDPOINT]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;
