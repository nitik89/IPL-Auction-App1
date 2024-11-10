const express = require("express");
const mongoose = require("mongoose");
const Auction = mongoose.model("Auction");
const Player = mongoose.model("players");
const Teams = mongoose.model("Teams");
const router = express.Router();

//"65f4aadf62e2639fbf836718"
router.get("/sold-players", async (req, res) => {
  try {
    const { id } = req.query;
    const auctionRoom = await Auction.findOne({ _id: id });
    res.status(200).json({
      message: "Players Fetched",
      soldPlayers: auctionRoom.playersSold,
    });
  } catch (err) {
    res.status(422).json({ message: "Could get the players" });
  }
});

router.get("/all-team-players", async (req, res) => {
  try {
    const { teamName } = req.query;
    const players = await Player.aggregate([
      {
        $match: { prev_team_name: teamName },
      },
      {
        $sort: { base_price: -1 }, // Sort players by teamName
      },
      {
        $group: { _id: "$role", players: { $push: "$$ROOT" } },
      },
    ]);
    res.status(200).json({
      message: "Players Fetched",
      players,
    });
  } catch (err) {
    console.log("err", err);
  }
});
router.get("/get-squad", async (req, res) => {
  try {
    const { id } = req.query;
    const auctionRoom = await Auction.findOne({ _id: id });
    res.status(200).json({
      message: "Squads Fetched",
      roomDetails: auctionRoom.teams,
    });
  } catch (err) {
    res.status(422).json({ message: "Could get the players" });
  }
});
router.get("/unsold-players", async (req, res) => {
  try {
    const { id } = req.query;
    const auctionRoom = await Auction.findOne({ _id: id });
    res.status(422).json({
      message: "Players Fetched",
      unsoldPlayers: auctionRoom.unsold,
    });
  } catch (err) {
    res.status(422).json({ message: "Could get the players" });
  }
});

router.get("/players-myteam", async (req, res) => {
  try {
    const { id, name } = req.query;
    const auctionRoom = await Auction.findOne({ _id: id });
    const { teams } = auctionRoom;
    teams.map((team) => {
      if (team.name == name) {
        return res.status(422).json({
          message: "Players Fetched",
          team,
        });
      }
    });
  } catch (err) {
    console.log(err);
    res.status(422).json({ message: "Could get the players", err });
  }
});
router.put("/player-sold", async (req, res) => {
  try {
    const { id } = req.query;
    const { teamName, playerDetail, sold } = req.body;
    const { final_price } = playerDetail;
    console.log(playerDetail);
    if (sold) {
      await Auction.findOneAndUpdate(
        { _id: id, "teams.name": teamName },
        {
          $push: { playersSold: playerDetail, "teams.$.players": playerDetail },
          $inc: { "teams.$.purse": -final_price },
        },
        { new: true }
      );
      res.status(200).json({ message: "Player Saved" });
    } else {
      await Auction.findOneAndUpdate(
        { _id: id },
        {
          $push: { unsold: playerDetail },
        },
        { new: true }
      );
      res.status(200).json({ message: "Player Saved" });
    }
  } catch (err) {
    console.log(err);
    res.status(422).json({ message: "Error spotted", err });
  }
});

router.get("/create-room", async (req, res) => {
  //   console.log(req.body);

  const teams = await Teams.find();
  console.log(teams);

  try {
    const newRoom = new Auction({ teams, unsold: [], playersSold: [] });
    const auctionRoom = await newRoom.save();
    res.status(200).json({ message: "Room Created", auctionRoom });
  } catch (err) {
    res.status(200).json({ err: "error is there" });
  }
});

router.get("/check-room", async (req, res) => {
  try {
    const { id } = req.query;
    const auctionRoom = await Auction.findOne({ _id: id });
    let found = false;
    if (auctionRoom) {
      found = true;
    }
    res.status(200).json({ message: "Room Created", found });
  } catch (err) {
    console.log(err);
    res.status(200).json({ err: "error is there", found: false });
  }
});

router.get("/get-team", async (req, res) => {
  try {
    const teams = await Teams.find();
    res.status(200).json({ teams });
  } catch (err) {
    console.log(err);
    res.status(200).json({ err: "error is there in fetching the teams" });
  }
});

router.get("/get-auction-players", async (req, res) => {
  try {
    const { id } = req.query;
    const auctionRoom = await Auction.findOne({ _id: id });
    console.log(auctionRoom);
    const soldPlayers = auctionRoom.playersSold;
    const unSoldPlayers = auctionRoom.unsold;
    const playersNotBeShown = [...unSoldPlayers, ...soldPlayers].map(
      (player) => player._id
    );
    const players = await Player.find({ _id: { $nin: playersNotBeShown } });

    res.status(200).json({ message: "Auction Players", players });
  } catch (err) {
    console.log(err);
    res
      .status(200)
      .json({ err: "error is there in fetching the auction room" });
  }
});

router.post("/retain-player", async (req, res) => {
  const { retainedPlayers, teamName, amount, auctionId } = req.body;
  console.log(auctionId, teamName, retainedPlayers);
  try {
    const auction = await Auction.findOneAndUpdate(
      { _id: auctionId, "teams.name": teamName },
      {
        $push: {
          "teams.$.players": { $each: retainedPlayers },
          playersSold: { $each: retainedPlayers },
        },
        $set: { "teams.$.purse": amount },
      },

      { new: true } // Return the updated document
    );
    res.status(200).json(auction);
  } catch (err) {
    console.log(err);
    res
      .status(200)
      .json({ err: "error is there in fetching the auction room" });
  }
});
//672e1dbfd3023c53ccb6e73e
module.exports = router;
