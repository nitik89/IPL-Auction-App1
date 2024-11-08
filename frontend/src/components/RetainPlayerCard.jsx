import { Button, Card, CardBody, Image, Stack, Text } from "@chakra-ui/react";
import React from "react";
import { MdOutlineAirplanemodeActive } from "react-icons/md";

const RetainPlayerCard = ({
  myPlayer,
  handlePlayerButton,
  handlePlayerRetention,
  CappedRetentionStages,
  currentStage,
  dialogPage,
}) => {
  return (
    <Card
      maxW="sm"
      borderWidth="1px solid gray.700"
      borderRadius="xl"
      boxShadow="xl"
    >
      <CardBody textAlign="center">
        <Image
          src={myPlayer.image}
          borderRadius="full"
          boxSize="250px"
          objectFit="cover"
          mx="auto"
          mb={4}
        />
        <Stack spacing={2}>
          <Text
            fontSize="lg"
            fontWeight="bold"
            display="inline-flex"
            alignItems="center"
            textAlign="center"
            justifyContent="center"
          >
            {myPlayer.name}
            {!myPlayer.is_indian && (
              <MdOutlineAirplanemodeActive style={{ marginLeft: "3px" }} />
            )}
            {myPlayer.is_uncapped && " (UC)"}
          </Text>
        </Stack>
        {!dialogPage && (
          <Stack spacing={2}>
            <Button
              mt={2}
              colorScheme="purple"
              onClick={() => handlePlayerRetention(myPlayer)}
              disabled={handlePlayerButton(myPlayer)}
            >
              {!myPlayer.is_uncapped
                ? CappedRetentionStages[currentStage].name
                : "Uncapped Retention"}
            </Button>
          </Stack>
        )}
        {dialogPage && (
          <Stack spacing={2}>
            <Text fontSize="2xl">{myPlayer.final_price / 10000000} CR</Text>
          </Stack>
        )}
      </CardBody>
    </Card>
  );
};

export default RetainPlayerCard;
