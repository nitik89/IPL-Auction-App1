import {
  Button,
  Grid,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import React, { useEffect, useState } from "react";
import { useUserContext } from "../context/UserProvider";
import axios from "axios";

const Squads = ({ isOpen, handleClose }) => {
  const { userDetails } = useUserContext();
  const [squads, setSquads] = useState([]);

  const getSquads = async () => {
    try {
      const res = await axios.get(`/get-squad?id=${userDetails.roomId}`);
      const { roomDetails } = res.data;
      console.log("room deta--", roomDetails);
      setSquads(roomDetails);
    } catch (err) {
      console.log("err", err);
    }
  };

  useEffect(() => {
    getSquads();
  }, [isOpen, userDetails]);

  return (
    <Modal isOpen={isOpen} size="full-width" onClose={handleClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Squads</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Grid templateColumns="repeat(2, 1fr)" gap={4}>
            {squads?.map((team) => (
              <Menu>
                <MenuButton
                  as={Button}
                  rightIcon={<ChevronDownIcon />}
                  key={team.name}
                >
                  {team.name} Purse - {team.purse / 10000000} CR
                </MenuButton>
                <MenuList>
                  {team["All-Rounder"]?.map((player) => (
                    <MenuItem key={player.id}>
                      {player.name} ({player.role})
                    </MenuItem>
                  ))}
                  {team["Batter"]?.map((player) => (
                    <MenuItem key={player.id}>
                      {player.name} ({player.role})
                    </MenuItem>
                  ))}
                  {team["Bowler"]?.map((player) => (
                    <MenuItem key={player.id}>
                      {player.name} ({player.role})
                    </MenuItem>
                  ))}
                  {team["WK Keeper - Batter"]?.map((player) => (
                    <MenuItem key={player.id}>
                      {player.name} ({player.role})
                    </MenuItem>
                  ))}
                </MenuList>
              </Menu>
            ))}
          </Grid>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={handleClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default Squads;
