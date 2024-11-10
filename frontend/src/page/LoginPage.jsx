import {
  Button,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Select,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useUserContext } from "../context/UserProvider";
import { useSocketContext } from "../context/SocketProvider";
import { useTeamContext } from "../context/TeamProvider";

//fix this page
const LoginPage = () => {
  const [teamsArr, setTeamsArr] = useState([]);
  const [teamName, setTeamName] = useState({});
  const [roomId, setRoomId] = useState("");
  const { setUserDetails } = useUserContext();
  const { socket } = useSocketContext();
  const { setTeam } = useTeamContext();
  const history = useNavigate();
  console.log(teamName);
  const handleTeamNameChange = (event) => {
    console.log("team array", event.target.value);
    setTeamName(event.target.value);
  };

  const createRoom = async () => {
    try {
      const res = await axios.get("http://localhost:8001/create-room");
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
    console.log(teamName);

    try {
      const myObj = teamsArr?.find((team) => team._id === teamName);
      console.log("my", myObj);
      setUserDetails({ ...myObj, roomId });
      history("/retention-page");
    } catch (err) {
      console.error(err);
    }
  };
  const getTeams = async () => {
    try {
      const teams = await axios.get("http://localhost:8001/get-team");
      console.log("teams", teams);
      setTeamsArr(teams?.data?.teams);
      setTeamName(teamsArr[0]?._id);
    } catch (err) {
      console.log("err", err);
    }
  };
  useEffect(() => {
    getTeams();
  }, []);
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
              <Select value={teamName} onChange={handleTeamNameChange}>
                {teamsArr.map((team) => {
                  return (
                    <option key={team._id} value={team._id}>
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
