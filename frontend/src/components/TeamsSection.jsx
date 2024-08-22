import React, { useEffect, useState } from "react";
import { useTeamContext } from "../context/TeamProvider";
import {
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardFooter,
  Divider,
  Grid,
  GridItem,
  Heading,
  Image,
  Stack,
} from "@chakra-ui/react";
import { useUserContext } from "../context/UserProvider";
import { useSocketContext } from "../context/SocketProvider";

const TeamsSection = () => {
  const {
    teams,
    bids,
    setBids,
    currPlayer,
    setCurrPlayer,
    startAuction,
    currIdx,
    setCurrIdx,
    currHighest,
    playerSold,
  } = useTeamContext();
  console.log(teams);
  const { userDetails } = useUserContext();
  const { socket } = useSocketContext();
  const [myBid, setMyBid] = useState(false); //true means disbale
  const [myWithdraw, setMyWithdraw] = useState(true);

  const increaseBids = (currTeam) => {
    console.log("this prev bid --", bids, currTeam);

    const newBids = { ...bids };
    if (Object.keys(bids).length === 0) {
      newBids[currTeam] = currPlayer.price;
    } else {
      newBids[currTeam] = currPlayer.price + 2500000;
    }
    setBids(newBids);

    socket.emit("bid-player", {
      team: currTeam,
      price: newBids[currTeam],
      bids: newBids,
      logo: userDetails.logo,
      currIdx: currIdx,
      currPlayer: currPlayer,
    });
  };
  const withDraw = (currTeam) => {
    console.log("the bids -- ", bids, currTeam);
    const tempBid = { ...bids };
    delete tempBid[currTeam];
    setBids(tempBid);
    socket.emit("withraw-bid", {
      team: currTeam,
      bids: tempBid,
      currIdx: currIdx,
      currPlayer,
    });
  };
  useEffect(() => {
    setMyBid(false);
    setMyWithdraw(true);
  }, [currPlayer]);

  useEffect(() => {
    let highestBid = 0;
    let highestBidder = null;

    for (const name in bids) {
      const score = bids[name];
      if (score > highestBid) {
        highestBid = score;
        highestBidder = name;
      }
    }

    // Check if the highest scorer is "me"
    if (highestBidder == userDetails.name) {
      setMyWithdraw(true);
      setMyBid(true);
    } else if (!bids[userDetails?.name]) {
      setMyBid(false);
      setMyWithdraw(true);
    } else {
      setMyBid(false);
      setMyWithdraw(false);
    }
  }, [bids]);

  return (
    <Grid templateColumns="repeat(4, 1fr)" gap={6} m={6}>
      {teams?.map((team, index) => (
        <GridItem key={index} w="100%">
          <Card
            maxW="sm"
            height="300px"
            width="300px"
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
            backgroundColor={team.name == currHighest && "gray.200"}
          >
            <CardBody
              textAlign="center"
              flex="1"
              d="flex"
              flexDirection="column"
              justifyContent="center"
              alignItems="center"
            >
              <Image
                src={team.logo}
                alt={team.name}
                borderRadius="lg"
                height="100"
                width="100"
                mx="auto"
              />
              <Stack mt="6" spacing="3">
                <Heading size="md">{team.name}</Heading>
              </Stack>
            </CardBody>
            {userDetails.name == team.name && startAuction && (
              <>
                {" "}
                <Divider />
                <CardFooter
                  textAlign="center"
                  display="flex"
                  justifyContent="center"
                >
                  {!playerSold && (
                    <ButtonGroup spacing="2">
                      <>
                        <Button
                          colorScheme="teal"
                          variant="solid"
                          mx={2}
                          isDisabled={
                            myBid || team.purse < currPlayer.price + 2500000
                          }
                          onClick={() => {
                            increaseBids(team.name);
                          }}
                        >
                          Bid
                        </Button>
                        <Button
                          colorScheme="teal"
                          variant="solid"
                          isDisabled={
                            myWithdraw ||
                            team.purse < currPlayer.price + 2500000
                          }
                          mx={2}
                          onClick={() => withDraw(team.name)}
                        >
                          Withdraw
                        </Button>
                      </>
                    </ButtonGroup>
                  )}
                </CardFooter>
              </>
            )}
          </Card>
        </GridItem>
      ))}
    </Grid>
  );
};

export default TeamsSection;
