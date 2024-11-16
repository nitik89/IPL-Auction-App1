import React, { useEffect, useState } from "react";
import { Stat, StatLabel, StatNumber, useDisclosure } from "@chakra-ui/react";
import { useSocketContext } from "../context/SocketProvider";
import { useTeamContext } from "../context/TeamProvider";
import { Button, Container, Grid, useToast } from "@chakra-ui/react";
import Squads from "./Squads";
import Summary from "./Summary";
import { useUserContext } from "../context/UserProvider";
import axios from "axios";
import RTMPopup from "./RTMPopup";

const Commentary = () => {
  const [message, setMessage] = useState("");
  const [title, setTitle] = useState("");
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [time, setTime] = useState(0);
  const { socket } = useSocketContext();
  const [isOpen, setIsOpen] = useState(false);
  const [prevTeam, setPrevTeam] = useState("");
  const handleClose = () => setIsOpen(false);
  const handleCloseSummary = () => setSummaryOpen(false);
  const toast = useToast();
  const { isOpen: isOpended, onOpen, onClose } = useDisclosure();
  const {
    setTeams,
    teams,
    setStartAuction,
    currPlayer,
    setCurrPlayer,
    setBids,
    setCurrIdx,
    setBidderImage,
    setCurrHighest,
    setPlayerSold,
    setPlayerList,
    playersList,
    currIdx,
    bids,
    sliderActive,
    setSilderActive,
    setMyWithdraw,
  } = useTeamContext();

  const { userDetails } = useUserContext();
  console.log("slider state", sliderActive);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(userDetails.roomId);
      toast({
        title: "Copied to Clipboard!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Failed to copy:", error);
      toast({
        title: "Copy Failed!",
        description: "An error occurred while copying to clipboard.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };
  useEffect(() => {
    const handleJoinedRoom = (data) => {
      setTeams(data.teams);
    };

    const handleTeamLeft = (data) => {
      setTeams(data.teams);
    };

    const handleTeamBid = ({ final_price, team, bids, logo }) => {
      const updatedPlayer = { ...currPlayer, final_price };
      setCurrPlayer(updatedPlayer);
      setBids(bids);
      setBidderImage(logo);
      setCurrHighest(team);
    };
    const handleLoadNextPlayer = ({ currIdx, timerTitle }) => {
      setCurrIdx(currIdx);
      setCurrPlayer(playersList[currIdx]);
      setBidderImage("");
      setCurrHighest("");
      setTitle(timerTitle);
      setPlayerSold(false);
      setBids({});
      setSilderActive("SELLING");
      setMyWithdraw(true);
      socket.emit("check-unsold", { currPlayer, currIdx });
    };

    const handlePlayerUnsold = ({ currPlayer: oldPlayer, currIdx }) => {
      setMessage(`${oldPlayer.name} is Unsold`);
      setPlayerSold(true);
      socket.emit("load-next", { currIdx, currPlayer });
    };
    const handleSellingPlayer = ({
      bids,
      currPlayer: oldPlayer,
      currIdx,
      teams,
    }) => {
      const keys = Object.keys(bids);
      if (keys.length === 1) {
        setMessage(`${oldPlayer?.name} is sold to ${keys[0]}`);
        setTeams(teams);
        setPlayerSold(true);
        socket.emit("load-next", { currIdx, currPlayer: playersList[currIdx] });
      }
    };
    const handleWithdrawnBid = ({ team, bids }) => {
      setMessage(`${team.name} is out`);
      setBids(bids);
    };
    const handleTimer = ({ timerTitle, timeLeft }) => {
      setTime(timeLeft);
      setTitle(timerTitle);
    };
    const handleTeamComplete = ({ message }) => {
      setMessage(message);
    };
    const handleAuctionStart = ({ startTheAuction, currIdx }) => {
      setStartAuction(startTheAuction);
      setCurrIdx(currIdx);
      setCurrPlayer(playersList[currIdx]);
      socket.emit("check-unsold", { currIdx, currPlayer });
    };
    const handleDisconnected = ({ teams, message, startAuction }) => {
      setMessage(message);
      setStartAuction(startAuction);
      setTeams(teams);
    };
    const handleRTMRequest = ({ prev_team }) => {
      setPrevTeam(prev_team);
      if (prev_team === currPlayer.prev_team_name) {
        console.log("open it", prev_team, currPlayer.prev_team_name);
        onOpen();
      } else {
        console.log("no open", prevTeam, currPlayer.prev_team_name);
        onClose();
      }
    };
    const handleFinalRetain = () => {
      setSilderActive("FINAL-SELLING");
      onOpen();
    };

    socket.on("joined-room", handleJoinedRoom);
    socket.on("team-left", handleTeamLeft);
    socket.on("team-bid", handleTeamBid);
    socket.on("player-unsold", handlePlayerUnsold);
    socket.on("withdrawn-bid", handleWithdrawnBid);
    socket.on("player-selling", handleSellingPlayer);
    socket.on("timer-update", handleTimer);
    socket.on("team-complete", handleTeamComplete);
    socket.on("start-auction", handleAuctionStart);
    socket.on("load-player", handleLoadNextPlayer);
    socket.on("disconnect", handleDisconnected);
    socket.on("rtm-ask", handleRTMRequest);
    socket.on("final-retain", handleFinalRetain);

    return () => {
      socket.off("joined-room", handleJoinedRoom);
      socket.off("team-left", handleTeamLeft);
      socket.off("team-bid", handleTeamBid);
      socket.off("player-unsold", handlePlayerUnsold);
      socket.off("withdrawn-bid", handleWithdrawnBid);
      socket.off("player-selling", handleSellingPlayer);
      socket.off("timer-update", handleTimer);
      socket.off("rtm-ask", handleRTMRequest);
    };
  }, [socket, currPlayer, setCurrPlayer, teams, setTeams]);

  useEffect(() => {
    if (message?.trim() !== "") {
      toast({
        title: "Message Updated",
        description: `New message: ${message}`,
        status: "info",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    }
  }, [message, toast]);

  const fetchPlayers = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8001/get-auction-players?id=${userDetails?.roomId}`
      );
      console.log("Fetched players:", response?.data?.players);

      // Update playersList with fetched data
      setPlayerList(response?.data?.players);

      // Set currPlayer immediately based on response
      if (response?.data?.players.length > 0) {
        setCurrPlayer(response?.data?.players[currIdx]);
        socket.emit("load-player", {
          currIdx: 0,
          currPlayer: response?.data?.players[currIdx],
        });
      }
    } catch (error) {
      console.error("Error fetching players: ", error);
    }
  };
  const handleYes = () => {
    if (sliderActive === "FINAL-SELLING") {
      const values = Object.values(bids);
      const finalTeam = currPlayer.prev_team_name;
      const finalSellingBid = { [finalTeam]: values[0] };
      setBids(finalSellingBid);
      socket.emit("withraw-bid", {
        team: finalTeam,
        bids: finalSellingBid,
        currIdx: currIdx,
        currPlayer,
        STATE: sliderActive,
      });
    } else {
      socket.emit("rtm-request-accepted", { currPlayer, bids });
    }
    onClose();
  };

  const handleNo = () => {
    setSilderActive("FINAL-SELLING");
    socket.emit("withraw-bid", {
      team: currIdx.prev_team_name,
      bids,
      currIdx: currIdx,
      currPlayer,
      STATE: "FINAL-SELLING",
    });
    onClose();
  };
  useEffect(() => {
    fetchPlayers();
  }, [userDetails]);

  return (
    <Container centerContent>
      <Grid templateColumns="1fr " width="100%" gap={4} p={4}>
        {currPlayer?.prev_team_name === prevTeam && isOpended && (
          <RTMPopup
            isOpened={isOpended}
            onClose={onClose}
            currentPlayer={currPlayer}
            handleYes={handleYes}
            handleNo={handleNo}
            state={sliderActive}
          />
        )}
        <Button width="100%" onClick={handleCopy}>
          Copy Room ID
        </Button>
        <Button width="100%" onClick={() => setSummaryOpen(true)}>
          Auction Summary
        </Button>
        <Button width="100%" onClick={() => setIsOpen(true)}>
          Squads
        </Button>
        <Squads isOpen={isOpen} handleClose={handleClose} />
        <Summary isOpen={summaryOpen} handleClose={handleCloseSummary} />
        {title && (
          <Stat mt={4}>
            <StatLabel>{title}</StatLabel>
            <StatNumber>{time}</StatNumber>
          </Stat>
        )}
      </Grid>
    </Container>
  );
};

export default Commentary;
