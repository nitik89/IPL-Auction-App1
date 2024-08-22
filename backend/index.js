const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const axios = require("axios");
const mongoose = require("mongoose");
const app = express();
require("./models/auction");
dotenv.config();
const { MONGO_URL } = process.env;
const PORT = 8000;

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
    origin: "http://localhost:3000",
  },
});
let teams = [];
let players = [];
let withdrawBidInterval;
let withdrawBidTimeLeft = 0;
let index = 0;
io.on("connection", (socket) => {
  console.log("connected to socket.io");

  const decreasePurse = (teamName, amount) => {
    const team = teams.find((team) => team.name === teamName);
    if (team) {
      team.purse -= amount;
      return true; // Indicates team found and purse decreased
    }
    return false; // Indicates team not found
  };

  const handleDecrease = async (
    keys,
    bids,
    currPlayer,
    currIdx,
    roomId,
    team
  ) => {
    clearInterval(withdrawBidInterval);
    console.log("player is sold to this team");
    decreasePurse(keys[0], bids[keys[0]]);
    const finalPlayerData = { ...currPlayer, team: keys[0] };
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
      await axios.put(`http://localhost:8000/player-sold?id=${roomId}`, {
        sold: true,
        teamName: keys[0],
        playerDetail: finalPlayerData,
      });
    } catch (err) {
      console.log("err", err);
    }
  };
  socket.on("joinRoom", ({ name, logo, purse, roomId }) => {
    socket.join(roomId);
    socket.teamName = name;
    socket.roomId = roomId;
    console.log(name);
    teams.push({ name, logo, purse });

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
  });

  socket.on("bid-player", ({ price, team, bids, logo, currPlayer }) => {
    if (teams.length == 2) {
      clearInterval(withdrawBidInterval);
      const keys = Object.keys(bids);
      const roomId = socket.roomId;
      const findPlayer = players.find(
        (player) => player.name == currPlayer.name
      );

      console.log("singlebid", keys);

      if (keys.length == 1 && !findPlayer) {
        withdrawBidTimeLeft = 10;
        console.log("condition enetered");
        withdrawBidInterval = setInterval(async () => {
          withdrawBidTimeLeft--;
          if (withdrawBidTimeLeft == 0) {
            io.emit("timer-update", {
              timerTitle: "",
              timeLeft: 0,
            });
            handleDecrease(keys, bids, currPlayer, index, roomId, team);
          } else {
            console.log("timer", withdrawBidTimeLeft);
            io.emit("timer-update", {
              timerTitle: `Player will be sold to ${keys[0]} In`,
              timeLeft: withdrawBidTimeLeft,
            });
          }
        }, 1000);
      }

      io.emit("team-bid", { price, team, bids, logo });
    }
  });
  socket.on("check-unsold", ({ currPlayer, currIdx }) => {
    console.log("my curr player ---", currPlayer, currIdx);
    clearInterval(withdrawBidInterval);
    if (teams.length == 2) {
      withdrawBidTimeLeft = 10;
      withdrawBidInterval = setInterval(async () => {
        withdrawBidTimeLeft--;
        if (withdrawBidTimeLeft == 0) {
          clearInterval(withdrawBidInterval);
          const roomId = socket.roomId;
          try {
            await axios.put(`http://localhost:8000/player-sold?id=${roomId}`, {
              sold: false,
              playerDetail: currPlayer,
            });
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
          console.log("timer", withdrawBidTimeLeft);
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
      await axios.put(`http://localhost:8000/player-sold?id=${roomId}`, {
        sold: false,
        playerDetail: currPlayer,
      });
    } catch (err) {
      console.log("err", err);
    }

    io.emit("player-unsold", { currPlayer, currIdx });
  });
  socket.on("withraw-bid", async ({ team, bids, currPlayer, currIdx }) => {
    if (teams.length == 2) {
      const keys = Object.keys(bids);
      const roomId = socket.roomId;
      console.log("rrom", roomId, keys);
      const findPlayer = players.find(
        (player) => player.name == currPlayer.name
      );
      clearInterval(withdrawBidInterval);
      withdrawBidTimeLeft = 10;
      if (keys.length == 1 && !findPlayer) {
        console.log("condition enetered");
        withdrawBidInterval = setInterval(async () => {
          withdrawBidTimeLeft--;
          if (withdrawBidTimeLeft == 0) {
            io.emit("timer-update", {
              timerTitle: "",
              timeLeft: 0,
            });
            handleDecrease(keys, bids, currPlayer, index, roomId, team);
          } else {
            console.log("timer", withdrawBidTimeLeft);
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
        console.log("my timerrr --", timerToLoadNext);
        io.emit("timer-update", {
          timerTitle: `Loading the Next Player In`,
          timeLeft: timerToLoadNext,
        });
      }
    }, 1000);
  });
  socket.on("disconnect", () => {
    if (socket.teamName) {
      teams = teams.filter((team) => team.name !== socket.teamName);
      console.log(teams);
      io.emit("team-left", {
        teams,
        message: `${socket.teamName} has left the room`,
        startAuction: false,
      });
    }
  });
});
