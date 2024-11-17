import React, { createContext, useContext, useEffect, useState } from "react";
const TeamContext = createContext();

export const useTeamContext = () => useContext(TeamContext);

export const TeamProvider = ({ children }) => {
  const [teams, setTeams] = useState([]);
  const [team, setTeam] = useState({});
  const [startAuction, setStartAuction] = useState(false);
  const [currPlayer, setCurrPlayer] = useState({});
  const [playersList, setPlayerList] = useState([]);
  const [currIdx, setCurrIdx] = useState(0);
  const [bids, setBids] = useState({});
  const [bidderImage, setBidderImage] = useState("");
  const [currHighest, setCurrHighest] = useState("");
  const [playerSold, setPlayerSold] = useState(false);
  const [myWithdraw, setMyWithdraw] = useState(true);
  const [sliderActive, setSilderActive] = useState("SELLING");
  const [colorsSet, setColors] = useState({});

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
        setPlayerList,
        playersList,
        myWithdraw,
        setMyWithdraw,
        sliderActive,
        setSilderActive,
        colorsSet,
        setColors,
      }}
    >
      {children}
    </TeamContext.Provider>
  );
};

export default TeamContext;
