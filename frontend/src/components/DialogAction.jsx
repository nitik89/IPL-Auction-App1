import {
  Button,
  Grid,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import React from "react";
import RetainPlayerCard from "./RetainPlayerCard";
import axios from "axios";
import { useUserContext } from "../context/UserProvider";
import { useSocketContext } from "../context/SocketProvider";
import { useNavigate } from "react-router-dom";

const DialogAction = ({ onClose, isOpen, uncappedPlayers, cappedPlayers }) => {
  const { userDetails } = useUserContext();
  console.log("userDetails", userDetails);
  const { roomId, purse, name } = userDetails;
  const { socket } = useSocketContext();
  const history = useNavigate();
  const handlePlayerRetain = async () => {
    const finalRetentionList = [...uncappedPlayers, ...cappedPlayers];
    let amount = 0;
    let uncappedPlayersCount = uncappedPlayers.length;
    let cappedPlayersCount = cappedPlayers.length;
    console.log("players", uncappedPlayersCount, cappedPlayersCount);

    finalRetentionList.forEach((player) => {
      player.is_retained = true;
      player.is_sold = true;
      amount += player.final_price;
    });
    try {
      const updatedTeam = await axios.post(
        "http://localhost:8001/retain-player",
        {
          teamName: name,
          amount: purse - amount,
          auctionId: roomId,
          retainedPlayers: finalRetentionList,
          uncappedPlayersCount,
          cappedPlayersCount,
        }
      );
      const updatedTeamData = updatedTeam.data;
      socket.emit("joinRoom", { ...updatedTeamData, roomId, name, purse });
      history("/dashboard");
    } catch (err) {
      console.log("Error in retaining players", err);
    }
  };
  return (
    <Modal
      onClose={onClose}
      size="full"
      isOpen={isOpen}
      scrollBehavior="inside"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Retained Players</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Grid
            templateColumns="repeat(auto-fill, minmax(300px, 1fr))"
            gap={4}
            p={2}
          >
            {cappedPlayers.map((player) => {
              return <RetainPlayerCard myPlayer={player} dialogPage={true} />;
            })}
          </Grid>
          <Grid
            templateColumns="repeat(auto-fill, minmax(300px, 1fr))"
            gap={4}
            p={2}
          >
            {uncappedPlayers.map((player) => {
              return <RetainPlayerCard myPlayer={player} dialogPage={true} />;
            })}
          </Grid>
        </ModalBody>
        <ModalFooter>
          <Button variantColor="blue" mr={3} onClick={handlePlayerRetain}>
            Save
          </Button>
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DialogAction;
