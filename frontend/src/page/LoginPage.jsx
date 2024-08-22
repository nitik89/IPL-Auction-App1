import {
  Button,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Select,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useUserContext } from "../context/UserProvider";
import { useSocketContext } from "../context/SocketProvider";
import teams from "../teams.json";

const LoginPage = () => {
  const [teamName, setTeamName] = useState("");
  const [roomId, setRoomId] = useState("");
  const { setUserDetails } = useUserContext();
  const { socket } = useSocketContext();
  const history = useNavigate();

  const handleTeamNameChange = (event) => {
    console.log("team array", event.target.value);
    setTeamName(event.target.value);
  };

  const createRoom = async () => {
    try {
      const res = await axios.post("/create-room");
      const { auctionRoom } = res.data;
      setRoomId(auctionRoom._id);
    } catch (err) {
      console.log(err);
    }
  };

  const handleRoomIdChange = (event) => {
    setRoomId(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const myObj = teams.filter((team) => team.name == teamName);
      console.log("my", myObj);
      setUserDetails({ ...myObj[0], roomId });
      socket.emit("joinRoom", {
        name: teamName,
        logo: myObj[0].logo,
        purse: myObj[0].purse,
        roomId,
      });

      history("/dashboard");
    } catch (err) {
      console.error(err);
    }
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
          <form onSubmit={handleSubmit}>
            <FormControl>
              <FormLabel>Select Your Team Name:</FormLabel>
              <Select value={teamName?.name} onChange={handleTeamNameChange}>
                {teams.map((team) => {
                  return (
                    <option key={team.id} value={team.name}>
                      {team.name}
                    </option>
                  );
                })}
              </Select>
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Room ID:</FormLabel>
              <Input
                value={roomId}
                onChange={handleRoomIdChange}
                placeholder="Enter room ID"
              />
            </FormControl>
            <Flex flexDirection="column" gap={4} mt={4}>
              <Button colorScheme="teal" variant="solid" onClick={createRoom}>
                Create Room
              </Button>
              <Button type="submit" colorScheme="teal" variant="solid">
                Enter the Room
              </Button>
            </Flex>
          </form>
        </Container>
      </Flex>
    </div>
  );
};

export default LoginPage;
