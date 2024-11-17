import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
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
  SimpleGrid,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VStack,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import React, { useEffect, useState } from "react";
import { useUserContext } from "../context/UserProvider";
import axios from "axios";
import { MdOutlineAirplanemodeActive } from "react-icons/md";
import PurseAnalyticsByRole from "./PieChart";
import { BarChart } from "recharts";
import ExpenditureByRoleBarChart from "./BarChart";

const Squads = ({ isOpen, handleClose }) => {
  const ABBERIVATIONS = {
    "Kolkata Knight Riders": "KKR",
    "Royal Challengers Banglore": "RCB",
    "Mumbai Indians": "MI",
    "Delhi Capitals": "DC",
    "Chennai Super Kings": "CSK",
    "Rajasthan Royals": "RR",
    "Punjab Kings": "PBKS",
    "Sunrisers Hyderabad": "SRH",
    "Lucknow Super Giants": "LSG",
    "Gujarat Titans": "GT",
  };
  const { userDetails } = useUserContext();
  const [squads, setSquads] = useState([]);
  console.log(squads);

  const getRtm = (capped, uncapped) => {
    let total = 6 - (5 - capped + (2 - uncapped));

    return total;
  };

  const getSquads = async () => {
    try {
      const res = await axios.get(
        `http://localhost:8001/get-squad?id=${userDetails.roomId}`
      );
      const { roomDetails } = res.data;
      console.log("room deta--", roomDetails);
      setSquads(roomDetails);
    } catch (err) {
      console.log("err", err);
    }
  };
  console.log("squads", squads);
  useEffect(() => {
    getSquads();
  }, [isOpen, userDetails]);

  return (
    <Modal isOpen={isOpen} size="full" onClose={handleClose}>
      <ModalOverlay />
      <ModalContent
        bg="gray.800"
        color="white"
        boxShadow="inset 0 0 100px rgba(0, 0, 0, 0.7)"
      >
        <ModalBody>
          <Tabs variant="enclosed" isLazy isFitted width="100%">
            <TabList color="white">
              {squads?.map((team) => (
                <Tab
                  key={team.name}
                  bg={team.primaryColor}
                  color="white"
                  m={2}
                  border="none"
                  borderRadius="md"
                  fontWeight="bold"
                  _selected={{
                    bgGradient: `linear(to-l, ${team?.secondaryColor}90, ${team?.primaryColor}90)`,
                    boxShadow: "lg",
                    border: "none",
                  }}
                  _hover={{
                    bgGradient: `linear(to-r, ${team?.primaryColor}90, ${team?.secondaryColor}90)`,
                  }}
                >
                  {ABBERIVATIONS[team.name]}
                </Tab>
              ))}
            </TabList>

            {/* Tab Panels for Team Details */}
            <TabPanels>
              {squads?.map((team) => (
                <TabPanel key={team.name}>
                  <SimpleGrid
                    columns={{ base: 1, sm: 2, md: 3 }}
                    spacing={4}
                    width="100%"
                  >
                    <PurseAnalyticsByRole team={team} />

                    <ExpenditureByRoleBarChart team={team} />

                    <Box
                      m={6}
                      textAlign="center"
                      display="flex"
                      justifyContent="center"
                    >
                      <Card
                        variant="outline"
                        borderWidth="1px"
                        bgGradient={`linear(360deg, ${team?.secondaryColor} 50%, ${team?.primaryColor} 50%)`}
                        backgroundColor="gray.600"
                        borderRadius="md"
                        maxWidth="200px"
                        color="white"
                      >
                        <CardHeader>
                          <Text fontSize="xl" fontWeight="bold">
                            RTM Statistics
                          </Text>
                        </CardHeader>
                        <CardBody>
                          <VStack spacing={2} textAlign="center">
                            <Stat>
                              <StatLabel fontSize="lg">
                                Total RTM options
                              </StatLabel>
                              <StatNumber fontSize="2xl">
                                {getRtm(team.cappedRTM, team.uncappedRTM)}
                              </StatNumber>
                            </Stat>
                            <Stat>
                              <StatLabel fontSize="lg">Capped RTM:</StatLabel>
                              <StatNumber fontSize="2xl">
                                {team.cappedRTM}
                              </StatNumber>
                            </Stat>
                            <Stat>
                              <StatLabel fontSize="lg">Uncapped RTM:</StatLabel>
                              <StatNumber fontSize="2xl">
                                {team.uncappedRTM}
                              </StatNumber>
                            </Stat>
                          </VStack>
                        </CardBody>
                      </Card>
                    </Box>
                  </SimpleGrid>

                  <SimpleGrid
                    columns={{ base: 1, sm: 2 }}
                    spacing={4}
                    mt={4}
                    width="100%"
                  >
                    {team.players?.map((player) => (
                      <Box
                        key={player.id}
                        p={3}
                        borderWidth={1}
                        borderRadius="lg"
                        border="none"
                        bgGradient={`linear(to-l, ${team?.secondaryColor}, ${team?.primaryColor})`}
                        boxShadow="md"
                        display="flex"
                        justifyContent="space-between"
                      >
                        <Text
                          fontSize="lg"
                          fontWeight="bold"
                          display="inline-flex"
                          alignItems="center"
                          textAlign="center"
                          justifyContent="center"
                        >
                          {player.name}{" "}
                          {!player.is_indian && (
                            <MdOutlineAirplanemodeActive
                              style={{ marginLeft: "3px" }}
                            />
                          )}
                        </Text>
                        <Text fontSize="md" color="white" textAlign="center">
                          Role: <strong>{player.role}</strong>
                        </Text>
                        <Text
                          fontSize="lg"
                          fontWeight="bold"
                          textAlign="center"
                        >
                          Price: {player.final_price / 10000000} CR
                        </Text>
                      </Box>
                    ))}
                  </SimpleGrid>
                </TabPanel>
              ))}
            </TabPanels>
          </Tabs>
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
