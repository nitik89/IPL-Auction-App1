const mongoose = require("mongoose");
const playerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  image: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  prev_team_name: {
    type: String,
    required: true,
  },
  is_uncapped: {
    type: Boolean,
    required: true,
  },
  base_price: {
    type: Number,
    required: true,
  },

  is_indian: {
    type: Boolean,
    required: true,
  },

  is_retained: {
    type: Boolean,
    required: true,
  },
  is_sold: {
    type: Boolean,
    required: true,
  },
  final_price: {
    type: Number,
    required: true,
  },
});

mongoose.model("players", playerSchema);
module.exports = playerSchema;
