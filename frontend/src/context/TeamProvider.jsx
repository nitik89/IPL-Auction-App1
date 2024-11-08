import React, { createContext, useContext, useState } from "react";
import players from "../players.json";
const TeamContext = createContext();

export const useTeamContext = () => useContext(TeamContext);

export const TeamProvider = ({ children }) => {
  const [teams, setTeams] = useState([]);
  const [team, setTeam] = useState({});
  const [startAuction, setStartAuction] = useState(false);
  const [currPlayer, setCurrPlayer] = useState(players[0]);
  const [currIdx, setCurrIdx] = useState(0);
  const [bids, setBids] = useState({});
  const [bidderImage, setBidderImage] = useState("");
  const [currHighest, setCurrHighest] = useState("");
  const [playerSold, setPlayerSold] = useState(false);

  return (
    <TeamContext.Provider
      value={{
        teams,
        setTeams,
        startAuction,
        setStartAuction,
        currPlayer,
        setCurrPlayer,
        bids,
        setBids,
        currIdx,
        setCurrIdx,
        bidderImage,
        setBidderImage,
        currHighest,
        setCurrHighest,
        playerSold,
        setPlayerSold,
        team,
        setTeam,
      }}
    >
      {children}
    </TeamContext.Provider>
  );
};

export default TeamContext;
