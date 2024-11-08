const mongoose = require("mongoose");
const playerSchema = require("./player");
const auctionSchema = new mongoose.Schema(
  {
    teams: {
      type: Array,
      required: true,
    },
    unsold: {
      type: [playerSchema],
      required: true,
    },
    playersSold: {
      type: [playerSchema],
      required: true,
    },
  },
  { timestamps: true }
);

mongoose.model("Auction", auctionSchema);
