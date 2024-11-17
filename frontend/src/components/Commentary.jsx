import React, { useEffect, useState } from "react";
import {
  Box,
  Icon,
  Stat,
  StatLabel,
  StatNumber,
  useDisclosure,
} from "@chakra-ui/react";
import { useSocketContext } from "../context/SocketProvider";
import { useTeamContext } from "../context/TeamProvider";
import { Button, Container, Grid, useToast } from "@chakra-ui/react";
import Squads from "./Squads";
import Summary from "./Summary";
import { useUserContext } from "../context/UserProvider";
import axios from "axios";
import RTMPopup from "./RTMPopup";
import {
  MdFileCopy,
  MdOutlineAddChart,
  MdOutlineBarChart,
} from "react-icons/md";
import { FaUsers } from "react-icons/fa";

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
    setColors,
    setMyWithdraw,
    colorsSet,
  } = useTeamContext();
  console.log("colors", colorsSet);
  const { userDetails } = useUserContext();

  useEffect(() => {
    const myObj = {};
    teams?.forEach((team) => {
      myObj[team.name] = {
        primaryColor: team?.primaryColor,
        secondaryColor: team?.secondaryColor,
      };
    });
    setColors(myObj);
  }, [teams]);
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
      setMessage(`Player is Unsold`);
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
        setMessage(`Player is sold to ${keys[0]}`);
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
    socket.on("increase-bid", () => {
      setMessage("Asking for the increase in the bid");
    });

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
      <Grid
        templateColumns="repeat(3,1fr)"
        gap={4}
        bottom="20px"
        right="20px"
        position="fixed"
        color="white"
      >
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
        <Button
          onClick={handleCopy}
          colorScheme="blue"
          borderRadius="full"
          p={4} // Adjust padding for a smaller button
          bg="blue.400" // Neon-like blue background
          _hover={{
            bg: "blue.500", // Brighter blue on hover
            transform: "scale(1.05)",
            boxShadow: "0 0 10px 2px rgba(0, 123, 255, 0.7)", // Neon glow on hover
            textShadow: "0 0 5px rgba(0, 123, 255, 0.8)", // Glowing text effect
          }}
          _active={{
            bg: "blue.500",
            boxShadow: "0 0 10px 2px rgba(0, 123, 255, 0.7)", // Keep the glow on active
            textShadow: "0 0 5px rgba(0, 123, 255, 0.8)", // Glowing text effect when clicked
          }}
          boxShadow="lg"
          transition="all 0.3s"
          minWidth="fit-content"
          height="50px"
          width="50px"
        >
          <Icon as={MdFileCopy} boxSize="24px" color="white" />
        </Button>

        {/* Auction Summary */}
        <Button
          onClick={() => setSummaryOpen(true)}
          borderRadius="full"
          p={4}
          bg="green.400" // Neon green background
          _hover={{
            bg: "green.500",
            transform: "scale(1.05)",
            boxShadow: "0 0 10px 2px rgba(0, 255, 0, 0.7)", // Glowing neon effect on hover
            textShadow: "0 0 5px rgba(0, 255, 0, 0.8)", // Neon glow around the text
          }}
          _active={{
            bg: "green.500",
            boxShadow: "0 0 10px 2px rgba(0, 255, 0, 0.7)", // Keep the glow on active
            textShadow: "0 0 5px rgba(0, 255, 0, 0.8)", // Glow effect when clicked
          }}
          boxShadow="lg"
          transition="all 0.3s"
          minWidth="fit-content"
          height="50px"
          width="50px"
        >
          <Icon as={MdOutlineBarChart} boxSize="24px" color="white" />
        </Button>

        {/* Squads */}
        <Button
          onClick={() => setIsOpen(true)}
          colorScheme="purple"
          borderRadius="full"
          p={4}
          bg="purple.400" // Neon purple background
          _hover={{
            bg: "purple.500",
            transform: "scale(1.05)",
            boxShadow: "0 0 10px 2px rgba(128, 0, 255, 0.7)", // Glowing neon effect on hover
            textShadow: "0 0 5px rgba(128, 0, 255, 0.8)", // Neon purple glow around the text
          }}
          _active={{
            bg: "purple.500",
            boxShadow: "0 0 10px 2px rgba(128, 0, 255, 0.7)", // Keep the glow on active
            textShadow: "0 0 5px rgba(128, 0, 255, 0.8)", // Glow effect when clicked
          }}
          boxShadow="lg"
          transition="all 0.3s"
          minWidth="fit-content"
          height="50px"
          width="50px"
        >
          <Icon as={FaUsers} boxSize="24px" color="white" />
        </Button>

        <Squads isOpen={isOpen} handleClose={handleClose} />
        <Summary isOpen={summaryOpen} handleClose={handleCloseSummary} />
        {title && (
          <Box
            position="fixed"
            top="20px"
            right="20px"
            p={4}
            bg="gray.800" // Dark card background for contrast
            borderRadius="lg" // Rounded corners for a soft effect
            boxShadow="0 4px 10px rgba(0, 0, 0, 0.2), 0 4px 20px rgba(0, 0, 0, 0.2)"
            _hover={{
              boxShadow: "0 8px 20px rgba(0, 255, 255, 0.5)", // Neon-like hover shadow
              transform: "scale(1.05)", // Slight scaling effect on hover
              transition: "all 0.3s ease",
            }}
            transition="all 0.3s ease" // Optional: add a semi-transparent background for readability
            color="gray.200"
            zIndex="10"
            display="flex"
            flexDirection="column"
            alignItems="flex-start" // Align content to the left
            justifyContent="flex-start"
          >
            <Stat>
              <StatLabel fontSize="lg" fontWeight="bold" mb={1}>
                {title}
              </StatLabel>
              <StatNumber fontSize="xl" textAlign="center" fontWeight="bold">
                {time || "00:00"}
              </StatNumber>
            </Stat>
          </Box>
        )}
      </Grid>
    </Container>
  );
};

export default Commentary;
