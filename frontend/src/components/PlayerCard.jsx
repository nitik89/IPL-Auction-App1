import {
  Card,
  CardBody,
  Divider,
  Heading,
  Image,
  Stack,
  Center,
  Text,
} from "@chakra-ui/react";
import React from "react";
import { useTeamContext } from "../context/TeamProvider";

const PlayerCard = () => {
  const { currPlayer, bidderImage, currHighest } = useTeamContext();

  console.log("current player --", currPlayer);
  return (
    <Card maxW="sm" textAlign="center">
      <CardBody>
        <Center>
          <Image
            src={currPlayer.image}
            alt="Player Card"
            borderRadius="lg"
            height="200"
            width="200"
          />
          {bidderImage && (
            <img src={bidderImage} alt="Bidder" height="40" width="40" />
          )}
        </Center>

        <Stack mt="6" spacing="3" textAlign="center">
          <Heading size="md">{currPlayer.name}</Heading>

          <Divider />
          <Text>{currPlayer.role}</Text>
          <Divider />
          <Text color="blue.600" fontSize="2xl">
            {currPlayer.price / 10000000} CR
          </Text>
        </Stack>
      </CardBody>
      <Divider />
    </Card>
  );
};

export default PlayerCard;
