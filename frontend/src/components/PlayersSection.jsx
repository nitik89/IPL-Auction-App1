import React from "react";
import { Container, Grid, GridItem } from "@chakra-ui/react";
import PlayerCard from "./PlayerCard";
import Commentary from "./Commentary";
import { useTeamContext } from "../context/TeamProvider";
const PlayersSection = () => {
  const { currPlayer, setCurrPlayer } = useTeamContext();
  console.log("mycurrplayer", currPlayer);
  return (
    <div>
      <Grid templateColumns="repeat(3, 3fr)" gap={6} mt={5}>
        <GridItem w="100%">
          <Container m={5}>
            <img src="./header.png" height="300" width="300" />
          </Container>
        </GridItem>
        <GridItem w="100%">
          <PlayerCard />
        </GridItem>
        <GridItem w="100%">
          <Commentary />
        </GridItem>
      </Grid>
    </div>
  );
};

export default PlayersSection;
