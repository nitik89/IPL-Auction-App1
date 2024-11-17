import React, { useEffect } from "react";
import PlayersSection from "../components/PlayersSection";
import TeamsSection from "../components/TeamsSection";
import { Grid, GridItem } from "@chakra-ui/react";
import Commentary from "../components/Commentary";

const DashboardPage = () => {
  return (
    <Grid>
      <GridItem>
        {" "}
        <PlayersSection />
      </GridItem>
      <GridItem>
        {" "}
        <TeamsSection />
      </GridItem>
      <GridItem>
        <Commentary />
      </GridItem>
    </Grid>
  );
};

export default DashboardPage;
