import {
  Button,
  Card,
  CardBody,
  Container,
  Divider,
  Flex,
  Grid,
  Heading,
  HStack,
  Image,
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
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import React, { useEffect, useState } from "react";
import { useUserContext } from "../context/UserProvider";
import axios from "axios";
import { useTeamContext } from "../context/TeamProvider";

const Summary = ({ isOpen, handleClose }) => {
  const { userDetails } = useUserContext();
  const [soldPlayers, setSoldPlayers] = useState([]);
  const { teams, colorsSet, setColors } = useTeamContext();
  console.log("color", colorsSet);

  const getSoldPlayers = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8001/sold-players?id=${userDetails.roomId}`
      );
      const { soldPlayers } = res.data;
      setSoldPlayers(soldPlayers);
    } catch (err) {
      console.log("err", err);
    }
  };

  useEffect(() => {
    getSoldPlayers();
  }, [isOpen, userDetails]);

  console.log("sold players", soldPlayers);

  return (
    <Modal isOpen={isOpen} size="full" onClose={handleClose}>
      <ModalOverlay />
      <ModalContent
        bg="gray.800"
        color="white"
        boxShadow="inset 0 0 100px rgba(0, 0, 0, 0.7)"
      >
        <ModalCloseButton />
        <ModalBody>
          <Grid
            templateColumns="repeat(auto-fill,minmax(500px,1fr))"
            width="100%"
            gap={4}
            p={4}
          >
            {soldPlayers.map((currPlayer) => {
              return (
                <Flex
                  p={4}
                  borderWidth="1px"
                  borderRadius="lg"
                  boxShadow="md"
                  alignItems="center"
                  justifyContent="space-around"
                  bgGradient={`linear(to-l, ${
                    colorsSet[currPlayer.final_team]?.secondaryColor
                  }, ${colorsSet[currPlayer.final_team]?.primaryColor})`}
                  gap={4}
                >
                  <Heading size="md" textAlign={{ base: "center", md: "left" }}>
                    {currPlayer.name}
                  </Heading>

                  <Text fontWeight="bold">{currPlayer?.role}</Text>
                  <Text fontWeight="bold">{currPlayer?.final_team}</Text>
                  <Text color="blue.600" fontSize="2xl" fontWeight="bold">
                    {currPlayer?.final_price / 10000000} CR
                  </Text>
                  <Image
                    src={currPlayer?.image}
                    alt={`${currPlayer?.name}`}
                    borderRadius="lg"
                    height="80px"
                    width="80px"
                    objectFit="cover"
                    boxShadow="lg"
                  />
                </Flex>
              );
            })}
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

export default Summary;
