import { Button, Card, CardBody, Image, Stack, Text } from "@chakra-ui/react";
import React from "react";
import { MdOutlineAirplanemodeActive } from "react-icons/md";
import { useUserContext } from "../context/UserProvider";

const RetainPlayerCard = ({
  myPlayer,
  handlePlayerButton,
  handlePlayerRetention,
  CappedRetentionStages,
  currentStage,
  dialogPage,
}) => {
  const { userDetails } = useUserContext();
  console.log("details", userDetails);
  return (
    <Card
      maxW="sm"
      borderWidth="1px solid gray.700"
      borderRadius="xl"
      boxShadow="xl"
      bgGradient={`linear(40deg, ${userDetails?.secondaryColor} 50%, ${userDetails?.primaryColor} 50%)`}
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
            color="white"
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
              color="white"
              _hover={{ bg: `${userDetails?.primaryColor}`, opacity: 0.8 }}
              bgColor={userDetails?.primaryColor}
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
            <Text fontSize="2xl" fontWeight="bold" color="white">
              {Math.floor(myPlayer.final_price / 10000000)} CR
            </Text>
          </Stack>
        )}
      </CardBody>
    </Card>
  );
};

export default RetainPlayerCard;
