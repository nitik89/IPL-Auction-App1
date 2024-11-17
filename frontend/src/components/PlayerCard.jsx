import {
  Card,
  CardBody,
  Divider,
  Heading,
  Image,
  Stack,
  Text,
  Box,
} from "@chakra-ui/react";
import React from "react";
import { useTeamContext } from "../context/TeamProvider";

const PlayerCard = () => {
  const { currPlayer, bidderImage, currHighest, colorsSet } = useTeamContext();

  console.log(
    "current player --",
    currHighest,
    colorsSet[currHighest]?.secondaryColor,
    colorsSet[currHighest]?.primaryColor
  );

  return (
    <Card
      maxW="lg" // Increased width for a more spacious card
      textAlign="center"
      bg="gray.800"
      bgGradient={`linear(to-l, ${colorsSet[currHighest]?.secondaryColor}, ${colorsSet[currHighest]?.primaryColor})`} // Dark card background for contrast
      borderRadius="lg" // Rounded corners for a soft effect
      boxShadow="0 8px 20px rgba(0, 255, 255, 0.5)"
      _hover={{
        boxShadow: "0 20px 40px rgba(0, 255, 255, 0.5)",
        // Neon-like hover shadow
        transform: "scale(1.05)", // Slight scaling effect on hover
        transition: "all 0.3s ease",
      }}
      transition="all 0.3s ease"
    >
      <CardBody position="relative">
        <Image
          src={currPlayer?.image}
          alt="Player Card"
          borderRadius="full" // Circular image for a modern look
          height="200px"
          width="200px"
          objectFit="cover"
          mb={4} // Margin-bottom for spacing
        />
        {bidderImage && (
          <Box
            bg="rgba(0, 0, 0, 0.6)" // Semi-transparent dark background for bidder image
            borderRadius="full"
            p={2}
            position="absolute"
            top="4"
            right="4"
          >
            <Image
              src={bidderImage}
              alt="Bidder"
              height="40px"
              width="40px"
              borderRadius="full"
            />
          </Box>
        )}

        <Stack mt="6" spacing="3" textAlign="center">
          <Heading
            size="lg" // Increased size for a more prominent name
            color="white"
            fontWeight="bold" // Bold text for the player's name
            _hover={{ color: "blue.300" }}
          >
            {currPlayer?.name}
          </Heading>

          <Divider />
          <Text color="white" fontWeight="semibold">
            {" "}
            {/* Bold and improved text style */}
            {currPlayer?.role}
          </Text>
          <Divider />
          <Text color="white" fontSize="2xl" fontWeight="bold">
            {Math.max(currPlayer?.base_price, currPlayer?.final_price) /
              10000000}{" "}
            CR
          </Text>
        </Stack>
      </CardBody>
    </Card>
  );
};

export default PlayerCard;
