const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const axios = require("axios");
const mongoose = require("mongoose");
const app = express();
require("./models/auction");
require("./models/player");
require("./models/teams");
dotenv.config();
const { MONGO_URL } = process.env;
const PORT = process.env.PORT || 8001;

mongoose.connect(MONGO_URL);

mongoose.connection.on("connected", () => {
  console.log("connected to the server yeah!");
});
mongoose.connection.on("error", (err) => {
  console.log("err connecting ", err);
});

const server = app.listen(PORT, "::1", () => {
  console.log(`${PORT}`);
});

app.use(express.json());
app.use(cors());
app.use(require("./routes/auction"));

const io = require("socket.io")(server, {
  pingTimeout: 60000,
  cors: {
    origin: "*", // Allow all origins
    methods: ["GET", "POST"], // Allowed HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
    credentials: true, // Allow credentials (cookies, etc.)
  },
});
let teams = [];
let players = [];
let withdrawBidInterval;
let withdrawBidTimeLeft = 0;
let index = 0;
const clients = new Map();
io.on("connection", (socket) => {
  const decreasePurse = (teamName, amount) => {
    const team = teams.find((team) => team.name === teamName);
    if (team) {
      team.purse -= amount;
      return true; // Indicates team found and purse decreased
    }
    return false; // Indicates team not found
  };

  const handlePlayerSold = async (keys, bids, currPlayer, roomId, team) => {
    decreasePurse(keys[0], bids[keys[0]]);
    const finalPlayerData = {
      ...currPlayer,
      final_team: keys[0],
      final_price: bids[keys[0]],
      is_sold: true,
    };
    players.push(finalPlayerData);

    index++;
    io.emit("player-selling", {
      bids,
      team,
      currPlayer,
      currIdx: index,
      teams,
    });
    try {
      await axios.put(`http://localhost:8001/player-sold?id=${roomId}`, {
        sold: true,
        teamName: keys[0],
        playerDetail: finalPlayerData,
      });
    } catch (err) {
      console.log("err", err);
    }
  };

  const handleDecrease = async (
    keys,
    bids,
    currPlayer,
    currIdx,
    roomId,
    team,
    STATE
  ) => {
    console.log("room id", roomId, team);
    clearInterval(withdrawBidInterval);

    const previousTeam = teams.find(
      (team) => team.name === currPlayer.prev_team_name
    );
    console.log("previous Team", team, previousTeam);
    if (previousTeam && previousTeam?.name !== team && STATE == "SELLING") {
      console.log("ask for RTM", previousTeam);
      const targetSocketId = clients.get(previousTeam?.name);
      console.log("socket", targetSocketId);
      //also check the team has rtm or not
      if (targetSocketId) {
        io.to(targetSocketId).emit("rtm-ask", {
          prev_team: currPlayer.prev_team_name,
          currPlayer,
          currIdx,
          roomId,
          final_team: keys[0],
          final_price: bids[keys[0]],
          bids,
        });
      }
    } else if (STATE == "FINAL-BID") {
      console.log("Final bid given");
      const targetSocketId = clients.get(currPlayer.prev_team_name);
      io.to(targetSocketId).emit("final-retain");
    } else {
      console.log("final selling");
      handlePlayerSold(keys, bids, currPlayer, roomId, team);
    }
  };
  socket.on("joinRoom", (team) => {
    if (team) {
      console.log("teamName", team);
      const { roomId, name } = team;
      socket.join(roomId);
      socket.teamName = name;
      socket.roomId = roomId;
      teams.push(team);
      clients.set(team.name, socket.id);

      io.to(roomId).emit("joined-room", {
        teams,
        message: `${name} has joined the room`,
      });
      if (teams.length == 2) {
        io.to(roomId).emit("team-complete", {
          message: "All teams have joined the auction room!!",
        });
        let timeLeftToStartAuction = 5;
        const teamInterval = setInterval(async () => {
          timeLeftToStartAuction--;
          if (timeLeftToStartAuction == 0) {
            clearInterval(teamInterval);
            io.to(roomId).emit("start-auction", {
              startTheAuction: true,
              currIdx: index,
            });
          } else {
            io.emit("timer-update", {
              timerTitle: "Auction Starts In ",
              timeLeft: timeLeftToStartAuction,
            });
          }
        }, 1000);
      }
    }
  });
  socket.on(
    "bid-player",
    ({ final_price, team, bids, logo, currPlayer, STATE }) => {
      console.log("team", team);
      if (teams.length == 2) {
        clearInterval(withdrawBidInterval);
        const keys = Object.keys(bids);
        const roomId = socket.roomId;
        console.log("the room id", roomId);
        const findPlayer = players.find(
          (player) => player.name == currPlayer.name
        );
        if (keys.length == 1 && !findPlayer) {
          withdrawBidTimeLeft = 10;
          withdrawBidInterval = setInterval(async () => {
            withdrawBidTimeLeft--;
            if (withdrawBidTimeLeft == 0) {
              io.emit("timer-update", {
                timerTitle: "",
                timeLeft: 0,
              });
              handleDecrease(
                keys,
                bids,
                currPlayer,
                index,
                roomId,
                team,
                STATE
              );
            } else {
              io.emit("timer-update", {
                timerTitle: `Player will be sold to ${keys[0]} In`,
                timeLeft: withdrawBidTimeLeft,
              });
            }
          }, 1000);
        }

        io.emit("team-bid", { final_price, team, bids, logo });
      }
    }
  );
  socket.on("check-unsold", ({ currPlayer, currIdx }) => {
    clearInterval(withdrawBidInterval);
    if (teams.length == 2) {
      withdrawBidTimeLeft = 10;
      withdrawBidInterval = setInterval(async () => {
        withdrawBidTimeLeft--;
        if (withdrawBidTimeLeft == 0) {
          clearInterval(withdrawBidInterval);
          const roomId = socket.roomId;
          try {
            const playerSoldTeam = await axios.put(
              `http://localhost:8001/player-sold?id=${roomId}`,
              {
                sold: false,
                playerDetail: currPlayer,
              }
            );

            const updatedTeam = playerSoldTeam.data; // Assuming updated team data is in playerSoldTeam.data
            console.log("updated team", updatedTeam);
            const teamIndex = teams.findIndex(
              (team) => team._id === updatedTeam._id
            );

            // Update the teams array with the new data if team is found
            if (teamIndex !== -1) {
              teams[teamIndex] = updatedTeam;
            } else {
              // Optionally, if team is not found, you can add it
              teams.push(updatedTeam);
            }
            console.log("teams", teams);
          } catch (err) {
            console.log("err", err);
          }
          io.emit("timer-update", {
            timerTitle: "",
            timeLeft: 0,
          });
          index++;
          io.emit("player-unsold", { currPlayer, currIdx: index });
        } else {
          io.emit("timer-update", {
            timerTitle: `No bids seen`,
            timeLeft: withdrawBidTimeLeft,
          });
        }
      }, 1000);
    }
  });
  socket.on("unsold-player", async ({ currPlayer, currIdx }) => {
    const roomId = socket.roomId;
    try {
      await axios.put(`http://localhost:8001/player-sold?id=${roomId}`, {
        sold: false,
        playerDetail: currPlayer,
      });
    } catch (err) {
      console.log("err", err);
    }

    io.emit("player-unsold", { currPlayer, currIdx });
  });
  socket.on("withraw-bid", async ({ team, bids, currPlayer, STATE }) => {
    console.log("the final-- ", team, bids, currPlayer, STATE);
    if (teams.length == 2) {
      const keys = Object.keys(bids);
      const roomId = socket.roomId;
      const findPlayer = players.find(
        (player) => player.name == currPlayer.name
      );
      clearInterval(withdrawBidInterval);
      if (STATE == "FINAL-BID") {
        withdrawBidTimeLeft = 0;
      } else {
        withdrawBidTimeLeft = 10;
      }

      if (keys.length == 1 && !findPlayer) {
        withdrawBidInterval = setInterval(async () => {
          withdrawBidTimeLeft--;
          if (withdrawBidTimeLeft == 0) {
            io.emit("timer-update", {
              timerTitle: "",
              timeLeft: 0,
            });
            console.log("STATE", team, STATE);
            handleDecrease(
              keys,
              bids,
              currPlayer,
              index,
              roomId,
              keys[0],
              STATE
            );
          } else {
            io.emit("timer-update", {
              timerTitle: `Player will be sold to ${keys[0]} In`,
              timeLeft: withdrawBidTimeLeft,
            });
          }
        }, 1000);
      } else if (!findPlayer) {
        io.emit("withdrawn-bid", { bids, team });
      }
    }
  });
  socket.on("load-next", ({ currPlayer, currIdx }) => {
    let timerToLoadNext = 5;
    const timerToLoadNextTimer = setInterval(() => {
      timerToLoadNext--;
      if (timerToLoadNext == 0) {
        clearInterval(timerToLoadNextTimer);
        io.emit("load-player", {
          currIdx,
          currPlayer,
          timerTitle: "",
          timeLeft: 0,
        });
      } else {
        io.emit("timer-update", {
          timerTitle: `Loading the Next Player In`,
          timeLeft: timerToLoadNext,
        });
      }
    }, 1000);
  });
  socket.on("rtm-request-accepted", async ({ currPlayer, bids }) => {
    console.log(bids);
    const keys = Object.keys(bids);
    console.log(keys, keys[0]);
    const teamRoomId = clients.get(keys[0]);

    io.emit("increase-bid", {
      currPlayer,
      newTeam: keys[0],
    });
  });
  socket.on("disconnect", () => {
    if (socket.teamName) {
      teams = teams.filter((team) => team.name !== socket.teamName);
      clients.forEach((id, userId) => {
        if (id === socket.id) {
          disconnectedUserId = userId;
          clients.delete(userId); // Remove the client
        }
      });
      io.emit("team-left", {
        teams,
        message: `${socket.teamName} has left the room`,
        startAuction: false,
      });
    }
  });
});
