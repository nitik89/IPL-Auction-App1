const mongoose = require("mongoose");
const teamsSchema = new mongoose.Schema(
  {
    teamName: String,
    image: String,
    purse: Number,
    players: Array,
  },
  { timestamps: true }
);

mongoose.model("Teams", teamsSchema);
