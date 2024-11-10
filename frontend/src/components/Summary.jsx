import {
  Button,
  Card,
  CardBody,
  Container,
  Divider,
  Flex,
  Grid,
  Heading,
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
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import React, { useEffect, useState } from "react";
import { useUserContext } from "../context/UserProvider";
import axios from "axios";

const Summary = ({ isOpen, handleClose }) => {
  const { userDetails } = useUserContext();
  const [soldPlayers, setSoldPlayers] = useState([]);

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

  return (
    <Modal isOpen={isOpen} size="full-width" onClose={handleClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Squads</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Grid templateColumns="repeat(3, 1fr)" width="100%" gap={4} p={4}>
            {soldPlayers.map((currPlayer) => {
              return (
                <Card maxW="sm">
                  <CardBody>
                    <Flex justifyContent={"space-evenly"}>
                      <Image
                        src={currPlayer.image}
                        alt="Player Card"
                        borderRadius="lg"
                        height="200"
                        width="200"
                      />
                    </Flex>
                    <Stack mt="6" spacing="3">
                      <Heading size="md">{currPlayer.name}</Heading>

                      <Divider />
                      <Text>{currPlayer.role}</Text>
                      <Text color="blue.600" fontSize="2xl">
                        {currPlayer.final_price / 10000000} CR
                      </Text>
                    </Stack>
                  </CardBody>
                  <Divider />
                </Card>
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
