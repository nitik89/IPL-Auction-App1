import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Center,
  Grid,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  useDisclosure,
} from "@chakra-ui/react";

import { useUserContext } from "../context/UserProvider";
import DialogAction from "../components/DialogAction";
import RetainPlayerCard from "../components/RetainPlayerCard";

const CappedRetentionStages = [
  { name: "First retention", amount: 180000000 },
  { name: "Second retention", amount: 140000000 },
  { name: "Third retention", amount: 110000000 },
  { name: "Fourth retention", amount: 180000000 },
  { name: "Fifth retention", amount: 140000000 },
];

export const RetentionPage = () => {
  const [players, setPlayers] = useState();
  const { userDetails } = useUserContext();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [currentStage, setCurrentStage] = useState(0);
  const [retainedPlayers, setRetainedPlayers] = useState([]);
  const [uncappedRetention, setUncappedRetention] = useState([]);
  console.log(retainedPlayers, uncappedRetention);

  const handlePlayerRetention = (player) => {
    if (player.is_uncapped) {
      if (uncappedRetention.length < 2) {
        player.final_price = 40000000;
        setUncappedRetention([...uncappedRetention, player]);
      } else {
        console.log("cannot retain this player");
      }
    } else if (
      uncappedRetention.length + retainedPlayers.length < 6 ||
      retainedPlayers.length < 5
    ) {
      player.final_price = CappedRetentionStages[currentStage].amount;
      setRetainedPlayers([...retainedPlayers, player]);
      if (currentStage + 1 <= 4) {
        setCurrentStage((prev) => prev + 1);
      }
    } else {
      console.log("cannot retain this player");
    }
  };
  const checkUncapped = (player) => {
    return uncappedRetention.some((p) => p._id === player._id);
  };
  const checkCapped = (player) => {
    return retainedPlayers.some((p) => p._id === player._id);
  };
  const handlePlayerButton = (player) => {
    if (player.is_uncapped) {
      if (
        uncappedRetention.length >= 2 ||
        retainedPlayers.length + uncappedRetention.length >= 6 ||
        checkUncapped(player)
      ) {
        return true;
      }
    } else if (
      (!player.is_uncapped &&
        (retainedPlayers.length + uncappedRetention.length >= 6 ||
          retainedPlayers.length >= 5)) ||
      checkCapped(player)
    ) {
      return true;
    }
  };
  const handlePlayers = async () => {
    try {
      const playersData = await axios.get(
        `http://localhost:8000/all-team-players?teamName=${userDetails?.name}`
      );

      setPlayers(playersData?.data?.players);
    } catch (err) {}
  };
  useEffect(() => {
    handlePlayers();
  }, []);
  return (
    <Center>
      <Box width="100%" p={4}>
        <Tabs variant="enclosed" isFitted defaultIndex={0}>
          <TabList>
            {players?.map((player) => {
              return <Tab>{player._id}</Tab>;
            })}
          </TabList>
          <TabPanels>
            {players?.map((player) => {
              return (
                <TabPanel key={player._id}>
                  <Grid templateColumns="repeat(auto-fill, minmax(300px, 1fr))">
                    {player?.players?.map((myPlayer) => {
                      return (
                        <Box key={myPlayer._id} flex="1" mb={4} p={2}>
                          <RetainPlayerCard
                            myPlayer={myPlayer}
                            handlePlayerButton={handlePlayerButton}
                            handlePlayerRetention={handlePlayerRetention}
                            CappedRetentionStages={CappedRetentionStages}
                            currentStage={currentStage}
                          />
                        </Box>
                      );
                    })}
                  </Grid>
                </TabPanel>
              );
            })}
          </TabPanels>
        </Tabs>
        <Button
          bottom="20px"
          right="20px"
          backgroundColor="yellow.500"
          position="fixed"
          color="white"
          onClick={onOpen}
        >
          Retention List
        </Button>
        <DialogAction
          isOpen={isOpen}
          onClose={onClose}
          uncappedPlayers={uncappedRetention}
          cappedPlayers={retainedPlayers}
        />
      </Box>
    </Center>
  );
};
