import React, { createContext, useContext, useState } from "react";
const RTMContext = createContext();

export const useTeamContext = () => useContext(RTMContext);

export const RTMProvider = ({ children }) => {
  const [prevTeam, setPrevTeam] = useState(null);

  return (
    <RTMProvider.Provider value={{ prevTeam, setPrevTeam }}>
      {children}
    </RTMProvider.Provider>
  );
};

export default RTMProvider;
