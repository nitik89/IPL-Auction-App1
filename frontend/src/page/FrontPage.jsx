import { Button, Container, Flex, Grid, Image } from "@chakra-ui/react";
import React from "react";
import { useNavigate } from "react-router-dom";

const FrontPage = () => {
  const history = useNavigate();

  const joinRoom = () => {
    history("/join-room");
  };
  const createRoom = () => {
    history("/create-room");
  };
  return (
    <div>
      <Flex
        align="center"
        justify="center"
        minHeight="80vh"
        flexDirection="column"
        gap={6}
      >
        <Container maxW="xl">
          <Grid gap={4}>
            <Flex justify="center" m={3}>
              {" "}
              {/* Center the image horizontally */}
              <Image src="./header.png" height="200" width="200" />
            </Flex>
            <Button
              maxWidth="xl"
              backgroundColor="blue.300" // Updated button color to teal
              width="100%"
              onClick={() => joinRoom()}
            >
              Join Room
            </Button>
            <Button
              maxWidth="xl"
              backgroundColor="blue.300" // Updated button color to orange
              width="100%"
              onClick={() => createRoom()}
            >
              Create Room
            </Button>
          </Grid>
        </Container>
      </Flex>
    </div>
  );
};

export default FrontPage;
