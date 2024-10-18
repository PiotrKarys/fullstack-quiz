const mongoose = require("mongoose");

const blacklistSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: "7d", // Token wygaśnie po 7 dniach
  },
});

blacklistSchema.index({ token: 1, userId: 1 });

const Blacklist = mongoose.model("Blacklist", blacklistSchema);

module.exports = Blacklist;
