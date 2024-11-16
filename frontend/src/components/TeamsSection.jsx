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
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Stack,
  Text,
  Tooltip,
} from "@chakra-ui/react";
import { useUserContext } from "../context/UserProvider";
import { useSocketContext } from "../context/SocketProvider";

const TeamsSection = () => {
  const [sliderValue, setSliderValue] = useState(2500000);
  const {
    teams,
    bids,
    setBids,
    currPlayer,
    startAuction,
    currIdx,
    currHighest,
    playerSold,
    myWithdraw,
    setMyWithdraw,
    sliderActive,
    setSilderActive,
  } = useTeamContext();

  const { userDetails } = useUserContext();
  const { socket } = useSocketContext();
  const [myBid, setMyBid] = useState(false); //true means disbale
  console.log(sliderActive);
  console.log("all bids", bids);
  const showValue = (value) => {
    if (value < 10000000) {
      return value / 100000 + "Lakhs";
    } else {
      return value / 10000000 + "Cr";
    }
  };
  const increaseBids = (currTeam, sliderActive) => {
    console.log("this prev bid --", bids, currTeam, sliderActive);
    let newBids;
    if (sliderActive === "FINAL-BID") {
      newBids = { [currTeam]: currPlayer.final_price + sliderValue };
    } else {
      newBids = { ...bids };

      if (Object.keys(bids).length === 0) {
        newBids[currTeam] = currPlayer.base_price;
      } else {
        newBids[currTeam] = currPlayer.final_price + sliderValue;
      }
      console.log("currPlayer", currPlayer);
    }
    setBids(newBids);
    socket.emit("bid-player", {
      team: currTeam,
      final_price: newBids[currTeam],
      bids: newBids,
      logo: userDetails.logo,
      currIdx: currIdx,
      currPlayer: currPlayer,
      STATE: sliderActive,
    });
  };
  const withDraw = (currTeam, sliderActive) => {
    console.log("the function is clicked");
    console.log("the bids --", bids, currTeam, currPlayer, sliderActive);

    const tempBid = { ...bids };
    delete tempBid[currTeam];
    console.log(tempBid);
    setBids(tempBid);
    socket.emit("withraw-bid", {
      team: currTeam,
      bids: tempBid,
      currIdx: currIdx,
      currPlayer,
      STATE: sliderActive,
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
    if (highestBidder === userDetails.name) {
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

  useEffect(() => {
    socket.on("increase-bid", () => {
      setMyWithdraw(true);
      setMyBid(false);
      setSilderActive("FINAL-BID");
    });
  }, [socket]);

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

            {userDetails.name === team.name && startAuction && (
              <>
                <Divider />
                <CardFooter
                  textAlign="center"
                  display="flex"
                  justifyContent="center"
                  flexDirection="column"
                  alignItems="center"
                  gap={4} // Add some spacing between items
                >
                  {!playerSold && (
                    <>
                      <Stack spacing={6} align="center">
                        {(Object.keys(bids).length > 0 ||
                          (sliderActive !== "SELLING" &&
                            currHighest !== team.name)) && (
                          <Slider
                            aria-label="slider-ex"
                            min={sliderActive !== "SELLING" ? 0 : 2500000}
                            max={100000000}
                            step={2500000}
                            value={sliderValue}
                            onChange={(value) => setSliderValue(value)}
                            width="80%"
                          >
                            <SliderTrack>
                              <SliderFilledTrack />
                            </SliderTrack>
                            <SliderThumb>
                              <Tooltip
                                hasArrow
                                label={showValue(sliderValue)}
                                placement="top"
                                isOpen
                              >
                                <SliderThumb />
                              </Tooltip>
                            </SliderThumb>
                          </Slider>
                        )}

                        {/* Button Group */}
                        <ButtonGroup spacing={4}>
                          <Button
                            colorScheme="teal"
                            variant="solid"
                            isDisabled={
                              (sliderActive !== "SELLING" &&
                                currHighest !== team.name) ||
                              myBid ||
                              team.purse <
                                Math.max(
                                  currPlayer.final_price + sliderValue,
                                  currPlayer.base_price
                                )
                            }
                            onClick={() =>
                              increaseBids(team.name, sliderActive)
                            }
                          >
                            Bid
                          </Button>

                          <Button
                            colorScheme="teal"
                            variant="solid"
                            isDisabled={
                              sliderActive !== "SELLING" ||
                              myWithdraw ||
                              team.purse <
                                Math.max(
                                  currPlayer.final_price + sliderValue,
                                  currPlayer.base_price
                                )
                            }
                            onClick={() => withDraw(team.name, sliderActive)}
                          >
                            Withdraw
                          </Button>
                        </ButtonGroup>
                      </Stack>
                    </>
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
