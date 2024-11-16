const mongoose = require("mongoose");
const teamsSchema = new mongoose.Schema(
  {
    teamName: String,
    image: String,
    purse: Number,
    players: Array,
    cappedRTM: Number,
    uncappedRTM: Number,
    primaryColor: String,
    secondaryColor: String,
  },
  { timestamps: true }
);

mongoose.model("Teams", teamsSchema);
