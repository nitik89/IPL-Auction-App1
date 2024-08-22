import React, { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";

const SocketContext = createContext();

export const useSocketContext = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const ENDPOINT = "https://ipl-auction-app1.vercel.app/";
  const [socket, setSocket] = useState(null);
  useEffect(() => {
    setSocket(io(ENDPOINT));
  }, []);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;
