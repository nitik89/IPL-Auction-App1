import React from "react";
import { Box, Center, Container, Grid, GridItem } from "@chakra-ui/react";
import PlayerCard from "./PlayerCard";
import { useTeamContext } from "../context/TeamProvider";
const PlayersSection = () => {
  const { currPlayer } = useTeamContext();
  console.log("mycurrplayer", currPlayer);
  return (
    <div>
      <Box mt={5} justifyItems="center">
        <PlayerCard />
      </Box>
    </div>
  );
};

export default PlayersSection;
